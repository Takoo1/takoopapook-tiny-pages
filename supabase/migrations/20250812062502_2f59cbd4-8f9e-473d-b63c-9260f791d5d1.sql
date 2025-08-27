-- Fix security warnings by adding SET search_path to all functions
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';