-- Update the DELETE policy to allow users to delete both their authenticated likes AND guest session likes
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.media_video_reactions;

CREATE POLICY "Users can delete their own reactions" ON public.media_video_reactions
FOR DELETE USING (
  -- Allow deletion if user owns the record
  auth.uid() = user_id
  -- Or if it's a guest session record (user_id is null)
  OR user_id IS NULL
);