import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { CommentItem } from "./CommentItem";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  user_session: string | null;
  parent_comment_id: string | null;
  profiles?: {
    display_name?: string;
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
  like_count?: number;
  user_has_liked?: boolean;
  replies?: Comment[];
}

interface VideoCommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
}

export function VideoCommentsSheet({ isOpen, onClose, videoId, videoTitle }: VideoCommentsSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && videoId) {
      fetchComments();
      
      // Listen for new comments and reactions
      const channel = supabase
        .channel('video_comments_and_reactions')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'media_video_comments',
            filter: `video_id=eq.${videoId}`,
          },
          async (payload) => {
            // Refresh comments to get proper structure with replies
            fetchComments();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'media_comment_reactions',
          },
          () => {
            // Refresh comments when reactions change
            fetchComments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, videoId]);

  const fetchComments = async () => {
    if (!videoId) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('media_video_comments')
        .select(`
          *,
          profiles!fk_media_video_comments_user_id (
            display_name,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('video_id', videoId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch like counts and user reactions for each comment
      const commentsWithLikes = await Promise.all(
        (data || []).map(async (comment) => {
          // Get like count
          const { count: likeCount } = await supabase
            .from('media_comment_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.id)
            .eq('reaction_type', 'like');

          // Check if user has liked
          let userHasLiked = false;
          if (user) {
            const { data: userReaction } = await supabase
              .from('media_comment_reactions')
              .select('id')
              .eq('comment_id', comment.id)
              .eq('user_id', user.id)
              .eq('reaction_type', 'like')
              .single();
            userHasLiked = !!userReaction;
          }

          // Fetch replies
          const { data: replies } = await supabase
            .from('media_video_comments')
            .select(`
              *,
              profiles!fk_media_video_comments_user_id (
                display_name,
                full_name,
                email,
                avatar_url
              )
            `)
            .eq('parent_comment_id', comment.id)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            like_count: likeCount || 0,
            user_has_liked: userHasLiked,
            replies: replies || []
          };
        })
      );

      setComments(commentsWithLikes);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const commentData = {
        video_id: videoId,
        content: newComment.trim(),
        user_id: user?.id || null,
        user_session: user ? null : crypto.randomUUID(),
        parent_comment_id: null, // Top-level comment
      };

      const { error } = await supabase
        .from('media_video_comments')
        .insert(commentData);

      if (error) throw error;

      setNewComment('');
      toast({
        title: "Success",
        description: "Your comment has been posted!",
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyAdded = useCallback((parentId: string, reply: Comment) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    }));
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-xl p-0 z-[60] h-[70vh]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b border-border/50 bg-background flex-shrink-0">
            <SheetTitle className="text-base font-medium truncate">
              Comments • {videoTitle}
            </SheetTitle>
          </SheetHeader>

          {/* Comments List - Scrollable Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className={`h-full px-4 ${isMobile ? 'pb-4' : ''}`}>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No comments yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Be the first to comment!</p>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      videoId={videoId}
                      onReplyAdded={handleReplyAdded}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Comment Input - Fixed at Bottom */}
          <div className="p-4 border-t border-border/50 bg-background flex-shrink-0">
            <div className="flex gap-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[40px] max-h-[100px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
                disabled={submitting}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                size="sm"
                className="h-10 px-3"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}