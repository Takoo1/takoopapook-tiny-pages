-- Add unique constraint to fc_balances table to prevent duplicate user records
ALTER TABLE public.fc_balances ADD CONSTRAINT fc_balances_user_id_unique UNIQUE (user_id);

-- Create or replace the trigger function to update FC balances automatically
CREATE OR REPLACE FUNCTION public.update_fc_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.fc_balances (user_id, balance, updated_at)
  VALUES (NEW.user_id, NEW.amount_fc, now())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    balance = fc_balances.balance + NEW.amount_fc,
    updated_at = now();
  RETURN NEW;
END;
$function$;

-- Create the trigger to automatically update FC balances when transactions are inserted
DROP TRIGGER IF EXISTS fc_balance_update_trigger ON public.fc_transactions;
CREATE TRIGGER fc_balance_update_trigger
  AFTER INSERT ON public.fc_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fc_balance();

-- Create RPC function for purchasing FC with proper transaction handling
CREATE OR REPLACE FUNCTION public.purchase_fc(amount_fc integer, payment_details jsonb DEFAULT '{}')
RETURNS TABLE(new_balance integer, transaction_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID;
  tx_id UUID;
  current_balance INTEGER;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF amount_fc <= 0 THEN
    RAISE EXCEPTION 'Purchase amount must be positive';
  END IF;

  -- Insert the FC purchase transaction
  INSERT INTO public.fc_transactions (user_id, amount_fc, tx_type, metadata)
  VALUES (current_user_id, amount_fc, 'purchase', payment_details)
  RETURNING id INTO tx_id;

  -- Get the updated balance
  SELECT balance INTO current_balance 
  FROM public.fc_balances 
  WHERE user_id = current_user_id;

  RETURN QUERY SELECT current_balance, tx_id;
END;
$function$;