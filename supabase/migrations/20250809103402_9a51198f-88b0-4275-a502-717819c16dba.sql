-- Fortune Coin (FC) loyalty system - Phase 1 (MVP)
-- Create enum for transaction types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fc_tx_type') THEN
    CREATE TYPE public.fc_tx_type AS ENUM ('earn','redeem','signup_bonus','purchase_bonus','referral_bonus','adjust');
  END IF;
END $$;

-- Balances table
CREATE TABLE IF NOT EXISTS public.fc_balances (
  user_id uuid PRIMARY KEY,
  balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.fc_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.fc_tx_type NOT NULL,
  amount integer NOT NULL CHECK (amount >= 0),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fc_transactions_user_id ON public.fc_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fc_transactions_created_at ON public.fc_transactions(created_at);

-- Enable RLS
ALTER TABLE public.fc_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_transactions ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see their own data
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fc_balances' AND policyname = 'Users can view their own fc balance'
  ) THEN
    CREATE POLICY "Users can view their own fc balance"
      ON public.fc_balances
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fc_transactions' AND policyname = 'Users can view their own fc transactions'
  ) THEN
    CREATE POLICY "Users can view their own fc transactions"
      ON public.fc_transactions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Update timestamp trigger for balances
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_fc_balances_updated_at'
  ) THEN
    CREATE TRIGGER update_fc_balances_updated_at
    BEFORE UPDATE ON public.fc_balances
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Add referral fields to profiles if not present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='referral_code'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code text UNIQUE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='referred_by_user_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referred_by_user_id uuid;
  END IF;
END $$;

-- Function: ensure FC setup and signup bonus
CREATE OR REPLACE FUNCTION public.ensure_fc_setup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  has_signup boolean;
  new_ref_code text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure balance row exists
  INSERT INTO public.fc_balances(user_id)
  VALUES (uid)
  ON CONFLICT (user_id) DO NOTHING;

  -- Ensure referral code exists
  UPDATE public.profiles p
  SET referral_code = COALESCE(p.referral_code, 'FC' || lower(substr(replace(gen_random_uuid()::text,'-',''),1,10)))
  WHERE p.user_id = uid;

  -- Signup bonus only once
  SELECT EXISTS (
    SELECT 1 FROM public.fc_transactions t
    WHERE t.user_id = uid AND t.type = 'signup_bonus'
  ) INTO has_signup;

  IF NOT has_signup THEN
    INSERT INTO public.fc_transactions(user_id, type, amount, metadata)
    VALUES (uid, 'signup_bonus', 50, jsonb_build_object('reason','first_signin'));

    UPDATE public.fc_balances SET balance = balance + 50 WHERE user_id = uid;
  END IF;
END;
$$;

-- Function: award purchase bonus given ticket prices in INR
CREATE OR REPLACE FUNCTION public.award_purchase_bonus(ticket_prices numeric[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  awarded integer := 0;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COALESCE(SUM(
    CASE
      WHEN p = 200 THEN 10
      WHEN p = 500 THEN 30
      WHEN p = 1000 THEN 80
      ELSE 0
    END
  ),0)::int INTO awarded
  FROM unnest(ticket_prices) AS p;

  IF awarded > 0 THEN
    INSERT INTO public.fc_transactions(user_id, type, amount, metadata)
    VALUES (uid, 'purchase_bonus', awarded, jsonb_build_object('prices_inr', ticket_prices));

    UPDATE public.fc_balances SET balance = balance + awarded WHERE user_id = uid;
  END IF;

  RETURN awarded;
END;
$$;

-- Function: redeem FC by rupees (3 FC per Rs)
CREATE OR REPLACE FUNCTION public.redeem_fc_by_rupees(discount_rupees integer)
RETURNS TABLE(used_fc integer, new_balance integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  required_fc integer := discount_rupees * 3;
  current_balance integer;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF discount_rupees <= 0 THEN
    RAISE EXCEPTION 'discount_rupees must be > 0';
  END IF;

  SELECT balance INTO current_balance FROM public.fc_balances WHERE user_id = uid FOR UPDATE;
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'FC balance not initialized';
  END IF;
  IF current_balance < required_fc THEN
    RAISE EXCEPTION 'Insufficient FC balance';
  END IF;

  -- Insert redeem transaction and update balance
  INSERT INTO public.fc_transactions(user_id, type, amount, metadata)
  VALUES (uid, 'redeem', required_fc, jsonb_build_object('discount_rupees', discount_rupees));

  UPDATE public.fc_balances SET balance = balance - required_fc WHERE user_id = uid RETURNING balance INTO new_balance;

  used_fc := required_fc;
  RETURN QUERY SELECT used_fc, new_balance;
END;
$$;

-- Function: award referrer bonus if applicable (100 FC once after first purchase bonus)
CREATE OR REPLACE FUNCTION public.award_referrer_bonus_if_applicable()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  referrer uuid;
  has_purchase boolean;
  already_awarded boolean;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT referred_by_user_id INTO referrer FROM public.profiles WHERE user_id = uid;
  IF referrer IS NULL THEN
    RETURN false; -- no referrer
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.fc_transactions t
    WHERE t.user_id = uid AND t.type = 'purchase_bonus'
  ) INTO has_purchase;

  IF NOT has_purchase THEN
    RETURN false; -- nothing to award yet
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.fc_transactions t
    WHERE t.user_id = referrer AND t.type = 'referral_bonus' AND (t.metadata->>'referred_user_id')::uuid = uid
  ) INTO already_awarded;

  IF already_awarded THEN
    RETURN false; -- already paid
  END IF;

  -- Award referrer 100 FC
  INSERT INTO public.fc_transactions(user_id, type, amount, metadata)
  VALUES (referrer, 'referral_bonus', 100, jsonb_build_object('referred_user_id', uid));

  UPDATE public.fc_balances SET balance = balance + 100 WHERE user_id = referrer;

  RETURN true;
END;
$$;