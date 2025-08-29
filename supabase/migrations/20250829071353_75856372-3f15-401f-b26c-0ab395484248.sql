-- Create RPC function to link referrals securely
CREATE OR REPLACE FUNCTION public.link_referral(ref_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID;
  referrer_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF ref_code IS NULL OR ref_code = '' THEN
    RETURN;
  END IF;

  -- Find referrer by code
  SELECT user_id INTO referrer_id 
  FROM public.profiles 
  WHERE referral_code = ref_code AND user_id != current_user_id;
  
  IF referrer_id IS NOT NULL THEN
    -- Only update if not already set
    UPDATE public.profiles 
    SET referred_by_user_id = referrer_id
    WHERE user_id = current_user_id AND referred_by_user_id IS NULL;
    
    RAISE NOTICE 'Linked user % to referrer % via code %', current_user_id, referrer_id, ref_code;
  END IF;
END;
$$;

-- Create RPC function to get referrer display name securely
CREATE OR REPLACE FUNCTION public.get_referrer_display_name(ref_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  display_name TEXT;
BEGIN
  IF ref_code IS NULL OR ref_code = '' THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(p.display_name, p.full_name, 'Someone') INTO display_name
  FROM public.profiles p
  WHERE p.referral_code = ref_code;
  
  RETURN display_name;
END;
$$;

-- Create index on referral_code for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);