
-- 1) Deduplicate fc_balances: keep the latest row per user_id, delete older duplicates
WITH ranked AS (
  SELECT
    ctid,
    user_id,
    balance,
    updated_at,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, ctid DESC
    ) AS rn
  FROM public.fc_balances
)
DELETE FROM public.fc_balances fb
USING ranked r
WHERE fb.ctid = r.ctid
  AND r.rn > 1;

-- 2) Enforce uniqueness on user_id to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS fc_balances_user_id_key
  ON public.fc_balances(user_id);

-- 3) Harden redeem_fc_by_rupees to deterministically lock the latest balance row
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

  IF discount_rupees IS NULL OR discount_rupees <= 0 THEN
    RAISE EXCEPTION 'discount_rupees must be > 0';
  END IF;

  fc_to_debit := discount_rupees * 3;

  -- Ensure a balance row exists (safe with the unique index)
  INSERT INTO public.fc_balances (user_id)
  VALUES (current_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Deterministically lock the most recent balance row for this user
  SELECT balance INTO current_balance
  FROM public.fc_balances
  WHERE user_id = current_user_id
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance < fc_to_debit THEN
    RAISE EXCEPTION 'Insufficient FC balance: have %, need %', COALESCE(current_balance, 0), fc_to_debit;
  END IF;

  -- Insert redemption transaction; trigger will update fc_balances
  INSERT INTO public.fc_transactions (user_id, amount_fc, tx_type, metadata)
  VALUES (current_user_id, -fc_to_debit, 'redemption', jsonb_build_object('discount_rupees', discount_rupees));

  -- Return the updated balance
  SELECT balance INTO current_balance
  FROM public.fc_balances
  WHERE user_id = current_user_id;

  RETURN QUERY SELECT current_balance;
END;
$function$;

