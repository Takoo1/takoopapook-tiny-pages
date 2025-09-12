-- First drop all existing constraints and indexes
DROP INDEX IF EXISTS public.ux_video_react_by_user_or_session;
DROP INDEX IF EXISTS public.ux_video_react_by_session;
ALTER TABLE public.media_video_reactions 
DROP CONSTRAINT IF EXISTS ux_video_react_by_user;

-- Create new proper constraints to prevent duplicate likes
-- One constraint for authenticated users
CREATE UNIQUE INDEX ux_video_react_by_user_id 
ON public.media_video_reactions (video_id, reaction_type, user_id) 
WHERE user_id IS NOT NULL;

-- One constraint for guest users  
CREATE UNIQUE INDEX ux_video_react_by_session 
ON public.media_video_reactions (video_id, reaction_type, user_session) 
WHERE user_id IS NULL AND user_session IS NOT NULL;