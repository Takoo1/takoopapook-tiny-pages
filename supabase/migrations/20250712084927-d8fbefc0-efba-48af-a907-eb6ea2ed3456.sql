-- Add categories column to locations table
ALTER TABLE public.locations 
ADD COLUMN categories TEXT[] DEFAULT '{}';

-- Add index for better performance on categories queries
CREATE INDEX idx_locations_categories ON public.locations USING GIN(categories);