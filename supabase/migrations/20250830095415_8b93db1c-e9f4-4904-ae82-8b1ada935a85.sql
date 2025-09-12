-- Fix remaining RLS policies that cause infinite recursion
-- by replacing direct profile table queries with security definer functions

-- Drop and recreate problematic policies on lottery_books
DROP POLICY IF EXISTS "Only admin users can create lottery books" ON public.lottery_books;
DROP POLICY IF EXISTS "Only admin users can update lottery books" ON public.lottery_books;

-- Drop and recreate problematic policies on user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Drop and recreate problematic policies on homepage_slider_images
DROP POLICY IF EXISTS "Admin users can manage homepage slider images" ON public.homepage_slider_images;

-- Create new policies using the has_role function instead of direct profile queries

-- Lottery Books policies
CREATE POLICY "Admin users can create lottery books" 
ON public.lottery_books 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin users can update lottery books" 
ON public.lottery_books 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- User Roles policies
CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Homepage Slider Images policies
CREATE POLICY "Admin users can manage slider images" 
ON public.homepage_slider_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));