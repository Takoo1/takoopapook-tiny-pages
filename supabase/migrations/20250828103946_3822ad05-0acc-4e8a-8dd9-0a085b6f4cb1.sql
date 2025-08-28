-- Fix Fortune Counter Reset Permissions
-- Drop the old policy that only allows admins
DROP POLICY IF EXISTS "Only admin users can create fortune counter resets" ON public.fortune_counter_resets;

-- Create new policy allowing game organizers to reset their own games' fortune counters
CREATE POLICY "Organizers can reset their own games fortune counter" 
ON public.fortune_counter_resets 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  (EXISTS ( 
    SELECT 1 
    FROM lottery_games g 
    WHERE g.id = lottery_game_id 
    AND g.created_by_user_id = auth.uid()
  ))
);

-- Update the existing update policy as well
DROP POLICY IF EXISTS "Only admin users can update fortune counter resets" ON public.fortune_counter_resets;

CREATE POLICY "Organizers can update their own games fortune counter resets" 
ON public.fortune_counter_resets 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  (EXISTS ( 
    SELECT 1 
    FROM lottery_games g 
    WHERE g.id = lottery_game_id 
    AND g.created_by_user_id = auth.uid()
  ))
);