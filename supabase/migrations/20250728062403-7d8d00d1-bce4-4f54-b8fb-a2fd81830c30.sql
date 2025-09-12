-- Phase 1: Database Schema Updates

-- Add new fields to lottery_games table
ALTER TABLE public.lottery_games 
ADD COLUMN organising_group_name text,
ADD COLUMN starting_ticket_number integer DEFAULT 1,
ADD COLUMN last_ticket_number integer;

-- Add booking fields to lottery_tickets table
ALTER TABLE public.lottery_tickets 
ADD COLUMN booked_by_name text,
ADD COLUMN booked_by_phone text,
ADD COLUMN booked_by_email text,
ADD COLUMN booked_by_address text;

-- Update the generate_lottery_tickets function to support custom ranges
CREATE OR REPLACE FUNCTION public.generate_lottery_tickets(game_id uuid, start_num integer, end_num integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert tickets for the lottery game with custom range
  INSERT INTO public.lottery_tickets (lottery_game_id, ticket_number)
  SELECT game_id, generate_series(start_num, end_num);
END;
$$;

-- Enable real-time functionality for lottery_tickets table
ALTER TABLE public.lottery_tickets REPLICA IDENTITY FULL;

-- Add lottery_tickets to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.lottery_tickets;