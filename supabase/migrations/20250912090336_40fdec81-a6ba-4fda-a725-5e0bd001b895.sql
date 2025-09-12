-- Clean up any orphaned references before adding foreign keys
UPDATE winners 
SET custom_game_id = NULL 
WHERE custom_game_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM custom_winner_games 
    WHERE id = winners.custom_game_id
  );

UPDATE winners 
SET lottery_game_id = NULL 
WHERE lottery_game_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM lottery_games 
    WHERE id = winners.lottery_game_id
  );

-- Add foreign key constraints with ON DELETE SET NULL to preserve winners
ALTER TABLE winners 
ADD CONSTRAINT fk_winners_custom_game_id 
FOREIGN KEY (custom_game_id) 
REFERENCES custom_winner_games(id) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

ALTER TABLE winners 
ADD CONSTRAINT fk_winners_lottery_game_id 
FOREIGN KEY (lottery_game_id) 
REFERENCES lottery_games(id) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- Add indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_winners_custom_game_id 
ON winners(custom_game_id) 
WHERE custom_game_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_winners_lottery_game_id 
ON winners(lottery_game_id) 
WHERE lottery_game_id IS NOT NULL;