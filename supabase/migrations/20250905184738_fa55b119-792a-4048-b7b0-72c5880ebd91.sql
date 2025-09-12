-- Add timezone column to lottery_games table to store organizer's timezone
ALTER TABLE public.lottery_games ADD COLUMN organizer_timezone TEXT DEFAULT 'UTC';

-- Update existing records to use UTC as default
UPDATE public.lottery_games SET organizer_timezone = 'UTC' WHERE organizer_timezone IS NULL;

-- Update the lottery status update function to handle timezones correctly
CREATE OR REPLACE FUNCTION public.update_lottery_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  -- Allow automatic transitions in the trigger via a guarded setting
  perform set_config('app.allow_status_change', 'true', true);

  -- Online -> Booking Stopped at stop_booking_time (convert from organizer timezone)
  update public.lottery_games
  set status = 'booking_stopped'::game_status,
      updated_at = now()
  where status = 'online'::game_status
    and stop_booking_time is not null
    and organizer_timezone is not null
    and now() >= (stop_booking_time AT TIME ZONE organizer_timezone AT TIME ZONE 'UTC');

  -- Online/Booking Stopped -> Live at game_date (convert from organizer timezone)
  update public.lottery_games
  set status = 'live'::game_status,
      updated_at = now()
  where status in ('online'::game_status, 'booking_stopped'::game_status)
    and game_date is not null
    and organizer_timezone is not null
    and now() >= (game_date AT TIME ZONE organizer_timezone AT TIME ZONE 'UTC');
end;
$function$;

-- Set up cron job to call the status update function every minute
SELECT cron.schedule(
    'update-lottery-statuses-job',
    '* * * * *', -- every minute
    $$
    SELECT net.http_post(
        url := 'https://bramvnherjbaiakwfvwb.supabase.co/functions/v1/update-lottery-statuses',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyYW12bmhlcmpiYWlha3dmdndiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzUxNjk3NCwiZXhwIjoyMDY5MDkyOTc0fQ.MzHNXc6wGPUh5LpPRKfO-Tyl_dblzEXNAOCbfQsGJvw"}'::jsonb,
        body := '{"scheduled": true}'::jsonb
    ) as request_id;
    $$
);