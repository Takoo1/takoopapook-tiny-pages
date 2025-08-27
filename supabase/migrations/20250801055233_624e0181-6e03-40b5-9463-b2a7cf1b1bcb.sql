-- Drop the existing constraint and add a new one that includes 'organiser'
ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'organiser', 'user'));