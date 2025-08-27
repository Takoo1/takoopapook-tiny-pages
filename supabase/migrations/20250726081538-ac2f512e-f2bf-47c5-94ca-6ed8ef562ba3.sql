-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_lottery_tickets(game_id UUID, num_tickets INTEGER)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert tickets for the lottery game
  INSERT INTO public.lottery_tickets (lottery_game_id, ticket_number)
  SELECT game_id, generate_series(1, num_tickets);
END;
$$;