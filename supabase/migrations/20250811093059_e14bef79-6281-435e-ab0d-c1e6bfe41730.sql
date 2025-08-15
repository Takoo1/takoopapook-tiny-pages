-- Ensure profiles updated_at trigger exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_update_profiles_updated_at'
      AND c.relname = 'profiles'
      AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER trg_update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profiles_updated_at();
  END IF;
END $$;

-- Backfill existing auth.users into public.profiles (defaults role to 'user')
INSERT INTO public.profiles (id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;