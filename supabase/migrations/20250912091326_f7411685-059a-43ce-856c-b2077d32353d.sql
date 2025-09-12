-- Drop the duplicate foreign key constraint to fix PGRST201 error
-- Keep the original winners_lottery_game_id_fkey and the new fk_winners_custom_game_id
ALTER TABLE winners DROP CONSTRAINT IF EXISTS fk_winners_lottery_game_id;