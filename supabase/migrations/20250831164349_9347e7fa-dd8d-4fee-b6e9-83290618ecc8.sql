
-- 1) Create trigger to keep fc_balances in sync with fc_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_fc_balance_on_transaction'
  ) THEN
    CREATE TRIGGER trg_update_fc_balance_on_transaction
    AFTER INSERT ON public.fc_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_fc_balance();
  END IF;
END;
$$;

-- 2) Backfill balances from historical transactions
-- 2a) Ensure a balance row exists for every user who has transactions
INSERT INTO public.fc_balances (user_id, balance)
SELECT t.user_id, 0
FROM public.fc_transactions t
LEFT JOIN public.fc_balances b ON b.user_id = t.user_id
WHERE b.user_id IS NULL
GROUP BY t.user_id;

-- 2b) Recompute balances as the sum of all transactions
UPDATE public.fc_balances b
SET balance = sub.total,
    updated_at = now()
FROM (
  SELECT user_id, COALESCE(SUM(amount_fc), 0) AS total
  FROM public.fc_transactions
  GROUP BY user_id
) sub
WHERE b.user_id = sub.user_id;
