-- Create custom_winner_games table for manually entered games
CREATE TABLE public.custom_winner_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_name TEXT NOT NULL,
  game_date DATE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_winner_games ENABLE ROW LEVEL SECURITY;

-- Add custom_game_id to winners table
ALTER TABLE public.winners ADD COLUMN custom_game_id UUID NULL;

-- Create policies for custom_winner_games
CREATE POLICY "Admins can manage custom winner games" 
ON public.custom_winner_games 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view custom winner games with active winners" 
ON public.custom_winner_games 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.winners w 
  WHERE w.custom_game_id = custom_winner_games.id 
  AND w.is_active = true
));

-- Update winners policies to handle custom games
CREATE POLICY "Public can view active winners for custom games" 
ON public.winners 
FOR SELECT 
USING (
  is_active = true AND (
    (lottery_game_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lottery_games g 
      WHERE g.id = winners.lottery_game_id 
      AND g.status = ANY (ARRAY['live'::game_status, 'online'::game_status, 'booking_stopped'::game_status])
    )) OR 
    (custom_game_id IS NOT NULL)
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_winner_games_updated_at
BEFORE UPDATE ON public.custom_winner_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();