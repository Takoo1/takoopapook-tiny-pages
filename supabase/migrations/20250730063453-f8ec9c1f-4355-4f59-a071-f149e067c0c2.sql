-- Create table for Fortune Counter reset history
CREATE TABLE public.fortune_counter_resets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lottery_game_id UUID NOT NULL REFERENCES public.lottery_games(id) ON DELETE CASCADE,
  reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ticket_count INTEGER NOT NULL,
  reset_by_user_id UUID REFERENCES auth.users(id),
  requested_by_admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fortune_counter_resets ENABLE ROW LEVEL SECURITY;

-- Create policies for fortune_counter_resets
CREATE POLICY "Anyone can view fortune counter resets" 
ON public.fortune_counter_resets 
FOR SELECT 
USING (true);

CREATE POLICY "Only admin users can create fortune counter resets" 
ON public.fortune_counter_resets 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Only admin users can update fortune counter resets" 
ON public.fortune_counter_resets 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_fortune_counter_resets_updated_at
BEFORE UPDATE ON public.fortune_counter_resets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get current fortune counter for a game
CREATE OR REPLACE FUNCTION public.get_fortune_counter(game_id UUID)
RETURNS INTEGER AS $$
DECLARE
  last_reset_date TIMESTAMP WITH TIME ZONE;
  online_tickets_since_reset INTEGER;
BEGIN
  -- Get the most recent reset date for this game
  SELECT MAX(reset_date) INTO last_reset_date
  FROM public.fortune_counter_resets
  WHERE lottery_game_id = game_id;
  
  -- If no reset has occurred, count all sold_online tickets
  IF last_reset_date IS NULL THEN
    SELECT COUNT(*) INTO online_tickets_since_reset
    FROM public.lottery_tickets
    WHERE lottery_game_id = game_id AND status = 'sold_online';
  ELSE
    -- Count sold_online tickets since the last reset
    SELECT COUNT(*) INTO online_tickets_since_reset
    FROM public.lottery_tickets
    WHERE lottery_game_id = game_id 
    AND status = 'sold_online'
    AND created_at > last_reset_date;
  END IF;
  
  RETURN COALESCE(online_tickets_since_reset, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;