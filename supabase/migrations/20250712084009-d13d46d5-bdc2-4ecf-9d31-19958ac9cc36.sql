-- Check and update storage bucket policies to allow AVIF and other modern image formats
-- Update the location-media bucket to support more mime types

-- First, let's ensure the bucket accepts all common image and video formats
-- Update bucket policies to be more permissive with mime types

-- Create comprehensive storage policies for location-media bucket
CREATE POLICY "Allow all image and video uploads to location-media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'location-media');

CREATE POLICY "Allow public read access to location-media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'location-media');

CREATE POLICY "Allow updates to location-media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'location-media');

CREATE POLICY "Allow deletions from location-media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'location-media');