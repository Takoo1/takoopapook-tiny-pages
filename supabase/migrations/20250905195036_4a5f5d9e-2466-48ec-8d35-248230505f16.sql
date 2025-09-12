-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- First, remove any existing lottery status update jobs
SELECT cron.unschedule('update-lottery-statuses');

-- Fix the update function with proper timezone handling and permissions
CREATE OR REPLACE FUNCTION public.update_lottery_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  updated_booking_stopped integer := 0;
  updated_live integer := 0;
begin
  -- Allow automatic transitions by setting the config
  perform set_config('app.allow_status_change', 'true', true);
  
  raise notice 'Starting lottery status update at %', now();
  
  -- Online -> Booking Stopped at stop_booking_time
  -- Convert stored UTC time to organizer's local timezone for comparison
  update public.lottery_games
  set status = 'booking_stopped'::game_status,
      updated_at = now()
  where status = 'online'::game_status
    and stop_booking_time is not null
    and organizer_timezone is not null
    and (stop_booking_time AT TIME ZONE 'UTC' AT TIME ZONE organizer_timezone) <= (now() AT TIME ZONE organizer_timezone);
    
  get diagnostics updated_booking_stopped = row_count;
  raise notice 'Updated % games to booking_stopped', updated_booking_stopped;

  -- Online/Booking Stopped -> Live at game_date
  -- Convert stored UTC time to organizer's local timezone for comparison  
  update public.lottery_games
  set status = 'live'::game_status,
      updated_at = now()
  where status in ('online'::game_status, 'booking_stopped'::game_status)
    and game_date is not null
    and organizer_timezone is not null
    and (game_date AT TIME ZONE 'UTC' AT TIME ZONE organizer_timezone) <= (now() AT TIME ZONE organizer_timezone);
    
  get diagnostics updated_live = row_count;
  raise notice 'Updated % games to live', updated_live;
  raise notice 'Completed lottery status update at %', now();
end;
$function$;

-- Create the cron job to run every minute
SELECT cron.schedule(
  'update-lottery-statuses',
  '* * * * *',
  $$
  SELECT public.update_lottery_statuses();
  $$
);

-- Test the function manually once
SELECT public.update_lottery_statuses();