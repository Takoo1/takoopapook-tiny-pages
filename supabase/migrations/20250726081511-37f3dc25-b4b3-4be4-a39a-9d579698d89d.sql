-- Create lottery games table
CREATE TABLE public.lottery_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  game_date TIMESTAMP WITH TIME ZONE NOT NULL,
  ticket_image_url TEXT,
  ticket_price DECIMAL(10,2) DEFAULT 0,
  total_tickets INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lottery tickets table
CREATE TABLE public.lottery_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lottery_game_id UUID NOT NULL REFERENCES public.lottery_games(id) ON DELETE CASCADE,
  ticket_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold_offline', 'sold_online')),
  booked_by_user_id UUID,
  booked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (lottery_game_id, ticket_number)
);

-- Enable Row Level Security
ALTER TABLE public.lottery_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for lottery_games (public read access)
CREATE POLICY "Anyone can view lottery games" 
ON public.lottery_games 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can create lottery games" 
ON public.lottery_games 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update lottery games" 
ON public.lottery_games 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policies for lottery_tickets (public read access)
CREATE POLICY "Anyone can view lottery tickets" 
ON public.lottery_tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can create lottery tickets" 
ON public.lottery_tickets 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update lottery tickets" 
ON public.lottery_tickets 
FOR UPDATE 
TO authenticated
USING (true);

-- Create storage bucket for lottery images
INSERT INTO storage.buckets (id, name, public) VALUES ('lottery-images', 'lottery-images', true);

-- Create storage policies for lottery images
CREATE POLICY "Anyone can view lottery images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'lottery-images');

CREATE POLICY "Authenticated users can upload lottery images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'lottery-images');

CREATE POLICY "Authenticated users can update lottery images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'lottery-images');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_lottery_games_updated_at
BEFORE UPDATE ON public.lottery_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate tickets for a lottery game
CREATE OR REPLACE FUNCTION public.generate_lottery_tickets(game_id UUID, num_tickets INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert tickets for the lottery game
  INSERT INTO public.lottery_tickets (lottery_game_id, ticket_number)
  SELECT game_id, generate_series(1, num_tickets);
END;
$$;