
-- 1) Drop legacy CHECK constraints that can conflict (if present).
--    (We prefer trigger-based validation for correctness and reliability.)
DO $$
DECLARE c RECORD;
BEGIN
  -- Drop any CHECK constraints on public.fc_balances
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.fc_balances'::regclass
      AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.fc_balances DROP CONSTRAINT %I', c.conname);
  END LOOP;

  -- Drop any CHECK constraints on public.fc_transactions (older schemas enforced amount >= 0)
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.fc_transactions'::regclass
      AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.fc_transactions DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

-- 2) Replace the trigger function to safely update balances.
CREATE OR REPLACE FUNCTION public.update_fc_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Ensure a balance row exists with 0 starting balance
  INSERT INTO public.fc_balances (user_id, balance, updated_at)
  VALUES (NEW.user_id, 0, now())
  ON CONFLICT (user_id) DO NOTHING;

  -- Apply the delta
  UPDATE public.fc_balances
  SET balance = balance + NEW.amount_fc,
      updated_at = now()
  WHERE user_id = NEW.user_id;

  -- Prevent negative balances
  IF (SELECT balance FROM public.fc_balances WHERE user_id = NEW.user_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient FC balance';
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Ensure the AFTER INSERT trigger exists and uses the updated function.
DROP TRIGGER IF EXISTS fc_balance_update_trigger ON public.fc_transactions;
CREATE TRIGGER fc_balance_update_trigger
  AFTER INSERT ON public.fc_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fc_balance();

-- 4) Harden the redeem RPC to be idempotent and consistent with the trigger.
CREATE OR REPLACE FUNCTION public.redeem_fc_by_rupees(discount_rupees integer)
RETURNS TABLE(new_balance integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  current_balance integer;
  fc_to_debit integer;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF discount_rupees <= 0 THEN
    RAISE EXCEPTION 'discount_rupees must be > 0';
  END IF;

  fc_to_debit := discount_rupees * 3;

  -- Ensure a balance row exists
  INSERT INTO public.fc_balances (user_id)
  VALUES (current_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Lock balance row and verify funds
  SELECT balance INTO current_balance
  FROM public.fc_balances
  WHERE user_id = current_user_id
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance < fc_to_debit THEN
    RAISE EXCEPTION 'Insufficient FC balance';
  END IF;

  -- Insert redemption transaction with negative delta; trigger will update balance
  INSERT INTO public.fc_transactions (user_id, amount_fc, tx_type, metadata)
  VALUES (current_user_id, -fc_to_debit, 'redemption', jsonb_build_object('discount_rupees', discount_rupees));

  -- Return updated balance
  SELECT balance INTO current_balance
  FROM public.fc_balances
  WHERE user_id = current_user_id;

  RETURN QUERY SELECT current_balance;
END;
$function$;
