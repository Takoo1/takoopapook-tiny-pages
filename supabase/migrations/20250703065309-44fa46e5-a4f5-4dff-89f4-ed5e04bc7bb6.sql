-- Create storage bucket for location media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'location-media', 
  'location-media', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
);

-- Create storage policies for location media
CREATE POLICY "Public read access for location media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'location-media');

CREATE POLICY "Public upload access for location media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'location-media');

CREATE POLICY "Public update access for location media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'location-media');

CREATE POLICY "Public delete access for location media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'location-media');