-- Fix existing media_images data by updating 'general' section_type to 'carousel'
-- This will ensure existing carousel images appear in the admin panel

UPDATE public.media_images 
SET section_type = 'carousel'::section_type
WHERE section_type = 'general'::section_type;