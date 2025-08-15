
-- Add editable field to packages table
ALTER TABLE public.packages 
ADD COLUMN is_editable boolean NOT NULL DEFAULT true;
