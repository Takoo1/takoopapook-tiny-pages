-- Add game_code and game_password columns to lottery_games table
ALTER TABLE public.lottery_games 
ADD COLUMN game_code TEXT,
ADD COLUMN game_password TEXT;

-- Create storage policy for lottery images upload
CREATE POLICY "Allow public uploads to lottery-images bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'lottery-images');

-- Create storage policy for lottery images access
CREATE POLICY "Allow public access to lottery-images bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'lottery-images');

-- Create storage policy for lottery images update
CREATE POLICY "Allow public updates to lottery-images bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'lottery-images');

-- Function to generate random alphanumeric codes
CREATE OR REPLACE FUNCTION public.generate_random_code(length INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;