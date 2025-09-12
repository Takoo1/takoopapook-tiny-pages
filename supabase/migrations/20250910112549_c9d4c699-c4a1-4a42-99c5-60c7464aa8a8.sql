-- Create enum for prize types
CREATE TYPE public.prize_type AS ENUM ('main_prize', 'incentive_prize');

-- Add new columns to winners table
ALTER TABLE public.winners 
ADD COLUMN lottery_game_id UUID REFERENCES public.lottery_games(id) ON DELETE CASCADE,
ADD COLUMN prize_type public.prize_type DEFAULT 'main_prize'::prize_type NOT NULL;

-- Create index for better performance
CREATE INDEX idx_winners_lottery_game_id ON public.winners(lottery_game_id);
CREATE INDEX idx_winners_prize_type ON public.winners(prize_type);

-- Update RLS policies to include game-based access
DROP POLICY IF EXISTS "Public can view active winners" ON public.winners;
DROP POLICY IF EXISTS "Admins can manage all winners" ON public.winners;

-- New RLS policies for game-based winners
CREATE POLICY "Public can view active winners" 
ON public.winners 
FOR SELECT 
USING (
  is_active = true 
  AND (
    lottery_game_id IS NULL -- legacy winners without game association
    OR EXISTS (
      SELECT 1 FROM public.lottery_games g 
      WHERE g.id = lottery_game_id 
      AND g.status IN ('live'::game_status, 'online'::game_status, 'booking_stopped'::game_status)
    )
  )
);

CREATE POLICY "Admins can manage all winners" 
ON public.winners 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Game owners can manage their game winners"
ON public.winners
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    lottery_game_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.lottery_games g 
      WHERE g.id = lottery_game_id 
      AND g.created_by_user_id = auth.uid()
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    lottery_game_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.lottery_games g 
      WHERE g.id = lottery_game_id 
      AND g.created_by_user_id = auth.uid()
    )
  )
);