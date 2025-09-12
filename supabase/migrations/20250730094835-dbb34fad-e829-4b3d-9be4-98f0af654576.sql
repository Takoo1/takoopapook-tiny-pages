-- Create lottery_books table to manage books within each game
CREATE TABLE public.lottery_books (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lottery_game_id UUID NOT NULL REFERENCES public.lottery_games(id) ON DELETE CASCADE,
    book_name TEXT NOT NULL,
    first_ticket_number INTEGER NOT NULL,
    last_ticket_number INTEGER NOT NULL,
    is_online_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_ticket_range CHECK (last_ticket_number >= first_ticket_number)
);

-- Enable RLS on lottery_books
ALTER TABLE public.lottery_books ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lottery_books
CREATE POLICY "Anyone can view lottery books" 
ON public.lottery_books 
FOR SELECT 
USING (true);

CREATE POLICY "Only admin users can create lottery books" 
ON public.lottery_books 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Only admin users can update lottery books" 
ON public.lottery_books 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add book_id to lottery_tickets table
ALTER TABLE public.lottery_tickets 
ADD COLUMN book_id UUID REFERENCES public.lottery_books(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_lottery_tickets_book_id ON public.lottery_tickets(book_id);
CREATE INDEX idx_lottery_books_game_id ON public.lottery_books(lottery_game_id);

-- Create trigger for automatic timestamp updates on lottery_books
CREATE TRIGGER update_lottery_books_updated_at
BEFORE UPDATE ON public.lottery_books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate tickets for a specific book
CREATE OR REPLACE FUNCTION public.generate_lottery_tickets_for_book(
    game_id UUID, 
    book_id UUID,
    start_num INTEGER, 
    end_num INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Insert tickets for the lottery game book with custom range
    INSERT INTO public.lottery_tickets (lottery_game_id, book_id, ticket_number)
    SELECT game_id, book_id, generate_series(start_num, end_num);
END;
$$;