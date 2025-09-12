-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.get_fortune_counter(game_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;