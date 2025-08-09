-- Remove the check constraint that's preventing role changes
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS "Profile_role_check";

-- Add a proper check constraint that allows admin, organiser, and user roles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'organiser', 'user'));