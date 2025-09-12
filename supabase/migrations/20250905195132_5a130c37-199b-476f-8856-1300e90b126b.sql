-- Fix the trigger function to allow automatic status changes
CREATE OR REPLACE FUNCTION public.prevent_status_update_by_non_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only protect when the status actually changes
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Allow automatic status changes when the special config is set
    IF current_setting('app.allow_status_change', true) = 'true' THEN
      RETURN NEW;
    END IF;
    
    -- Otherwise, only allow admins to change status
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can change game status';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Clean up duplicate cron jobs first
SELECT cron.unschedule('update-lottery-statuses-job');
SELECT cron.unschedule('update-lottery-statuses');

-- Recreate the direct database function approach (no edge function needed)
SELECT cron.schedule(
  'update-lottery-statuses-direct',
  '* * * * *',
  $$
  SELECT public.update_lottery_statuses();
  $$
);

-- Test the function now that the trigger is fixed
SELECT public.update_lottery_statuses();