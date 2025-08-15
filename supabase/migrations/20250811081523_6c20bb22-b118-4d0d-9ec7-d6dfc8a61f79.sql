-- Track which user owns a booking
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS user_session text;

-- Helpful index for per-user queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_session
  ON public.bookings (user_session);