-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('package', 'destination')),
  item_id UUID NOT NULL,
  experience_summary TEXT NOT NULL,
  detailed_review TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 5.0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Allow all operations on reviews" 
ON public.reviews 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create policy for public to read published reviews
CREATE POLICY "Allow public read access to published reviews" 
ON public.reviews 
FOR SELECT 
USING (is_published = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for review media
INSERT INTO storage.buckets (id, name, public) VALUES ('review-media', 'review-media', true);

-- Create storage policies for review media
CREATE POLICY "Allow public read access to review media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'review-media');

CREATE POLICY "Allow authenticated users to upload review media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'review-media');

CREATE POLICY "Allow authenticated users to update their review media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'review-media');

CREATE POLICY "Allow authenticated users to delete review media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'review-media');