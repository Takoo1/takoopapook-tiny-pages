-- Add is_hero_section column to media_images table
ALTER TABLE public.media_images 
ADD COLUMN is_hero_section boolean NOT NULL DEFAULT false;

-- Add is_hero_section column to media_videos table  
ALTER TABLE public.media_videos 
ADD COLUMN is_hero_section boolean NOT NULL DEFAULT false;

-- Add indexes for efficient querying
CREATE INDEX idx_media_images_hero_section ON public.media_images(is_hero_section) WHERE is_hero_section = true;
CREATE INDEX idx_media_videos_hero_section ON public.media_videos(is_hero_section) WHERE is_hero_section = true;

-- Add indexes for non-hero content (used by regular carousels)
CREATE INDEX idx_media_images_non_hero ON public.media_images(is_active, display_order) WHERE is_hero_section = false OR is_hero_section IS NULL;
CREATE INDEX idx_media_videos_non_hero ON public.media_videos(is_active, display_order) WHERE is_hero_section = false OR is_hero_section IS NULL;