-- Check existing prize_type enum values and add new ones if needed
DO $$ 
BEGIN
    -- Add 'main_prize' to enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'main_prize' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'prize_type')) THEN
        ALTER TYPE prize_type ADD VALUE 'main_prize';
    END IF;
    
    -- Add 'incentive_prize' to enum if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'incentive_prize' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'prize_type')) THEN
        ALTER TYPE prize_type ADD VALUE 'incentive_prize';
    END IF;
END $$;

-- Add new columns to winners table
ALTER TABLE public.winners 
ADD COLUMN IF NOT EXISTS lottery_game_id UUID REFERENCES public.lottery_games(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS prize_type prize_type;

-- Set default values for existing rows
UPDATE public.winners SET prize_type = 'main_prize' WHERE prize_type IS NULL;
ALTER TABLE public.winners ALTER COLUMN prize_type SET NOT NULL;
ALTER TABLE public.winners ALTER COLUMN prize_type SET DEFAULT 'main_prize';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_winners_lottery_game_id ON public.winners(lottery_game_id);
CREATE INDEX IF NOT EXISTS idx_winners_prize_type ON public.winners(prize_type);