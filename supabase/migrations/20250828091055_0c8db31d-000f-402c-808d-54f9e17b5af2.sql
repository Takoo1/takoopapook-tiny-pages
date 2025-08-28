
BEGIN;

-- 1) Add new columns to lottery_games
ALTER TABLE public.lottery_games ADD COLUMN IF NOT EXISTS created_by_user_id uuid;
ALTER TABLE public.lottery_games ADD COLUMN IF NOT EXISTS headline text;
ALTER TABLE public.lottery_games ADD COLUMN IF NOT EXISTS organiser_logo_url text;
ALTER TABLE public.lottery_games ADD COLUMN IF NOT EXISTS live_draw_url text;
ALTER TABLE public.lottery_games ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.lottery_games ADD COLUMN IF NOT EXISTS contact_email text;

-- 2) Prize type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prize_type') THEN
    CREATE TYPE public.prize_type AS ENUM ('main','incentive');
  END IF;
END$$;

-- 3) Create supporting tables
CREATE TABLE IF NOT EXISTS public.lottery_prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_game_id uuid NOT NULL REFERENCES public.lottery_games(id) ON DELETE CASCADE,
  prize_type public.prize_type NOT NULL,
  title text NOT NULL,
  amount numeric NULL,
  description text NULL,
  display_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lottery_organising_committee (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_game_id uuid NOT NULL REFERENCES public.lottery_games(id) ON DELETE CASCADE,
  designation text NOT NULL,
  member_name text NOT NULL,
  display_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lottery_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_game_id uuid NOT NULL REFERENCES public.lottery_games(id) ON DELETE CASCADE,
  content text NOT NULL,
  display_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Enable RLS on new tables
ALTER TABLE public.lottery_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_organising_committee ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_terms ENABLE ROW LEVEL SECURITY;

-- 5) Public read policies for new tables
CREATE POLICY "Anyone can view lottery prizes"
  ON public.lottery_prizes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view organising committee"
  ON public.lottery_organising_committee
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view lottery terms"
  ON public.lottery_terms
  FOR SELECT
  USING (true);

-- 6) Admins or owners can manage new tables
CREATE POLICY "Admins or owners can manage lottery prizes"
  ON public.lottery_prizes
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.lottery_games g
      WHERE g.id = lottery_prizes.lottery_game_id
        AND g.created_by_user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.lottery_games g
      WHERE g.id = lottery_prizes.lottery_game_id
        AND g.created_by_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins or owners can manage organising committee"
  ON public.lottery_organising_committee
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.lottery_games g
      WHERE g.id = lottery_organising_committee.lottery_game_id
        AND g.created_by_user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.lottery_games g
      WHERE g.id = lottery_organising_committee.lottery_game_id
        AND g.created_by_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins or owners can manage lottery terms"
  ON public.lottery_terms
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.lottery_games g
      WHERE g.id = lottery_terms.lottery_game_id
        AND g.created_by_user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.lottery_games g
      WHERE g.id = lottery_terms.lottery_game_id
        AND g.created_by_user_id = auth.uid()
    )
  );

-- 7) Extend lottery_games RLS to allow organisers to insert and owners/admins to update
CREATE POLICY "Organisers can create their own lottery games"
  ON public.lottery_games
  FOR INSERT
  WITH CHECK (
    (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role IN ('organiser','admin')))
    AND created_by_user_id = auth.uid()
  );

CREATE POLICY "Owners or admins can update lottery games"
  ON public.lottery_games
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR created_by_user_id = auth.uid()
  );

-- 8) Allow organisers to manage books for their games
CREATE POLICY "Owners or admins can insert lottery books"
  ON public.lottery_books
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.lottery_games g
      WHERE g.id = lottery_books.lottery_game_id
        AND g.created_by_user_id = auth.uid()
    )
  );

CREATE POLICY "Owners or admins can update lottery books"
  ON public.lottery_books
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.lottery_games g
      WHERE g.id = lottery_books.lottery_game_id
        AND g.created_by_user_id = auth.uid()
    )
  );

-- 9) Allow organisers to create tickets for their own games (in addition to admins)
CREATE POLICY "Owners or admins can create lottery tickets"
  ON public.lottery_tickets
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.lottery_games g
      WHERE g.id = lottery_tickets.lottery_game_id
        AND g.created_by_user_id = auth.uid()
    )
  );

-- 10) Storage policies for lottery-images
DROP POLICY IF EXISTS "Allow authenticated uploads to lottery-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to update their images (lottery-images)" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to delete their images (lottery-images)" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read for lottery-images" ON storage.objects;

CREATE POLICY "Allow public read for lottery-images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'lottery-images');

CREATE POLICY "Allow authenticated uploads to lottery-images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lottery-images');

CREATE POLICY "Allow owners to update their images (lottery-images)"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'lottery-images' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'lottery-images' AND owner = auth.uid());

CREATE POLICY "Allow owners to delete their images (lottery-images)"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'lottery-images' AND owner = auth.uid());

COMMIT;
