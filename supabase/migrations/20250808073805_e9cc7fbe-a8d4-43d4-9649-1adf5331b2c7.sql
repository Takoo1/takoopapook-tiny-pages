-- Create planned_packages table for tracking planned packages
CREATE TABLE public.planned_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL,
  user_session TEXT NOT NULL,
  planned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.planned_packages ENABLE ROW LEVEL SECURITY;

-- Create policies for planned_packages
CREATE POLICY "Allow all operations on planned_packages" 
ON public.planned_packages 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create unique constraint to prevent duplicates
CREATE UNIQUE INDEX idx_planned_packages_unique ON public.planned_packages (package_id, user_session);