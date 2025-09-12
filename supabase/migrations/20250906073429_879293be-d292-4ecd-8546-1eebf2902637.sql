-- Clean up database constraints - remove the conflicting constraint
DROP INDEX IF EXISTS public.ux_video_react_by_user;