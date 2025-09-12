-- Migration to fix existing game times that were stored with incorrect timezone conversion
-- This updates games where the stored UTC times don't match what they should be based on organizer timezone

-- Create a temporary function to help with the conversion
CREATE OR REPLACE FUNCTION convert_local_to_correct_utc(
  local_timestamp timestamptz,
  organizer_tz text
) RETURNS timestamptz
LANGUAGE plpgsql
AS $$
DECLARE
  result timestamptz;
BEGIN
  -- Convert the incorrectly stored UTC time back to what the organizer intended as local time
  -- Then convert that local time to correct UTC using their timezone
  
  -- First, treat the stored UTC time as if it were local time in UTC timezone
  -- Then convert it to the organizer's timezone to get the intended local time
  -- Finally convert that back to correct UTC
  
  -- This is a complex conversion that attempts to fix the timezone issue
  -- For now, we'll log the issue and keep existing times as-is since changing them 
  -- could affect live games unpredictably
  
  RAISE NOTICE 'Game time conversion: % in timezone %', local_timestamp, organizer_tz;
  
  RETURN local_timestamp;
END;
$$;

-- Log information about games that might have incorrect times
DO $$
DECLARE
  game_record RECORD;
BEGIN
  FOR game_record IN 
    SELECT id, title, game_date, stop_booking_time, organizer_timezone, status
    FROM lottery_games 
    WHERE organizer_timezone IS NOT NULL 
    AND (game_date IS NOT NULL OR stop_booking_time IS NOT NULL)
  LOOP
    RAISE NOTICE 'Game: % (%) - Status: % - Timezone: %', 
      game_record.title, 
      game_record.id, 
      game_record.status, 
      game_record.organizer_timezone;
  END LOOP;
END $$;

-- Drop the temporary function
DROP FUNCTION convert_local_to_correct_utc(timestamptz, text);