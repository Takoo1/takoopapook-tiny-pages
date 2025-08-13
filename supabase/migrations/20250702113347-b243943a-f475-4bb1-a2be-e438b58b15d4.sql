-- Create a table to track user planned locations
CREATE TABLE public.planned_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  user_session TEXT NOT NULL, -- Using session ID instead of user_id for now
  planned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(location_id, user_session)
);

-- Enable Row Level Security
ALTER TABLE public.planned_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for planned locations (allow all for now since no auth)
CREATE POLICY "Allow all operations on planned_locations" 
ON public.planned_locations 
FOR ALL 
USING (true) 
WITH CHECK (true);