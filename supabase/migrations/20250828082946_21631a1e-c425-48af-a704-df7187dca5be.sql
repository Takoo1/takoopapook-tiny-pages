
-- Remove the Global Fortune Counter database objects

-- 1) Drop function used by the app for global counter
DROP FUNCTION IF EXISTS public.get_global_fortune_counter();

-- 2) Drop the global resets table (this will remove its RLS policies as well)
DROP TABLE IF EXISTS public.global_fortune_counter_resets;
