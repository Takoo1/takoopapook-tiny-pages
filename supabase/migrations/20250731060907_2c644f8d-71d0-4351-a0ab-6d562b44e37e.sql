-- Add DELETE policy for lottery_games table for admin users
CREATE POLICY "Only admin users can delete lottery games" 
ON public.lottery_games 
FOR DELETE 
USING (EXISTS (
  SELECT 1
  FROM profiles
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add cascade deletion for related tables to maintain data integrity
ALTER TABLE public.lottery_books DROP CONSTRAINT IF EXISTS lottery_books_lottery_game_id_fkey;
ALTER TABLE public.lottery_books 
ADD CONSTRAINT lottery_books_lottery_game_id_fkey 
FOREIGN KEY (lottery_game_id) 
REFERENCES public.lottery_games(id) 
ON DELETE CASCADE;

ALTER TABLE public.lottery_tickets DROP CONSTRAINT IF EXISTS lottery_tickets_lottery_game_id_fkey;
ALTER TABLE public.lottery_tickets 
ADD CONSTRAINT lottery_tickets_lottery_game_id_fkey 
FOREIGN KEY (lottery_game_id) 
REFERENCES public.lottery_games(id) 
ON DELETE CASCADE;

ALTER TABLE public.lottery_tickets DROP CONSTRAINT IF EXISTS lottery_tickets_book_id_fkey;
ALTER TABLE public.lottery_tickets 
ADD CONSTRAINT lottery_tickets_book_id_fkey 
FOREIGN KEY (book_id) 
REFERENCES public.lottery_books(id) 
ON DELETE CASCADE;

ALTER TABLE public.fortune_counter_resets DROP CONSTRAINT IF EXISTS fortune_counter_resets_lottery_game_id_fkey;
ALTER TABLE public.fortune_counter_resets 
ADD CONSTRAINT fortune_counter_resets_lottery_game_id_fkey 
FOREIGN KEY (lottery_game_id) 
REFERENCES public.lottery_games(id) 
ON DELETE CASCADE;