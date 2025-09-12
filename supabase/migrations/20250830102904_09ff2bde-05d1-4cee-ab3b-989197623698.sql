-- Update RLS policies to allow public viewing of online, booking_stopped, and live games

-- 1) Update the public SELECT policy for lottery_games to include online, booking_stopped, and live
DROP POLICY IF EXISTS "Public can view live lottery games" ON public.lottery_games;

CREATE POLICY "Public can view live, online, and booking stopped games" 
ON public.lottery_games 
FOR SELECT 
USING (status IN ('live'::game_status, 'online'::game_status, 'booking_stopped'::game_status));

-- 2) Update the game_is_live_or_owned function to include online and booking_stopped statuses
CREATE OR REPLACE FUNCTION public.game_is_live_or_owned(
  p_game_id uuid,
  p_user_id uuid default auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  select exists (
    select 1
    from public.lottery_games g
    where g.id = p_game_id
      and (
        g.status IN ('live'::game_status, 'online'::game_status, 'booking_stopped'::game_status)
        or g.created_by_user_id = p_user_id
        or public.has_role(p_user_id, 'admin'::app_role)
      )
  );
$$;