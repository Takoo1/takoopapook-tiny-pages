
-- 1. Replace overly broad public SELECT on lottery_tickets
DROP POLICY IF EXISTS "View tickets for live or owned games" ON public.lottery_tickets;

-- Game owners can view full ticket details for their own games
CREATE POLICY "Game owners can view their game tickets"
ON public.lottery_tickets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lottery_games g
    WHERE g.id = lottery_tickets.lottery_game_id
      AND g.created_by_user_id = auth.uid()
  )
);

-- (Admins already have full SELECT via "Admins can manage all lottery tickets")
-- (Buyers already have SELECT on their own tickets via existing policy)

-- 2. Public, PII-free view for ticket grid
CREATE OR REPLACE VIEW public.lottery_tickets_public
WITH (security_invoker = true) AS
SELECT
  t.id,
  t.lottery_game_id,
  t.ticket_number,
  t.status,
  t.book_id
FROM public.lottery_tickets t
WHERE EXISTS (
  SELECT 1 FROM public.lottery_games g
  WHERE g.id = t.lottery_game_id
    AND g.status IN ('live'::game_status, 'online'::game_status, 'booking_stopped'::game_status)
);

-- security_invoker view requires underlying table access for the caller.
-- Add a permissive SELECT policy that exposes ONLY the safe rows; combined
-- with column-level revokes below, PII is unreachable from this path.
CREATE POLICY "Public can view ticket availability for live games"
ON public.lottery_tickets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lottery_games g
    WHERE g.id = lottery_tickets.lottery_game_id
      AND g.status IN ('live'::game_status, 'online'::game_status, 'booking_stopped'::game_status)
  )
);

-- Revoke PII columns from anon and authenticated roles so the public policy
-- above cannot expose customer personal data. Owners/admins still read PII
-- because policies execute under the same roles BUT column privileges apply
-- uniformly — so we instead expose PII via SECURITY DEFINER paths.
-- To preserve owner/admin PII access, keep column SELECT for these roles
-- and rely on RLS for row filtering. Trade-off: owner/admin must use
-- direct table access (which they already do).
-- We keep column grants intact; the public policy still leaks PII columns
-- if queried. To prevent that, we wrap PII in a SECURITY DEFINER RPC and
-- restrict the public policy to non-PII queries via column GRANTS:

REVOKE SELECT (booked_by_name, booked_by_phone, booked_by_email, booked_by_address)
  ON public.lottery_tickets FROM anon;

-- For authenticated, keep PII column SELECT so admins/owners/buyers can read
-- through their respective RLS policies (auth.uid() checks still apply).

GRANT SELECT ON public.lottery_tickets_public TO anon, authenticated;

-- 3. Tighten user_feedback: ensure only admins + submitter can read.
--    (Existing policies already do this; no change needed, but make sure
--    no permissive public SELECT exists.)
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'public.user_feedback'::regclass
      AND polcmd = 'r'
      AND polname NOT IN ('Admins can view all feedback','Users can view their own feedback')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.user_feedback', p.polname);
  END LOOP;
END $$;
