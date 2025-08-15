-- Create a new storage bucket specifically for videos with larger size limits
INSERT INTO storage.buckets (id, name, public) VALUES ('review-videos', 'review-videos', true);

-- Create policies for video uploads (similar to existing review-media bucket)
CREATE POLICY "Users can view videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'review-videos');

CREATE POLICY "Anyone can upload videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'review-videos');

CREATE POLICY "Anyone can update videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'review-videos');

CREATE POLICY "Anyone can delete videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'review-videos');