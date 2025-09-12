-- Fix the automatic status update function to handle timezone conversions properly
-- The issue is that dates are stored as local time in ISO format, so we need to 
-- interpret them as being in the organizer's timezone when comparing with UTC now()

CREATE OR REPLACE FUNCTION public.update_lottery_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  -- Allow automatic transitions in the trigger via a guarded setting
  perform set_config('app.allow_status_change', 'true', true);

  -- Add logging for debugging
  raise notice 'Starting lottery status update at %', now();

  -- Online -> Booking Stopped at stop_booking_time
  -- The stored time represents the local time in the organizer's timezone
  update public.lottery_games
  set status = 'booking_stopped'::game_status,
      updated_at = now()
  where status = 'online'::game_status
    and stop_booking_time is not null
    and organizer_timezone is not null
    and now() >= (stop_booking_time::timestamp AT TIME ZONE organizer_timezone);

  raise notice 'Updated % games to booking_stopped', (select count(*) from public.lottery_games where status = 'booking_stopped' and updated_at > now() - interval '1 minute');

  -- Online/Booking Stopped -> Live at game_date
  -- The stored time represents the local time in the organizer's timezone
  update public.lottery_games
  set status = 'live'::game_status,
      updated_at = now()
  where status in ('online'::game_status, 'booking_stopped'::game_status)
    and game_date is not null
    and organizer_timezone is not null
    and now() >= (game_date::timestamp AT TIME ZONE organizer_timezone);

  raise notice 'Updated % games to live', (select count(*) from public.lottery_games where status = 'live' and updated_at > now() - interval '1 minute');
  raise notice 'Completed lottery status update at %', now();
end;
$function$