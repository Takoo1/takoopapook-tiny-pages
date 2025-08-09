-- Check current constraint definition
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass AND conname = 'profiles_role_check';