-- Create a unique constraint to prevent duplicate likes per user per video
-- This handles both authenticated and guest users properly
ALTER TABLE public.media_video_reactions 
DROP CONSTRAINT IF EXISTS ux_video_react_by_user;

-- Create a new constraint that allows one like per video per user (either by user_id or user_session)
CREATE UNIQUE INDEX ux_video_react_by_user_or_session 
ON public.media_video_reactions (video_id, reaction_type, user_id) 
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX ux_video_react_by_session 
ON public.media_video_reactions (video_id, reaction_type, user_session) 
WHERE user_id IS NULL AND user_session IS NOT NULL;