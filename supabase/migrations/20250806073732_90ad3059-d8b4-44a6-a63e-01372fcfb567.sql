-- Create bookings table to store package booking information
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL,
  package_title TEXT NOT NULL,
  package_location TEXT NOT NULL,
  package_duration TEXT NOT NULL,
  package_price TEXT NOT NULL,
  package_image_url TEXT NOT NULL,
  tourists JSONB NOT NULL,
  total_price NUMERIC NOT NULL,
  booking_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented)
CREATE POLICY "Allow all operations on bookings" 
ON public.bookings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_bookings_updated_at();