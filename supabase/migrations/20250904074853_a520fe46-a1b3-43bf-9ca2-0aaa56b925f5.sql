-- Update the award_purchase_bonus function with new FC reward structure
CREATE OR REPLACE FUNCTION public.award_purchase_bonus(ticket_prices integer[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID;
  total_fc INTEGER := 0;
  price INTEGER;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Calculate total FC based on new ticket price structure
  FOREACH price IN ARRAY ticket_prices
  LOOP
    CASE 
      WHEN price >= 1000 THEN total_fc := total_fc + 30;  -- Changed from 80 to 30
      WHEN price >= 500 THEN total_fc := total_fc + 10;   -- Changed from 30 to 10
      -- Removed other cases - no FC for purchases under 500
    END CASE;
  END LOOP;

  IF total_fc > 0 THEN
    INSERT INTO public.fc_transactions (user_id, amount_fc, tx_type, metadata)
    VALUES (current_user_id, total_fc, 'purchase_reward', jsonb_build_object('ticket_prices', ticket_prices));
  END IF;
END;
$function$