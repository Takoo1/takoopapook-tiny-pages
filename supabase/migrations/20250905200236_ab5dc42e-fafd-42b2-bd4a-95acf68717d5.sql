-- Fix timezone conversion logic in update_lottery_statuses function
CREATE OR REPLACE FUNCTION public.update_lottery_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow automatic transitions in the trigger via a guarded setting
  PERFORM set_config('app.allow_status_change', 'true', true);

  -- Add detailed logging for debugging
  RAISE NOTICE 'Starting lottery status update at % UTC', now();
  
  -- Log current games and their times
  RAISE NOTICE 'Current games status check:';
  PERFORM (
    SELECT RAISE NOTICE 'Game: %, Status: %, Stop Booking: % (in %), Game Date: % (in %), Current time in %: %', 
      title, status, 
      stop_booking_time, organizer_timezone,
      game_date, organizer_timezone,
      organizer_timezone, (now() AT TIME ZONE organizer_timezone)
    FROM lottery_games 
    WHERE status IN ('online', 'booking_stopped') 
      AND organizer_timezone IS NOT NULL
  );

  -- Online -> Booking Stopped at stop_booking_time
  -- Convert current UTC time to organizer's timezone and compare with stored local time
  UPDATE public.lottery_games
  SET status = 'booking_stopped'::game_status,
      updated_at = now()
  WHERE status = 'online'::game_status
    AND stop_booking_time IS NOT NULL
    AND organizer_timezone IS NOT NULL
    AND (now() AT TIME ZONE organizer_timezone)::timestamp >= stop_booking_time::timestamp;

  RAISE NOTICE 'Updated % games to booking_stopped', 
    (SELECT count(*) FROM public.lottery_games WHERE status = 'booking_stopped' AND updated_at > now() - interval '1 minute');

  -- Online/Booking Stopped -> Live at game_date
  -- Convert current UTC time to organizer's timezone and compare with stored local time
  UPDATE public.lottery_games
  SET status = 'live'::game_status,
      updated_at = now()
  WHERE status IN ('online'::game_status, 'booking_stopped'::game_status)
    AND game_date IS NOT NULL
    AND organizer_timezone IS NOT NULL
    AND (now() AT TIME ZONE organizer_timezone)::timestamp >= game_date::timestamp;

  RAISE NOTICE 'Updated % games to live', 
    (SELECT count(*) FROM public.lottery_games WHERE status = 'live' AND updated_at > now() - interval '1 minute');
  
  RAISE NOTICE 'Completed lottery status update at % UTC', now();
END;
$$;