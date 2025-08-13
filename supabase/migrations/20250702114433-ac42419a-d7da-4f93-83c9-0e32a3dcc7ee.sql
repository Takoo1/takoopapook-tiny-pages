-- Fix numeric field overflow by updating coordinate column precision
-- Current precision(5,2) only allows values up to 999.99
-- We need to store coordinates up to 2000x1200 for the map

-- Update locations table coordinate columns
ALTER TABLE public.locations 
ALTER COLUMN coordinates_x TYPE numeric(6,0),
ALTER COLUMN coordinates_y TYPE numeric(6,0);

-- Update map_settings table coordinate columns  
ALTER TABLE public.map_settings
ALTER COLUMN center_x TYPE numeric(6,0),
ALTER COLUMN center_y TYPE numeric(6,0);

-- Also update zoom columns to allow more precision
ALTER TABLE public.map_settings
ALTER COLUMN initial_zoom TYPE numeric(8,3),
ALTER COLUMN min_zoom TYPE numeric(8,3),
ALTER COLUMN max_zoom TYPE numeric(8,3);