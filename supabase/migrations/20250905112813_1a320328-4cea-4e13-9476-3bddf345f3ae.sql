-- Add foreign key relationship between media_video_comments and profiles
-- This will allow PostgREST to understand the relationship for joins
ALTER TABLE public.media_video_comments 
ADD CONSTRAINT fk_media_video_comments_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) 
ON DELETE SET NULL;