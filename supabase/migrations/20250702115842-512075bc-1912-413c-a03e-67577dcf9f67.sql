-- Remove outdated check constraints that limit coordinates to 0-100
-- We need coordinates to go up to 2000x1200 for the map

DROP CONSTRAINT IF EXISTS locations_coordinates_x_check ON public.locations;
DROP CONSTRAINT IF EXISTS locations_coordinates_y_check ON public.locations;

-- Add new check constraints with proper ranges for the map (2000x1200)
ALTER TABLE public.locations 
ADD CONSTRAINT locations_coordinates_x_check 
CHECK (coordinates_x >= 0 AND coordinates_x <= 2000);

ALTER TABLE public.locations 
ADD CONSTRAINT locations_coordinates_y_check 
CHECK (coordinates_y >= 0 AND coordinates_y <= 1200);