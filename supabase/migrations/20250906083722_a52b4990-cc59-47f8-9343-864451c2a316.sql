-- Create ENUM types for media management
CREATE TYPE section_type AS ENUM ('hero', 'carousel', 'general');
CREATE TYPE video_category AS ENUM ('from_fortune_bridge', 'about_games');

-- Add new columns to media_images table
ALTER TABLE public.media_images 
ADD COLUMN section_type section_type DEFAULT 'general';

-- Add new columns to media_videos table  
ALTER TABLE public.media_videos 
ADD COLUMN category video_category DEFAULT 'from_fortune_bridge',
ADD COLUMN game_tags TEXT[] DEFAULT '{}',
ADD COLUMN preview_image_url TEXT;

-- Update existing images based on is_hero_section flag
UPDATE public.media_images 
SET section_type = CASE 
  WHEN is_hero_section = true THEN 'hero'::section_type
  ELSE 'general'::section_type
END;

-- Create index for better performance on filtering
CREATE INDEX idx_media_images_section_type ON public.media_images(section_type);
CREATE INDEX idx_media_videos_category ON public.media_videos(category);
CREATE INDEX idx_media_videos_game_tags ON public.media_videos USING GIN(game_tags);