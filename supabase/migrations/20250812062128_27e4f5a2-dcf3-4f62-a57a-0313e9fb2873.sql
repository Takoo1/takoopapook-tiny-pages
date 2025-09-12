-- Phase 1: Update profiles table with missing columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Phase 2: Create FC transactions table (append-only ledger)
CREATE TABLE IF NOT EXISTS public.fc_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_fc INTEGER NOT NULL, -- Can be positive (credit) or negative (debit)
  tx_type TEXT NOT NULL CHECK (tx_type IN ('signup_bonus', 'purchase_reward', 'referral_bonus', 'redemption', 'top_up')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 3: Create FC balances table (current balance snapshot)
CREATE TABLE IF NOT EXISTS public.fc_balances (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 4: Create FC referral awards tracking table
CREATE TABLE IF NOT EXISTS public.fc_referral_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_user_id, referred_user_id)
);

-- Phase 5: Create trigger to auto-update fc_balances when fc_transactions are inserted
CREATE OR REPLACE FUNCTION public.update_fc_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.fc_balances (user_id, balance, updated_at)
  VALUES (NEW.user_id, NEW.amount_fc, now())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    balance = fc_balances.balance + NEW.amount_fc,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_fc_balance ON public.fc_transactions;
CREATE TRIGGER trigger_update_fc_balance
  AFTER INSERT ON public.fc_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fc_balance();

-- Phase 6: Create function to ensure FC setup for user (generates referral code, signup bonus)
CREATE OR REPLACE FUNCTION public.ensure_fc_setup()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
  ref_code TEXT;
  referrer_id UUID;
  existing_signup_bonus INTEGER;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Generate unique referral code if not exists
  UPDATE public.profiles 
  SET referral_code = public.generate_random_code(8)
  WHERE user_id = current_user_id AND referral_code IS NULL;

  -- Handle referral from user metadata
  SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'ref_code' INTO ref_code;
  
  IF ref_code IS NOT NULL THEN
    -- Find referrer and update referred_by_user_id
    SELECT user_id INTO referrer_id 
    FROM public.profiles 
    WHERE referral_code = ref_code AND user_id != current_user_id;
    
    IF referrer_id IS NOT NULL THEN
      UPDATE public.profiles 
      SET referred_by_user_id = referrer_id
      WHERE user_id = current_user_id AND referred_by_user_id IS NULL;
    END IF;
  END IF;

  -- Award signup bonus if not already given
  SELECT COUNT(*) INTO existing_signup_bonus
  FROM public.fc_transactions
  WHERE user_id = current_user_id AND tx_type = 'signup_bonus';

  IF existing_signup_bonus = 0 THEN
    INSERT INTO public.fc_transactions (user_id, amount_fc, tx_type)
    VALUES (current_user_id, 50, 'signup_bonus');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Phase 7: Create function to redeem FC for rupees discount
CREATE OR REPLACE FUNCTION public.redeem_fc_by_rupees(discount_rupees INTEGER)
RETURNS TABLE(new_balance INTEGER) AS $$
DECLARE
  current_user_id UUID;
  current_balance INTEGER;
  fc_to_debit INTEGER;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  fc_to_debit := discount_rupees * 3; -- 3 FC = 1 INR

  -- Check current balance
  SELECT balance INTO current_balance 
  FROM public.fc_balances 
  WHERE user_id = current_user_id;

  IF current_balance IS NULL OR current_balance < fc_to_debit THEN
    RAISE EXCEPTION 'Insufficient FC balance';
  END IF;

  -- Debit FC
  INSERT INTO public.fc_transactions (user_id, amount_fc, tx_type, metadata)
  VALUES (current_user_id, -fc_to_debit, 'redemption', jsonb_build_object('discount_rupees', discount_rupees));

  -- Return new balance
  SELECT balance INTO current_balance 
  FROM public.fc_balances 
  WHERE user_id = current_user_id;

  RETURN QUERY SELECT current_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Phase 8: Create function to award purchase bonus
CREATE OR REPLACE FUNCTION public.award_purchase_bonus(ticket_prices INTEGER[])
RETURNS void AS $$
DECLARE
  current_user_id UUID;
  total_fc INTEGER := 0;
  price INTEGER;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Calculate total FC based on ticket prices
  FOREACH price IN ARRAY ticket_prices
  LOOP
    CASE 
      WHEN price >= 1000 THEN total_fc := total_fc + 80;
      WHEN price >= 500 THEN total_fc := total_fc + 30;
      WHEN price >= 200 THEN total_fc := total_fc + 10;
      ELSE total_fc := total_fc + 5; -- Default small bonus
    END CASE;
  END LOOP;

  IF total_fc > 0 THEN
    INSERT INTO public.fc_transactions (user_id, amount_fc, tx_type, metadata)
    VALUES (current_user_id, total_fc, 'purchase_reward', jsonb_build_object('ticket_prices', ticket_prices));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Phase 9: Create function to award referrer bonus if applicable
CREATE OR REPLACE FUNCTION public.award_referrer_bonus_if_applicable()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
  referrer_id UUID;
  existing_award INTEGER;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Get referrer
  SELECT referred_by_user_id INTO referrer_id
  FROM public.profiles
  WHERE user_id = current_user_id;

  IF referrer_id IS NULL THEN
    RETURN;
  END IF;

  -- Check if referrer bonus already awarded
  SELECT COUNT(*) INTO existing_award
  FROM public.fc_referral_awards
  WHERE referrer_user_id = referrer_id AND referred_user_id = current_user_id;

  IF existing_award = 0 THEN
    -- Award bonus to referrer
    INSERT INTO public.fc_transactions (user_id, amount_fc, tx_type, metadata)
    VALUES (referrer_id, 100, 'referral_bonus', jsonb_build_object('referred_user_id', current_user_id));

    -- Mark as awarded
    INSERT INTO public.fc_referral_awards (referrer_user_id, referred_user_id)
    VALUES (referrer_id, current_user_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Phase 10: Enable RLS on all FC tables
ALTER TABLE public.fc_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_referral_awards ENABLE ROW LEVEL SECURITY;

-- Phase 11: Create RLS policies
-- Users can only see their own FC transactions
CREATE POLICY "Users can view their own FC transactions" 
ON public.fc_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only see their own FC balance
CREATE POLICY "Users can view their own FC balance" 
ON public.fc_balances 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can see referral awards where they are the referrer
CREATE POLICY "Users can view their referral awards" 
ON public.fc_referral_awards 
FOR SELECT 
USING (auth.uid() = referrer_user_id);

-- Phase 12: Create trigger for auto-updating profiles.updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_fc_balances_updated_at ON public.fc_balances;
CREATE TRIGGER update_fc_balances_updated_at
  BEFORE UPDATE ON public.fc_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();