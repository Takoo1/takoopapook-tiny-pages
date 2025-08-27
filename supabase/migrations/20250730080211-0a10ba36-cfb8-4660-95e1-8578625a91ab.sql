-- Add "organiser" role to the existing app_role enum
ALTER TYPE public.app_role ADD VALUE 'organiser';

-- Update RLS policies for organizer login access
-- Allow organisers to access organizer dashboard functionality
CREATE POLICY "Organisers can access organizer features" 
ON public.lottery_games 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'organiser'
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- Update lottery_tickets policy to allow organisers to update tickets
DROP POLICY IF EXISTS "Only admin users can update lottery tickets" ON public.lottery_tickets;

CREATE POLICY "Admin and organiser users can update lottery tickets" 
ON public.lottery_tickets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin')
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'organiser'
  )
);