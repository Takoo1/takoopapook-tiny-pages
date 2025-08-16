-- Add completed status option to bookings table
-- Update the existing status column to allow 'completed' status

-- Add the completed status option to the existing status field
-- The status field already exists with default 'confirmed', now we extend it to support 'completed'

COMMENT ON COLUMN public.bookings.status IS 'Booking status: confirmed, pending, cancelled, completed';