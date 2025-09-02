import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Share, ChevronUp, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VideoCommentsSheet } from "@/components/VideoCommentsSheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface MediaVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
}

interface VideoComment {
  id: string;
  content: string;
  created_at: string;
  user_id?: string;
  user_session?: string;
}

export default function Videos() {
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commentsCount, setCommentsCount] = useState<Record<string, number>>({});
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<MediaVideo | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchVideos();
  }, []);

  // Intersection Observer for scroll-based autoplay
  useEffect(() => {
    if (!isMobile || videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoElement = entry.target as HTMLVideoElement;
            const videoIndex = videoRefs.current.indexOf(videoElement);
            if (videoIndex !== -1 && videoIndex !== currentVideoIndex) {
              setCurrentVideoIndex(videoIndex);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [videos, isMobile, currentVideoIndex]);

  useEffect(() => {
    if (videos.length > 0) {
      // Auto-play current video
      const currentVideo = videoRefs.current[currentVideoIndex];
      if (currentVideo) {
        currentVideo.muted = isMuted;
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
  }, [currentVideoIndex, videos, isMuted]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('media_videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setVideos(data || []);

      // Fetch comment counts for all videos
      if (data && data.length > 0) {
        const commentCounts: Record<string, number> = {};
        
        for (const video of data) {
          const { count } = await supabase
            .from('media_video_comments')
            .select('*', { count: 'exact', head: true })
            .eq('video_id', video.id);
          
          commentCounts[video.id] = count || 0;
        }
        
        setCommentsCount(commentCounts);
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

  const handleShare = async (video: MediaVideo) => {
    try {
      const shareData = {
        title: video.title,
        text: video.description,
        url: `${window.location.origin}/videos/${video.id}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link copied!",
          description: "Video link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  const handleOpenComments = (video: MediaVideo) => {
    setSelectedVideoForComments(video);
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

  const getCommentCount = (videoId: string) => {
    return commentsCount[videoId] || 0;
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
    <>
      <div 
        ref={containerRef}
        className={`${isMobile ? 'fixed inset-0 pb-20' : 'h-screen'} overflow-y-auto snap-y snap-mandatory scrollbar-hide`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
      {videos.map((video, index) => (
        <div
          key={video.id}
          className={`${isMobile ? 'h-[calc(100vh-5rem)]' : 'h-screen'} relative snap-start flex items-center justify-center bg-black`}
        >
          {/* Video */}
          <video
            ref={(el) => (videoRefs.current[index] = el)}
            src={video.video_url}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onClick={() => {
              if (index === currentVideoIndex) {
                setIsMuted(!isMuted);
              }
            }}
          />

          {/* Sound toggle indicator */}
          {index === currentVideoIndex && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/50 rounded-full p-2">
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
          )}

          {/* Content overlay */}
          <div className={`absolute ${isMobile ? 'bottom-20' : 'bottom-safe-bottom'} left-4 right-20 text-white z-10`}>
            <h3 className="text-lg font-bold mb-2 line-clamp-2">{video.title}</h3>
            {video.description && (
              <p className="text-sm opacity-80 line-clamp-3 mb-4">{video.description}</p>
            )}
          </div>

          {/* Interaction sidebar */}
          <div className={`absolute right-4 ${isMobile ? 'bottom-28' : 'bottom-safe-bottom'} flex flex-col items-center space-y-4 z-10`}>
            {/* Comment button */}
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleOpenComments(video)}
            >
              <MessageCircle className="h-8 w-8 text-white hover:text-blue-400 transition-colors" />
              <span className="text-xs mt-1 text-white font-medium">{getCommentCount(video.id)}</span>
            </div>

            {/* Share button */}
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleShare(video)}
            >
              <Share className="h-8 w-8 text-white hover:text-green-400 transition-colors" />
            </div>
          </div>

          {/* Navigation arrows - hidden on mobile */}
          {!isMobile && index > 0 && (
            <button
              onClick={scrollToPrevious}
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors duration-200 z-10"
              aria-label="Previous video"
            >
              <ChevronUp className="h-6 w-6" />
            </button>
          )}
          
          {!isMobile && index < videos.length - 1 && (
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

      {/* Comments Sheet */}
      <VideoCommentsSheet
        isOpen={!!selectedVideoForComments}
        onClose={() => setSelectedVideoForComments(null)}
        videoId={selectedVideoForComments?.id || ""}
        videoTitle={selectedVideoForComments?.title || ""}
      />
    </>
  );
}