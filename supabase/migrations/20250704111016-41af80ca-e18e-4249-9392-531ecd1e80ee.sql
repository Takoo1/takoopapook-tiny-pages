-- Add new fields to locations table for destination management
ALTER TABLE public.locations 
ADD COLUMN rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
ADD COLUMN reviews_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN reviews TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN packages_included TEXT[] NOT NULL DEFAULT '{}';

-- Add index for better performance on rating queries
CREATE INDEX idx_locations_rating ON public.locations(rating);
CREATE INDEX idx_locations_packages ON public.locations USING GIN(packages_included);