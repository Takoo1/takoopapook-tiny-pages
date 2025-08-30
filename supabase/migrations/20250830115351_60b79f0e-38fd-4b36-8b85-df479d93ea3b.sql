-- Create cron job to update lottery statuses every minute
-- This will automatically transition games from online -> booking_stopped -> live based on timestamps

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cron job to run every minute
SELECT cron.schedule(
  'update-lottery-statuses',
  '* * * * *', -- every minute
  $$
  SELECT public.update_lottery_statuses();
  $$
);