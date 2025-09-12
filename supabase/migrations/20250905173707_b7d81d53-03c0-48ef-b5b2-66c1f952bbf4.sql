-- Add link_url column to media_images table
ALTER TABLE public.media_images 
ADD COLUMN link_url TEXT;

-- Add link_url column to media_videos table
ALTER TABLE public.media_videos 
ADD COLUMN link_url TEXT;

-- Add indexes for better performance when querying by link_url
CREATE INDEX idx_media_images_link_url ON public.media_images(link_url) WHERE link_url IS NOT NULL;
CREATE INDEX idx_media_videos_link_url ON public.media_videos(link_url) WHERE link_url IS NOT NULL;