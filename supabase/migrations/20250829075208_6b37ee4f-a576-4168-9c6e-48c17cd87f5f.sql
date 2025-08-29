-- Fix RLS policy inconsistencies for BookingsManager
-- Drop old policies that mix different role checking methods
DROP POLICY IF EXISTS "Only admin users can create lottery tickets" ON public.lottery_tickets;
DROP POLICY IF EXISTS "Only admin users can create lottery games" ON public.lottery_games;
DROP POLICY IF EXISTS "Only admin users can update lottery games" ON public.lottery_games;
DROP POLICY IF EXISTS "Only admin users can delete lottery games" ON public.lottery_games;

-- Recreate policies using consistent has_role() function for admin checks
CREATE POLICY "Admins can manage all lottery tickets"
ON public.lottery_tickets
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update existing game policies to ensure admins have full access
CREATE POLICY "Admins can create any lottery game"
ON public.lottery_games
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any lottery game"
ON public.lottery_games
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any lottery game"  
ON public.lottery_games
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));