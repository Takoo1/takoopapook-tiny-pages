-- First, let's check what status values currently exist
-- We need to add new status values and a stop_booking_time field

-- Add stop_booking_time field to lottery_games table
ALTER TABLE public.lottery_games 
ADD COLUMN stop_booking_time TIMESTAMP WITH TIME ZONE;

-- Update the game_status enum to include new statuses
-- First drop the existing constraint if it exists
ALTER TABLE public.lottery_games DROP CONSTRAINT IF EXISTS lottery_games_status_check;

-- Add the new constraint with updated status values
ALTER TABLE public.lottery_games 
ADD CONSTRAINT lottery_games_status_check 
CHECK (status IN ('pending', 'online', 'booking_stopped', 'live', 'archived'));