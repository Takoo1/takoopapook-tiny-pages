import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Share, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MediaVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
}

interface VideoReaction {
  id: string;
  video_id: string;
  reaction_type: string;
  user_id?: string;
  user_session?: string;
}

export default function Videos() {
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<Record<string, VideoReaction[]>>({});
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (videos.length > 0) {
      // Auto-play current video
      const currentVideo = videoRefs.current[currentVideoIndex];
      if (currentVideo) {
        currentVideo.play().catch(() => {
          // Autoplay might be blocked, that's okay
        });
      }

      // Pause all other videos
      videoRefs.current.forEach((video, index) => {
        if (video && index !== currentVideoIndex) {
          video.pause();
        }
      });
    }
  }, [currentVideoIndex, videos]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('media_videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setVideos(data || []);

      // Fetch reactions for all videos
      if (data && data.length > 0) {
        const { data: reactionData } = await supabase
          .from('media_video_reactions')
          .select('*')
          .in('video_id', data.map(v => v.id));

        if (reactionData) {
          const groupedReactions = reactionData.reduce((acc, reaction) => {
            if (!acc[reaction.video_id]) {
              acc[reaction.video_id] = [];
            }
            acc[reaction.video_id].push(reaction);
            return acc;
          }, {} as Record<string, VideoReaction[]>);
          setReactions(groupedReactions);
        }
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (videoId: string, reactionType: string = 'like') => {
    try {
      const userSession = crypto.randomUUID(); // Generate session ID for guest users
      
      // Check if user already reacted
      if (userReactions[videoId]) {
        // Remove existing reaction
        await supabase
          .from('media_video_reactions')
          .delete()
          .eq('video_id', videoId)
          .eq('user_session', userSession);
        
        setUserReactions(prev => {
          const newReactions = { ...prev };
          delete newReactions[videoId];
          return newReactions;
        });
      } else {
        // Add new reaction
        await supabase
          .from('media_video_reactions')
          .insert({
            video_id: videoId,
            reaction_type: reactionType,
            user_session: userSession
          });

        setUserReactions(prev => ({
          ...prev,
          [videoId]: reactionType
        }));
      }

      // Refresh reactions for this video
      const { data: reactionData } = await supabase
        .from('media_video_reactions')
        .select('*')
        .eq('video_id', videoId);

      if (reactionData) {
        setReactions(prev => ({
          ...prev,
          [videoId]: reactionData
        }));
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to react to video",
        variant: "destructive",
      });
    }
  };

  const scrollToNext = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      // Smooth scroll to next video
      const nextVideo = videoRefs.current[currentVideoIndex + 1];
      if (nextVideo && containerRef.current) {
        nextVideo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const scrollToPrevious = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      // Smooth scroll to previous video
      const prevVideo = videoRefs.current[currentVideoIndex - 1];
      if (prevVideo && containerRef.current) {
        prevVideo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getReactionCount = (videoId: string, type: string = 'like') => {
    return reactions[videoId]?.filter(r => r.reaction_type === type).length || 0;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Videos Available</h2>
          <p className="text-muted-foreground">Check back later for new content!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="h-screen relative snap-start flex items-center justify-center bg-black"
        >
          {/* Video */}
          <video
            ref={(el) => (videoRefs.current[index] = el)}
            src={video.video_url}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            onClick={() => {
              const videoEl = videoRefs.current[index];
              if (videoEl) {
                if (videoEl.paused) {
                  videoEl.play();
                } else {
                  videoEl.pause();
                }
              }
            }}
          />

          {/* Content overlay */}
          <div className="absolute bottom-safe-bottom left-4 right-20 text-white z-10">
            <h3 className="text-lg font-bold mb-2 line-clamp-2">{video.title}</h3>
            {video.description && (
              <p className="text-sm opacity-80 line-clamp-3 mb-4">{video.description}</p>
            )}
          </div>

          {/* Interaction sidebar */}
          <div className="absolute right-4 bottom-safe-bottom flex flex-col items-center space-y-6 z-10">
            {/* Like button */}
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center text-white hover:text-red-500 ${
                userReactions[video.id] ? 'text-red-500' : ''
              }`}
              onClick={() => handleReaction(video.id, 'like')}
            >
              <Heart 
                className={`h-8 w-8 ${userReactions[video.id] ? 'fill-current' : ''}`} 
              />
              <span className="text-xs mt-1">{getReactionCount(video.id, 'like')}</span>
            </Button>

            {/* Comment button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center text-white hover:text-blue-500"
            >
              <MessageCircle className="h-8 w-8" />
              <span className="text-xs mt-1">0</span>
            </Button>

            {/* Share button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center text-white hover:text-green-500"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: video.title,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Link copied!",
                    description: "Video link copied to clipboard",
                  });
                }
              }}
            >
              <Share className="h-8 w-8" />
            </Button>
          </div>

          {/* Navigation arrows */}
          {index > 0 && (
            <button
              onClick={scrollToPrevious}
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors duration-200 z-10"
              aria-label="Previous video"
            >
              <ChevronUp className="h-6 w-6" />
            </button>
          )}
          
          {index < videos.length - 1 && (
            <button
              onClick={scrollToNext}
              className="absolute bottom-32 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors duration-200 z-10"
              aria-label="Next video"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
          )}

          {/* Video progress indicator */}
          <div className="absolute top-4 left-4 text-white text-sm z-10">
            {index + 1} / {videos.length}
          </div>
        </div>
      ))}
    </div>
  );
}