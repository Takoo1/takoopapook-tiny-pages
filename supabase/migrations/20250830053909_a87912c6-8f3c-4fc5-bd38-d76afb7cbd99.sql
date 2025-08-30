-- Add stop_booking_time field to lottery_games table
ALTER TABLE public.lottery_games 
ADD COLUMN stop_booking_time TIMESTAMP WITH TIME ZONE;

-- Update the game_status enum to include new values
-- First, add the new enum values
ALTER TYPE game_status ADD VALUE 'online';
ALTER TYPE game_status ADD VALUE 'booking_stopped';
ALTER TYPE game_status ADD VALUE 'archived';