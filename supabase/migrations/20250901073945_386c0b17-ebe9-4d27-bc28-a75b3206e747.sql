-- Verify and recreate the fc_transactions trigger to ensure balance consistency
-- First drop the existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_fc_balance ON public.fc_transactions;

-- Recreate the trigger
CREATE TRIGGER trigger_update_fc_balance
  AFTER INSERT ON public.fc_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fc_balance();