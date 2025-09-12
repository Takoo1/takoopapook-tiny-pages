
-- Expand public read access to include 'online' and 'booking_stopped' where appropriate
-- and restrict booking to only when a game is 'online'.

-- 1) lottery_books: allow viewing for online, booking_stopped, or live; keep admin/owner access
ALTER POLICY "View books for live or owned games"
  ON public.lottery_books
  USING (
    EXISTS (
      SELECT 1
      FROM public.lottery_games g
      WHERE g.id = lottery_books.lottery_game_id
        AND (
          g.status = ANY (ARRAY['live'::game_status, 'online'::game_status, 'booking_stopped'::game_status])
          OR has_role(auth.uid(), 'admin'::app_role)
          OR g.created_by_user_id = auth.uid()
        )
    )
  );

-- 2) lottery_tickets: allow viewing for online, booking_stopped, or live; keep admin/owner access
ALTER POLICY "View tickets for live or owned games"
  ON public.lottery_tickets
  USING (
    EXISTS (
      SELECT 1
      FROM public.lottery_games g
      WHERE g.id = lottery_tickets.lottery_game_id
        AND (
          g.status = ANY (ARRAY['live'::game_status, 'online'::game_status, 'booking_stopped'::game_status])
          OR has_role(auth.uid(), 'admin'::app_role)
          OR g.created_by_user_id = auth.uid()
        )
    )
  );

-- 3) lottery_prizes: allow viewing for online, booking_stopped, or live; keep admin/owner access
ALTER POLICY "View prizes for live or owned games"
  ON public.lottery_prizes
  USING (
    EXISTS (
      SELECT 1
      FROM public.lottery_games g
      WHERE g.id = lottery_prizes.lottery_game_id
        AND (
          g.status = ANY (ARRAY['live'::game_status, 'online'::game_status, 'booking_stopped'::game_status])
          OR has_role(auth.uid(), 'admin'::app_role)
          OR g.created_by_user_id = auth.uid()
        )
    )
  );

-- 4) lottery_terms: allow viewing for online, booking_stopped, or live; keep admin/owner access
ALTER POLICY "View terms for live or owned games"
  ON public.lottery_terms
  USING (
    EXISTS (
      SELECT 1
      FROM public.lottery_games g
      WHERE g.id = lottery_terms.lottery_game_id
        AND (
          g.status = ANY (ARRAY['live'::game_status, 'online'::game_status, 'booking_stopped'::game_status])
          OR has_role(auth.uid(), 'admin'::app_role)
          OR g.created_by_user_id = auth.uid()
        )
    )
  );

-- 5) lottery_organising_committee: allow viewing for online, booking_stopped, or live; keep admin/owner access
ALTER POLICY "View committee for live or owned games"
  ON public.lottery_organising_committee
  USING (
    EXISTS (
      SELECT 1
      FROM public.lottery_games g
      WHERE g.id = lottery_organising_committee.lottery_game_id
        AND (
          g.status = ANY (ARRAY['live'::game_status, 'online'::game_status, 'booking_stopped'::game_status])
          OR has_role(auth.uid(), 'admin'::app_role)
          OR g.created_by_user_id = auth.uid()
        )
    )
  );

-- 6) Restrict booking to only when the game is 'online'
--    Keep requirement that the ticket row transitions to 'sold_online'
ALTER POLICY "Anyone can update available tickets to book them"
  ON public.lottery_tickets
  USING (
    status = 'available'::text
    AND EXISTS (
      SELECT 1
      FROM public.lottery_games g
      WHERE g.id = lottery_tickets.lottery_game_id
        AND g.status = 'online'::game_status
    )
  )
  WITH CHECK (status = 'sold_online'::text);
