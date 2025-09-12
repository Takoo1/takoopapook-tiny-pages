-- Create media_images table for image ordering
CREATE TABLE public.media_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_by_user_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on media_images
ALTER TABLE public.media_images ENABLE ROW LEVEL SECURITY;

-- Create policies for media_images
CREATE POLICY "Admins can manage all media images"
ON public.media_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active media images"
ON public.media_images
FOR SELECT
USING (is_active = true);

-- Create winners table
CREATE TABLE public.winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  prize_position INTEGER NOT NULL,
  details TEXT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on winners
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Create policies for winners
CREATE POLICY "Admins can manage all winners"
ON public.winners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active winners"
ON public.winners
FOR SELECT
USING (is_active = true);

-- Create winners storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('winners', 'winners', true);

-- Create storage policies for winners bucket
CREATE POLICY "Public can view winners images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'winners');

CREATE POLICY "Admins can upload winners images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'winners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update winners images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'winners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete winners images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'winners' AND has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger for media_images
CREATE TRIGGER update_media_images_updated_at
BEFORE UPDATE ON public.media_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for winners
CREATE TRIGGER update_winners_updated_at
BEFORE UPDATE ON public.winners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();