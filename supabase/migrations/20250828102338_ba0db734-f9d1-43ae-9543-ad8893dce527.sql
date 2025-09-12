
-- 1) Create enum for game status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_status') THEN
    CREATE TYPE public.game_status AS ENUM ('pending', 'live', 'ended');
  END IF;
END
$$;

-- 2) Add status column to lottery_games (default to 'pending' for new games)
ALTER TABLE public.lottery_games
  ADD COLUMN IF NOT EXISTS status public.game_status NOT NULL DEFAULT 'pending';

-- 3) Backfill existing games to 'live' so the current site stays visible
UPDATE public.lottery_games
SET status = 'live'
WHERE status IS NULL OR status = 'pending';

-- 4) Optional index for faster filtering
CREATE INDEX IF NOT EXISTS idx_lottery_games_status ON public.lottery_games(status);

-- 5) Ensure only admins can change status: validation trigger
CREATE OR REPLACE FUNCTION public.prevent_status_update_by_non_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only protect when the status actually changes
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can change game status';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger (if not already exists)
DROP TRIGGER IF EXISTS trg_prevent_status_update_by_non_admin ON public.lottery_games;
CREATE TRIGGER trg_prevent_status_update_by_non_admin
BEFORE UPDATE ON public.lottery_games
FOR EACH ROW
EXECUTE FUNCTION public.prevent_status_update_by_non_admin();

-- 6) Update RLS to control visibility site-wide

-- lottery_games
DROP POLICY IF EXISTS "Anyone can view lottery games" ON public.lottery_games;

-- Admins can view all
CREATE POLICY "Admins can view all lottery games"
ON public.lottery_games
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Public (non-admin) can view only live games
CREATE POLICY "Public can view live lottery games"
ON public.lottery_games
FOR SELECT
USING (status = 'live');

-- Organisers can view their own games (pending/live/ended)
CREATE POLICY "Organisers can view their own lottery games"
ON public.lottery_games
FOR SELECT
USING (created_by_user_id = auth.uid());

-- 7) Tighten dependent tables to hide non-live games from the public while allowing admin/owner access

-- lottery_books
DROP POLICY IF EXISTS "Anyone can view lottery books" ON public.lottery_books;
CREATE POLICY "View books for live or owned games"
ON public.lottery_books
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lottery_games g
    WHERE g.id = public.lottery_books.lottery_game_id
      AND (
        g.status = 'live'
        OR public.has_role(auth.uid(), 'admin')
        OR g.created_by_user_id = auth.uid()
      )
  )
);

-- lottery_tickets
DROP POLICY IF EXISTS "Anyone can view lottery tickets" ON public.lottery_tickets;
CREATE POLICY "View tickets for live or owned games"
ON public.lottery_tickets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lottery_games g
    WHERE g.id = public.lottery_tickets.lottery_game_id
      AND (
        g.status = 'live'
        OR public.has_role(auth.uid(), 'admin')
        OR g.created_by_user_id = auth.uid()
      )
  )
);

-- lottery_prizes
DROP POLICY IF EXISTS "Anyone can view lottery prizes" ON public.lottery_prizes;
CREATE POLICY "View prizes for live or owned games"
ON public.lottery_prizes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lottery_games g
    WHERE g.id = public.lottery_prizes.lottery_game_id
      AND (
        g.status = 'live'
        OR public.has_role(auth.uid(), 'admin')
        OR g.created_by_user_id = auth.uid()
      )
  )
);

-- lottery_terms
DROP POLICY IF EXISTS "Anyone can view lottery terms" ON public.lottery_terms;
CREATE POLICY "View terms for live or owned games"
ON public.lottery_terms
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lottery_games g
    WHERE g.id = public.lottery_terms.lottery_game_id
      AND (
        g.status = 'live'
        OR public.has_role(auth.uid(), 'admin')
        OR g.created_by_user_id = auth.uid()
      )
  )
);

-- lottery_organising_committee
DROP POLICY IF EXISTS "Anyone can view organising committee" ON public.lottery_organising_committee;
CREATE POLICY "View committee for live or owned games"
ON public.lottery_organising_committee
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lottery_games g
    WHERE g.id = public.lottery_organising_committee.lottery_game_id
      AND (
        g.status = 'live'
        OR public.has_role(auth.uid(), 'admin')
        OR g.created_by_user_id = auth.uid()
      )
  )
);

-- fortune_counter_resets
DROP POLICY IF EXISTS "Anyone can view fortune counter resets" ON public.fortune_counter_resets;
CREATE POLICY "View fortune counter resets for live or owned games"
ON public.fortune_counter_resets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lottery_games g
    WHERE g.id = public.fortune_counter_resets.lottery_game_id
      AND (
        g.status = 'live'
        OR public.has_role(auth.uid(), 'admin')
        OR g.created_by_user_id = auth.uid()
      )
  )
);

-- 8) Admin-only purge function to permanently delete a game and all its data
CREATE OR REPLACE FUNCTION public.purge_lottery_game(p_game_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow only admins to purge
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can permanently delete games';
  END IF;

  -- Delete dependent records first (no FKs present, so manual cleanup)
  DELETE FROM public.lottery_tickets WHERE lottery_game_id = p_game_id;
  DELETE FROM public.lottery_books WHERE lottery_game_id = p_game_id;
  DELETE FROM public.lottery_prizes WHERE lottery_game_id = p_game_id;
  DELETE FROM public.lottery_terms WHERE lottery_game_id = p_game_id;
  DELETE FROM public.lottery_organising_committee WHERE lottery_game_id = p_game_id;
  DELETE FROM public.fortune_counter_resets WHERE lottery_game_id = p_game_id;

  -- Finally delete the game
  DELETE FROM public.lottery_games WHERE id = p_game_id;
END;
$function$;
