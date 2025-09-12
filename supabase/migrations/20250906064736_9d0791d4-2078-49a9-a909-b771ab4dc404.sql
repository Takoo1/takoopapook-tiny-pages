-- Add reply support to comments
ALTER TABLE public.media_video_comments 
ADD COLUMN parent_comment_id UUID REFERENCES public.media_video_comments(id) ON DELETE CASCADE;

-- Add index for better performance on parent comments
CREATE INDEX idx_media_video_comments_parent ON public.media_video_comments(parent_comment_id);

-- Create comment reactions table
CREATE TABLE public.media_comment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.media_video_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_session TEXT,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate reactions
CREATE UNIQUE INDEX idx_media_comment_reactions_unique_user 
ON public.media_comment_reactions(comment_id, user_id) 
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX idx_media_comment_reactions_unique_session 
ON public.media_comment_reactions(comment_id, user_session) 
WHERE user_session IS NOT NULL;

-- Enable RLS on comment reactions
ALTER TABLE public.media_comment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for comment reactions
CREATE POLICY "Anyone can view comment reactions" 
ON public.media_comment_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create comment reactions" 
ON public.media_comment_reactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can delete their own reactions" 
ON public.media_comment_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX idx_media_comment_reactions_comment ON public.media_comment_reactions(comment_id);
CREATE INDEX idx_media_comment_reactions_user ON public.media_comment_reactions(user_id) WHERE user_id IS NOT NULL;