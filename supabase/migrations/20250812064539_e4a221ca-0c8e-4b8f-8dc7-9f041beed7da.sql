-- Fix the referral bonus logic - it was backwards
CREATE OR REPLACE FUNCTION public.award_referrer_bonus_if_applicable()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_user_id UUID;
  referrer_id UUID;
  existing_award INTEGER;
  user_purchase_count INTEGER;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Check how many tickets this user has purchased
  SELECT COUNT(*) INTO user_purchase_count
  FROM public.lottery_tickets
  WHERE booked_by_user_id = current_user_id;

  -- Only award referral bonus for the first purchase (count should be > 0 now)
  IF user_purchase_count = 0 THEN
    RETURN;
  END IF;

  -- Get referrer
  SELECT referred_by_user_id INTO referrer_id
  FROM public.profiles
  WHERE user_id = current_user_id;

  IF referrer_id IS NULL THEN
    RETURN;
  END IF;

  -- Check if referrer bonus already awarded for this specific referred user
  SELECT COUNT(*) INTO existing_award
  FROM public.fc_referral_awards
  WHERE referrer_user_id = referrer_id AND referred_user_id = current_user_id;

  -- Award bonus only if not already awarded and user has made their first purchase
  IF existing_award = 0 THEN
    -- Award 100 FC bonus to referrer
    INSERT INTO public.fc_transactions (user_id, amount_fc, tx_type, metadata)
    VALUES (referrer_id, 100, 'referral_bonus', jsonb_build_object('referred_user_id', current_user_id));

    -- Mark as awarded to prevent duplicate awards
    INSERT INTO public.fc_referral_awards (referrer_user_id, referred_user_id)
    VALUES (referrer_id, current_user_id);
  END IF;
END;
$function$;