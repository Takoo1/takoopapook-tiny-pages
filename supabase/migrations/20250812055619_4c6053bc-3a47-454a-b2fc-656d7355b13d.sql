-- Fix profiles table to properly handle referrals
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by_user_id uuid REFERENCES public.profiles(id);

-- Update the ensure_fc_setup function to fix profiles.id usage and improve signup bonus logic
CREATE OR REPLACE FUNCTION public.ensure_fc_setup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  uid uuid := auth.uid();
  has_signup boolean;
  ref_code_from_storage text;
  referrer_user_id uuid;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Ensure balance row exists
  insert into public.fc_balances(user_id)
  values (uid)
  on conflict (user_id) do nothing;

  -- Ensure referral code exists
  update public.profiles p
  set referral_code = coalesce(
    p.referral_code,
    'FC' || lower(substr(replace(gen_random_uuid()::text,'-',''),1,10))
  )
  where p.id = uid;

  -- Handle referrer if ref code exists in temp storage
  select value into ref_code_from_storage 
  from auth.users 
  where id = uid 
  and raw_user_meta_data ? 'ref_code';

  if ref_code_from_storage is not null then
    -- Find referrer by referral code
    select id into referrer_user_id
    from public.profiles
    where referral_code = ref_code_from_storage;

    if referrer_user_id is not null and referrer_user_id != uid then
      -- Update user's profile with referrer
      update public.profiles
      set referred_by_user_id = referrer_user_id
      where id = uid and referred_by_user_id is null;
    end if;
  end if;

  -- Signup bonus only once
  select exists (
    select 1 from public.fc_transactions t
    where t.user_id = uid and t.type = 'signup_bonus'
  ) into has_signup;

  if not has_signup then
    insert into public.fc_transactions(user_id, type, amount, metadata)
    values (uid, 'signup_bonus', 50, jsonb_build_object('reason','first_signin'));

    update public.fc_balances
    set balance = balance + 50
    where user_id = uid;
  end if;
end;
$function$;

-- Update handle_new_user_profile to call ensure_fc_setup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Call ensure_fc_setup for new users
  PERFORM public.ensure_fc_setup();
  
  RETURN NEW;
END;
$function$;