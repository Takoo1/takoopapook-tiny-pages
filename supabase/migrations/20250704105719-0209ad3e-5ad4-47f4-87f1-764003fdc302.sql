-- Create a table for tour packages
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_code TEXT NOT NULL UNIQUE, -- Format like "12A", "24B"
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  duration TEXT NOT NULL,
  group_size TEXT NOT NULL,
  price TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  locations_included TEXT[] NOT NULL DEFAULT '{}', -- New field
  reviews TEXT[] NOT NULL DEFAULT '{}', -- New field for review text
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to packages" 
ON public.packages 
FOR SELECT 
USING (is_active = true);

-- Create policies for admin access (all operations)
CREATE POLICY "Allow all operations on packages" 
ON public.packages 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing package data
INSERT INTO public.packages (package_code, title, location, duration, group_size, price, rating, reviews_count, image_url, features, locations_included, reviews) VALUES
('12A', 'Tawang Monastery Adventure', 'Tawang, Arunachal Pradesh', '5 Days, 4 Nights', '2-8 People', '₹25,000', 4.8, 124, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', ARRAY['Ancient Monastery', 'Mountain Views', 'Local Culture'], ARRAY['Tawang Monastery', 'Sela Pass', 'Jaswant Garh'], ARRAY['Amazing experience visiting the monastery', 'Beautiful mountain views throughout the journey', 'Great cultural immersion with local tribes']),
('24B', 'Ziro Valley Cultural Tour', 'Ziro Valley, Arunachal Pradesh', '4 Days, 3 Nights', '2-6 People', '₹18,000', 4.9, 89, 'https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', ARRAY['Apatani Tribe', 'Rice Fields', 'Music Festival'], ARRAY['Ziro Valley', 'Talley Valley', 'Kile Pakho'], ARRAY['Incredible cultural experience with Apatani tribe', 'Music festival was absolutely fantastic', 'Rice fields are breathtakingly beautiful']),
('35C', 'Sela Pass Expedition', 'Sela Pass, Arunachal Pradesh', '3 Days, 2 Nights', '4-12 People', '₹15,000', 4.7, 156, 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', ARRAY['High Altitude', 'Snow Views', 'Adventure Trek'], ARRAY['Sela Pass', 'Sela Lake', 'Nuranang Falls'], ARRAY['High altitude adventure was thrilling', 'Snow-capped peaks were magnificent', 'Perfect for adventure enthusiasts']),
('46D', 'Namdapha Wildlife Safari', 'Namdapha National Park', '6 Days, 5 Nights', '3-10 People', '₹32,000', 4.6, 78, 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', ARRAY['Wildlife Safari', 'Dense Forests', 'Rare Species'], ARRAY['Namdapha National Park', 'Deban', 'Firmbase'], ARRAY['Spotted rare wildlife species', 'Dense forest trek was adventurous', 'Great for nature and wildlife lovers']),
('57E', 'Bomdila Heritage Walk', 'Bomdila, Arunachal Pradesh', '3 Days, 2 Nights', '2-8 People', '₹12,000', 4.5, 92, 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', ARRAY['Buddhist Culture', 'Craft Center', 'Mountain Views'], ARRAY['Bomdila Monastery', 'Apple Orchards', 'Craft Center'], ARRAY['Buddhist culture was enlightening', 'Craft center showcased amazing local art', 'Mountain views from monastery were spectacular']);