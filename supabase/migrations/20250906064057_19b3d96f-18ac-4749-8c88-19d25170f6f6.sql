-- Add avatar_url column to profiles table
ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;

-- Update the handle_new_user function to include avatar_url from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    )
  );
  RETURN NEW;
END;
$$;

-- Update existing profiles with avatar URLs from auth.users metadata
-- This is a one-time update for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT au.id, au.raw_user_meta_data
    FROM auth.users au
    JOIN public.profiles p ON p.user_id = au.id
    WHERE p.avatar_url IS NULL
  LOOP
    UPDATE public.profiles 
    SET avatar_url = COALESCE(
      user_record.raw_user_meta_data ->> 'avatar_url',
      user_record.raw_user_meta_data ->> 'picture'
    )
    WHERE user_id = user_record.id;
  END LOOP;
END $$;