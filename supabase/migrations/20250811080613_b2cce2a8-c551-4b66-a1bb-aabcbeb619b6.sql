
-- 1) Track which user owns a booking (aligns with planned_* tables' user_session pattern)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS user_session text;

-- 2) Helpful index for per-user queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_session
  ON public.bookings (user_session);
