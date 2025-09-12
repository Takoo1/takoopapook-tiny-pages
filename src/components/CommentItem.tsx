import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, User } from "lucide-react";
import { ReplyInput } from "./ReplyInput";
import { ProfileImagePopup } from "./ProfileImagePopup";

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

interface CommentItemProps {
  comment: Comment;
  videoId: string;
  onReplyAdded: (parentId: string, reply: Comment) => void;
  level?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  videoId, 
  onReplyAdded, 
  level = 0 
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.like_count || 0);
  const [userHasLiked, setUserHasLiked] = useState(comment.user_has_liked || false);
  const { toast } = useToast();

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Get persistent session ID for guest users
      let userSession = null;
      if (!user) {
        userSession = localStorage.getItem('video_user_session');
        if (!userSession) {
          userSession = crypto.randomUUID();
          localStorage.setItem('video_user_session', userSession);
        }
      }

      if (userHasLiked) {
        // Unlike
        const deleteQuery = supabase
          .from('media_comment_reactions')
          .delete()
          .eq('comment_id', comment.id);

        if (user) {
          deleteQuery.eq('user_id', user.id);
        } else {
          deleteQuery.eq('user_session', userSession);
        }

        const { error } = await deleteQuery;
        if (error) throw error;

        setLikeCount(prev => Math.max(0, prev - 1));
        setUserHasLiked(false);
      } else {
        // Like
        const { error } = await supabase
          .from('media_comment_reactions')
          .insert({
            comment_id: comment.id,
            user_id: user?.id || null,
            user_session: user ? null : userSession,
            reaction_type: 'like'
          });

        if (error) throw error;

        setLikeCount(prev => prev + 1);
        setUserHasLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplySubmit = (reply: Comment) => {
    onReplyAdded(comment.id, reply);
    setShowReplyInput(false);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const displayName = comment.profiles?.display_name || 
                     comment.profiles?.full_name || 
                     comment.profiles?.email || 
                     'Anonymous';

  return (
    <div className={`flex gap-3 ${level > 0 ? 'ml-8 mt-3 border-l-2 border-muted pl-4' : ''}`}>
      <Avatar 
        className="w-8 h-8 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
        onClick={() => setShowProfilePopup(true)}
      >
        <AvatarImage 
          src={comment.profiles?.avatar_url} 
          alt={displayName} 
        />
        <AvatarFallback className="bg-primary/10 text-primary">
          <User className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(comment.created_at)}
          </span>
        </div>
        
        <p className="text-sm text-foreground whitespace-pre-wrap break-words mb-2">
          {comment.content}
        </p>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="h-auto p-1 hover:bg-transparent"
          >
            <Heart 
              className={`w-4 h-4 mr-1 ${userHasLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
            />
            <span className="text-xs text-muted-foreground">
              {likeCount > 0 ? likeCount : ''}
            </span>
          </Button>
          
          {level < 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="h-auto p-1 hover:bg-transparent"
            >
              <MessageCircle className="w-4 h-4 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Reply</span>
            </Button>
          )}
        </div>
        
        {showReplyInput && (
          <div className="mt-3">
            <ReplyInput
              videoId={videoId}
              parentCommentId={comment.id}
              onReplySubmit={handleReplySubmit}
              onCancel={() => setShowReplyInput(false)}
              mentionUser={displayName}
            />
          </div>
        )}
        
        {comment.replies && comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            videoId={videoId}
            onReplyAdded={onReplyAdded}
            level={level + 1}
          />
        ))}
      </div>
      
      <ProfileImagePopup
        isOpen={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        profile={comment.profiles}
      />
    </div>
  );
};