-- Fix the handle_new_user_profile trigger to not call ensure_fc_setup during user creation
-- The ensure_fc_setup will be called later when the user is properly authenticated

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only insert the basic profile, don't call ensure_fc_setup here
  -- ensure_fc_setup will be called when user is authenticated via client
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Make sure the trigger is properly attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();