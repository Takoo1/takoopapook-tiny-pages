-- Add columns to winners table first
ALTER TABLE public.winners 
ADD COLUMN IF NOT EXISTS lottery_game_id UUID REFERENCES public.lottery_games(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS prize_type TEXT DEFAULT 'main_prize' NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_winners_lottery_game_id ON public.winners(lottery_game_id);
CREATE INDEX IF NOT EXISTS idx_winners_prize_type ON public.winners(prize_type);

-- Update RLS policies
DROP POLICY IF EXISTS "Public can view active winners" ON public.winners;
DROP POLICY IF EXISTS "Admins can manage all winners" ON public.winners;
DROP POLICY IF EXISTS "Game owners can manage their game winners" ON public.winners;

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