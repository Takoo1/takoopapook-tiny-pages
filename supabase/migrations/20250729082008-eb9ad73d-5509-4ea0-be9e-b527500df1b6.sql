-- Update a specific user to admin role (replace the email with the actual user email)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'user@example.com';