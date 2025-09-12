import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

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
}

interface ReplyInputProps {
  videoId: string;
  parentCommentId: string;
  onReplySubmit: (reply: Comment) => void;
  onCancel: () => void;
  mentionUser: string;
}

export const ReplyInput: React.FC<ReplyInputProps> = ({
  videoId,
  parentCommentId,
  onReplySubmit,
  onCancel,
  mentionUser
}) => {
  const [replyContent, setReplyContent] = useState(`@${mentionUser} `);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const newReply = {
        video_id: videoId,
        parent_comment_id: parentCommentId,
        content: replyContent.trim(),
        user_id: user?.id || null,
        user_session: user ? null : crypto.randomUUID(),
      };

      const { data, error } = await supabase
        .from('media_video_comments')
        .insert(newReply)
        .select(`
          *,
          profiles!fk_media_video_comments_user_id (
            display_name,
            full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      onReplySubmit(data);
      setReplyContent(`@${mentionUser} `);
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        title: "Error",
        description: "Failed to submit reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-muted/30 rounded-md p-3 space-y-3">
      <Textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="Write a reply..."
        className="min-h-[80px] resize-none border-0 bg-background"
        disabled={isSubmitting}
      />
      
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button
          size="sm"
          onClick={handleSubmitReply}
          disabled={!replyContent.trim() || isSubmitting}
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Posting...' : 'Reply'}
        </Button>
      </div>
    </div>
  );
};