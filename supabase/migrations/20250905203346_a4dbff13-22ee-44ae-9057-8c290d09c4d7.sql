-- Fix the update_lottery_statuses function to use simple UTC comparisons
CREATE OR REPLACE FUNCTION public.update_lottery_statuses()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow automatic transitions in the trigger via a guarded setting
  PERFORM set_config('app.allow_status_change', 'true', true);

  -- Add detailed logging for debugging
  RAISE NOTICE 'Starting lottery status update at % UTC', now();
  
  -- Online -> Booking Stopped: Simple UTC comparison
  -- Both now() and stop_booking_time are in UTC, just compare directly
  UPDATE public.lottery_games
  SET status = 'booking_stopped'::game_status,
      updated_at = now()
  WHERE status = 'online'::game_status
    AND stop_booking_time IS NOT NULL
    AND now() >= stop_booking_time;

  RAISE NOTICE 'Updated % games to booking_stopped', 
    (SELECT count(*) FROM public.lottery_games WHERE status = 'booking_stopped' AND updated_at > now() - interval '1 minute');

  -- Online/Booking Stopped -> Live: Simple UTC comparison
  -- Both now() and game_date are in UTC, just compare directly
  UPDATE public.lottery_games
  SET status = 'live'::game_status,
      updated_at = now()
  WHERE status IN ('online'::game_status, 'booking_stopped'::game_status)
    AND game_date IS NOT NULL
    AND now() >= game_date;

  RAISE NOTICE 'Updated % games to live', 
    (SELECT count(*) FROM public.lottery_games WHERE status = 'live' AND updated_at > now() - interval '1 minute');
  
  RAISE NOTICE 'Completed lottery status update at % UTC', now();
END;
$function$;