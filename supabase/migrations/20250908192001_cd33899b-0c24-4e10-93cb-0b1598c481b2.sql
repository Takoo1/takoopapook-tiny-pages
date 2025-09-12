-- Delete all guest video reactions (where user_id is NULL)
-- This will clean up problematic guest likes that cause persistence issues
DELETE FROM media_video_reactions 
WHERE user_id IS NULL;