-- Create table for fortune counter reset requests
CREATE TABLE public.fortune_counter_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lottery_game_id UUID NOT NULL,
  requested_by_admin_id UUID NOT NULL,
  ticket_count INTEGER NOT NULL,
  amount_due NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by_organizer_id UUID,
  notes TEXT
);

-- Enable RLS on fortune counter requests
ALTER TABLE public.fortune_counter_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for fortune counter requests
CREATE POLICY "Admins can create reset requests" 
ON public.fortune_counter_requests 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all requests" 
ON public.fortune_counter_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Organizers can view requests for their games" 
ON public.fortune_counter_requests 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1 FROM lottery_games g 
  WHERE g.id = fortune_counter_requests.lottery_game_id 
  AND g.created_by_user_id = auth.uid()
));

CREATE POLICY "Organizers can update requests for their games" 
ON public.fortune_counter_requests 
FOR UPDATE 
USING (EXISTS ( 
  SELECT 1 FROM lottery_games g 
  WHERE g.id = fortune_counter_requests.lottery_game_id 
  AND g.created_by_user_id = auth.uid()
));

-- RPC function for admins to request fortune counter reset
CREATE OR REPLACE FUNCTION public.admin_request_fortune_reset(
  p_game_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_id UUID;
  v_counter INTEGER;
  v_ticket_price NUMERIC;
  v_amount_due NUMERIC;
  v_request_id UUID;
BEGIN
  v_admin_id := auth.uid();
  
  -- Verify admin role
  IF NOT has_role(v_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can request fortune counter resets';
  END IF;
  
  -- Get current fortune counter and ticket price
  SELECT get_fortune_counter(p_game_id) INTO v_counter;
  SELECT ticket_price INTO v_ticket_price FROM lottery_games WHERE id = p_game_id;
  
  -- Check if counter is greater than 0
  IF v_counter = 0 THEN
    RAISE EXCEPTION 'Fortune counter is already at 0';
  END IF;
  
  -- Calculate amount due
  v_amount_due := v_counter * v_ticket_price;
  
  -- Check if there's already a pending request
  IF EXISTS (SELECT 1 FROM fortune_counter_requests 
             WHERE lottery_game_id = p_game_id AND status = 'pending') THEN
    RAISE EXCEPTION 'There is already a pending reset request for this game';
  END IF;
  
  -- Create the reset request
  INSERT INTO fortune_counter_requests (
    lottery_game_id, 
    requested_by_admin_id, 
    ticket_count, 
    amount_due
  ) VALUES (
    p_game_id, 
    v_admin_id, 
    v_counter, 
    v_amount_due
  ) RETURNING id INTO v_request_id;
  
  RETURN v_request_id;
END;
$$;

-- RPC function for organizers to confirm fortune counter reset
CREATE OR REPLACE FUNCTION public.organizer_confirm_fortune_reset(
  p_request_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_organizer_id UUID;
  v_game_id UUID;
  v_ticket_count INTEGER;
  v_request_status TEXT;
BEGIN
  v_organizer_id := auth.uid();
  
  -- Get request details and verify ownership
  SELECT lottery_game_id, ticket_count, status 
  INTO v_game_id, v_ticket_count, v_request_status
  FROM fortune_counter_requests 
  WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reset request not found';
  END IF;
  
  IF v_request_status != 'pending' THEN
    RAISE EXCEPTION 'Reset request is not pending';
  END IF;
  
  -- Verify organizer owns the game
  IF NOT EXISTS (SELECT 1 FROM lottery_games 
                 WHERE id = v_game_id AND created_by_user_id = v_organizer_id) THEN
    RAISE EXCEPTION 'You can only confirm resets for your own games';
  END IF;
  
  -- Update request status
  UPDATE fortune_counter_requests 
  SET status = 'confirmed',
      confirmed_at = now(),
      confirmed_by_organizer_id = v_organizer_id,
      updated_at = now()
  WHERE id = p_request_id;
  
  -- Create the actual reset record
  INSERT INTO fortune_counter_resets (
    lottery_game_id, 
    ticket_count, 
    reset_by_user_id
  ) VALUES (
    v_game_id, 
    v_ticket_count, 
    v_organizer_id
  );
END;
$$;

-- Add updated_at trigger for fortune_counter_requests
CREATE TRIGGER update_fortune_counter_requests_updated_at
BEFORE UPDATE ON public.fortune_counter_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();