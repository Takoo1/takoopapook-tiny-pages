
-- 1) Drop all duplicate FC balance update triggers on fc_transactions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'fc_balance_update_trigger') THEN
    DROP TRIGGER fc_balance_update_trigger ON public.fc_transactions;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_fc_balance_on_transaction') THEN
    DROP TRIGGER trg_update_fc_balance_on_transaction ON public.fc_transactions;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_fc_balance') THEN
    DROP TRIGGER trigger_update_fc_balance ON public.fc_transactions;
  END IF;
END;
$$;

-- 2) Recreate a single canonical trigger
CREATE TRIGGER fc_balance_update_trigger
  AFTER INSERT ON public.fc_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fc_balance();

-- 3) Ensure unique index on fc_balances.user_id (prevent future duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS fc_balances_user_id_key
  ON public.fc_balances(user_id);

-- 4) Rebuild balances from the transaction history (source of truth)
WITH totals AS (
  SELECT user_id, COALESCE(SUM(amount_fc), 0) AS balance
  FROM public.fc_transactions
  GROUP BY user_id
)
INSERT INTO public.fc_balances (user_id, balance, updated_at)
SELECT user_id, balance, now()
FROM totals
ON CONFLICT (user_id) DO UPDATE
SET balance = EXCLUDED.balance,
    updated_at = now();
