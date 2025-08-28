
BEGIN;

-- Ensure RLS is enabled (harmless if already enabled)
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;

-- Replace the update policy to allow only available -> sold_online transitions
DROP POLICY IF EXISTS "Anyone can update available tickets to book them" ON public.lottery_tickets;

CREATE POLICY "Anyone can update available tickets to book them"
  ON public.lottery_tickets
  FOR UPDATE
  USING (status = 'available')
  WITH CHECK (status = 'sold_online');

-- One-time cleanup: remove all offline sold marks from the app data
UPDATE public.lottery_tickets
SET status = 'available'
WHERE status = 'sold_offline';

COMMIT;
