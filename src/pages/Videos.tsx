import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Play, ArrowLeft, MessageCircle, ExternalLink, Volume2, VolumeX, Heart, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VideoCommentsSheet } from "@/components/VideoCommentsSheet";
import { useParams } from "react-router-dom";

interface MediaVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  preview_image_url?: string;
  category: 'from_fortune_bridge' | 'about_games';
  game_tags: string[];
}

interface LotteryGame {
  id: string;
  title: string;
  description?: string;
  game_date: string;
  ticket_image_url?: string;
  ticket_price: number;
  total_tickets: number;
  available_tickets: number;
  organizing_group_name: string;
  status: 'online' | 'booking_stopped' | 'live';
}

interface VideoComment {
  id: string;
  content: string;
  created_at: string;
  user_id?: string;
  user_session?: string;
}

interface VideoReaction {
  id: string;
  video_id: string;
  user_id?: string;
  user_session?: string;
  reaction_type: string;
  created_at: string;
}

export default function Videos() {
  const { videoId } = useParams();
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<MediaVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'from_fortune_bridge' | 'about_games'>('all');
  const [taggedGames, setTaggedGames] = useState<Record<string, LotteryGame[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<MediaVideo | null>(null);
  const [commentsCount, setCommentsCount] = useState<Record<string, number>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [likeLoadingStates, setLikeLoadingStates] = useState<Record<string, boolean>>({});
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<MediaVideo | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showAuthMessage, setShowAuthMessage] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchVideos();
    initializeAuth();
  }, []);

  // Handle direct video link access
  useEffect(() => {
    if (videoId && videos.length > 0) {
      const video = videos.find(v => v.id === videoId);
      if (video) {
        setSelectedVideo(video);
      } else {
        toast({
          title: "Video not found",
          description: "The requested video could not be found.",
          variant: "destructive",
        });
      }
    }
  }, [videoId, videos, toast]);

  const initializeAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error getting user:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  // Initialize like data when videos are loaded or user changes
  useEffect(() => {
    if (videos.length > 0) {
      fetchLikeData();
      setupRealtimeSubscription();
    }
  }, [videos]);

  // Listen to authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const newUser = session?.user || null;
        setUser(newUser);
        
        // Fetch user likes when user signs in
        if (event === 'SIGNED_IN' && newUser && videos.length > 0) {
          setTimeout(() => fetchUserLikes(newUser.id), 0);
        } else if (event === 'SIGNED_OUT') {
          setUserLikes({});
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [videos]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('video-reactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_video_reactions'
        },
        (payload: any) => {
          // Efficiently update only the affected video
          const videoId = payload.new?.video_id || payload.old?.video_id;
          if (videoId && videos.some(v => v.id === videoId)) {
            updateVideoLikeData(videoId);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  // Filter videos when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(videos.filter(video => video.category === selectedCategory));
    }
  }, [videos, selectedCategory]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('media_videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
      setFilteredVideos(data || []);

      if (data && data.length > 0) {
        const commentCounts: Record<string, number> = {};
        const gamesData: Record<string, LotteryGame[]> = {};
        
        for (const video of data) {
          const { count } = await supabase
            .from('media_video_comments')
            .select('*', { count: 'exact', head: true })
            .eq('video_id', video.id);
          
          commentCounts[video.id] = count || 0;

          // Fetch tagged games for this video
          if (video.game_tags && video.game_tags.length > 0) {
            const { data: gameData, error: gameError } = await supabase
              .from('lottery_games')
              .select('id, title, description, game_date, ticket_image_url, ticket_price, total_tickets, organizing_group_name, status')
              .in('id', video.game_tags)
              .in('status', ['online', 'booking_stopped', 'live']);

            if (!gameError && gameData) {
              // Get available tickets count for each game
              const gamesWithCounts = await Promise.all(
                gameData.map(async (game) => {
                  const { count } = await supabase
                    .from('lottery_tickets')
                    .select('*', { count: 'exact', head: true })
                    .eq('lottery_game_id', game.id)
                    .eq('status', 'available');
                  
                  return {
                    ...game,
                    available_tickets: count || 0
                  };
                })
              );
              
              gamesData[video.id] = gamesWithCounts;
            }
          }
        }
        
        setCommentsCount(commentCounts);
        setTaggedGames(gamesData);
        await fetchLikeData();
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

  const handleOpenComments = async (video: MediaVideo) => {
    if (!user) {
      setShowAuthMessage('Please sign in to continue');
      setTimeout(() => setShowAuthMessage(''), 3000);
      return;
    }
    setSelectedVideoForComments(video);
  };

  // Optimized batch queries for like data
  const fetchLikeData = async () => {
    if (videos.length === 0) return;
    
    try {
      const videoIds = videos.map(v => v.id);
      
      // Single query to get all like counts
      const { data: likeCounts, error: countError } = await supabase
        .from('media_video_reactions')
        .select('video_id')
        .in('video_id', videoIds)
        .eq('reaction_type', 'like');
      
      if (!countError && likeCounts) {
        const counts: Record<string, number> = {};
        videoIds.forEach(id => counts[id] = 0);
        
        likeCounts.forEach(like => {
          counts[like.video_id] = (counts[like.video_id] || 0) + 1;
        });
        
        setLikesCount(counts);
      }

      // Fetch user likes if authenticated
      if (user) {
        await fetchUserLikes(user.id);
      }
    } catch (error) {
      console.error('Error fetching like data:', error);
    }
  };

  const fetchUserLikes = async (userId: string) => {
    if (videos.length === 0 || !userId) return;
    
    try {
      const videoIds = videos.map(v => v.id);
      
      // Single query to get all user likes
      const { data: userLikesData, error } = await supabase
        .from('media_video_reactions')
        .select('video_id')
        .in('video_id', videoIds)
        .eq('reaction_type', 'like')
        .eq('user_id', userId);
      
      if (!error && userLikesData) {
        const likes: Record<string, boolean> = {};
        videoIds.forEach(id => likes[id] = false);
        
        userLikesData.forEach(like => {
          likes[like.video_id] = true;
        });
        
        setUserLikes(likes);
      }
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  // Efficiently update single video's like data  
  const updateVideoLikeData = async (videoId: string) => {
    try {
      // Update like count
      const { count } = await supabase
        .from('media_video_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId)
        .eq('reaction_type', 'like');
      
      setLikesCount(prev => ({
        ...prev,
        [videoId]: count || 0
      }));

      // Update user like status if authenticated
      if (user) {
        const { data } = await supabase
          .from('media_video_reactions')
          .select('id')
          .eq('video_id', videoId)
          .eq('reaction_type', 'like')
          .eq('user_id', user.id)
          .limit(1);
        
        setUserLikes(prev => ({
          ...prev,
          [videoId]: !!(data && data.length > 0)
        }));
      }
    } catch (error) {
      console.error('Error updating video like data:', error);
    }
  };

  const handleLikeToggle = async (video: MediaVideo) => {
    if (!user) {
      setShowAuthMessage('Please sign in to continue');
      setTimeout(() => setShowAuthMessage(''), 3000);
      return;
    }

    // Prevent multiple clicks
    if (likeLoadingStates[video.id]) return;

    const isCurrentlyLiked = userLikes[video.id];
    const currentCount = likesCount[video.id] || 0;

    // Optimistic update
    setLikeLoadingStates(prev => ({ ...prev, [video.id]: true }));
    setUserLikes(prev => ({ ...prev, [video.id]: !isCurrentlyLiked }));
    setLikesCount(prev => ({ 
      ...prev, 
      [video.id]: currentCount + (isCurrentlyLiked ? -1 : 1) 
    }));

    try {
      if (isCurrentlyLiked) {
        // Remove like
        const { error } = await supabase
          .from('media_video_reactions')
          .delete()
          .eq('video_id', video.id)
          .eq('reaction_type', 'like')
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('media_video_reactions')
          .insert({
            video_id: video.id,
            user_id: user.id,
            reaction_type: 'like'
          });
        if (error) throw error;
      }

    } catch (error) {
      console.error('Error toggling like:', error);
      
      // Rollback optimistic update
      setUserLikes(prev => ({ ...prev, [video.id]: isCurrentlyLiked }));
      setLikesCount(prev => ({ ...prev, [video.id]: currentCount }));
      
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLikeLoadingStates(prev => ({ ...prev, [video.id]: false }));
    }
  };

  const getCommentCount = (videoId: string) => {
    return commentsCount[videoId] || 0;
  };

  const getLikeCount = (videoId: string) => {
    return likesCount[videoId] || 0;
  };

  const isVideoLiked = (videoId: string) => {
    return userLikes[videoId] || false;
  };

  const handleThumbnailClick = (video: MediaVideo) => {
    setSelectedVideo(video);
  };

  const handleBackFromVideo = () => {
    setSelectedVideo(null);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center pb-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Videos Available</h2>
          <p className="text-muted-foreground">Check back later for new content!</p>
        </div>
      </div>
    );
  }

  // Video Player Modal
  if (selectedVideo) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Back Button */}
        <Button
          onClick={handleBackFromVideo}
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        {/* Video Player */}
        <video
          src={selectedVideo.video_url}
          className="w-full h-full object-cover"
          controls
          autoPlay
          muted={isMuted}
          playsInline
        />

        {/* Sound Toggle */}
        <Button
          onClick={handleMuteToggle}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>

        {/* Video Info */}
        <div className="absolute bottom-20 left-4 right-20 text-white z-10">
          <h3 className="text-lg font-bold mb-2 line-clamp-2">{selectedVideo.title}</h3>
          {selectedVideo.description && (
            <p className="text-sm opacity-80 line-clamp-3 mb-4">{selectedVideo.description}</p>
          )}
          
          {/* Tagged Games Carousel */}
          {taggedGames[selectedVideo.id] && taggedGames[selectedVideo.id].length > 0 && (
            <div className="mt-4">
              <p className="text-xs opacity-60 mb-2">Related Games:</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {taggedGames[selectedVideo.id].map((game) => (
                  <div
                    key={game.id}
                    className="flex-shrink-0 w-40 bg-black/20 backdrop-blur-sm rounded-lg p-2 cursor-pointer hover:bg-black/30 transition-colors"
                    onClick={() => window.open(`/lottery/${game.id}`, '_blank')}
                  >
                    {game.ticket_image_url && (
                      <div className="aspect-video rounded overflow-hidden mb-1">
                        <img src={game.ticket_image_url} alt={game.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs font-semibold truncate">{game.title}</p>
                    <p className="text-xs opacity-70">₹{game.ticket_price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute right-4 bottom-28 flex flex-col items-center space-y-4 z-10">
          <div className="flex flex-col items-center cursor-pointer" onClick={() => handleLikeToggle(selectedVideo)}>
            <div className="relative">
              <Heart 
                className={`h-8 w-8 transition-all duration-200 ${
                  isVideoLiked(selectedVideo.id) 
                    ? 'text-red-500 fill-red-500 scale-110' 
                    : 'text-white hover:text-red-400'
                } ${likeLoadingStates[selectedVideo.id] ? 'opacity-50' : ''}`} 
              />
              {likeLoadingStates[selectedVideo.id] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border border-white rounded-full animate-spin border-t-transparent"></div>
                </div>
              )}
            </div>
            <span className="text-xs mt-1 text-white font-medium">{getLikeCount(selectedVideo.id)}</span>
          </div>
          
          <div className="flex flex-col items-center cursor-pointer" onClick={() => handleOpenComments(selectedVideo)}>
            <MessageCircle className="h-8 w-8 text-white hover:text-blue-400 transition-colors" />
            <span className="text-xs mt-1 text-white font-medium">{getCommentCount(selectedVideo.id)}</span>
          </div>

          <div className="flex flex-col items-center cursor-pointer" onClick={() => handleShare(selectedVideo)}>
            <ExternalLink className="h-8 w-8 text-white hover:text-green-400 transition-colors" />
          </div>
        </div>

        {/* Authentication Message - in video player */}
        {showAuthMessage && (
          <div className="fixed bottom-32 left-4 right-4 z-[80] flex justify-center">
            <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg text-sm font-medium shadow-lg animate-in slide-in-from-bottom-2">
              {showAuthMessage}
            </div>
          </div>
        )}

        {/* Comments Sheet - mounted in video modal */}
        {selectedVideoForComments && (
          <VideoCommentsSheet
            isOpen={!!selectedVideoForComments}
            onClose={() => setSelectedVideoForComments(null)}
            videoId={selectedVideoForComments.id}
            videoTitle={selectedVideoForComments.title}
          />
        )}
      </div>
    );
  }

  // Mobile Video Grid View
  return (
    <div className="min-h-screen pb-32 px-4 pt-4">
      {/* Video Grid - Simple 2-column layout */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {filteredVideos.map((video, index) => (
          <div key={video.id} className="space-y-2">
            <div
              className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => handleThumbnailClick(video)}
            >
              {/* Thumbnail Image */}
              <img
                src={video.preview_image_url || video.thumbnail_url || '/placeholder.svg'}
                alt={video.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              
              {/* Serial Number Overlay */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xl font-bold rounded-full w-8 h-8 flex items-center justify-center">
                {index + 1}
              </div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 rounded-full p-3">
                  <Play className="h-8 w-8 text-black fill-black ml-1" />
                </div>
              </div>
            </div>
            
            {/* Title Below Image */}
            <h3 className="text-foreground text-sm font-medium line-clamp-2 text-center px-1">
              {video.title}
            </h3>
          </div>
        ))}
      </div>

      {/* No Videos Message */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No videos in this category</h3>
          <p className="text-muted-foreground">Try selecting a different category</p>
        </div>
      )}

      {/* Category Filter Buttons - Fixed at bottom above nav */}
      <div className="fixed bottom-[3.75rem] left-0 right-0 z-30 bg-background/80 backdrop-blur-sm">
        <div className="flex justify-center gap-2 py-2 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className={`rounded-md text-xs px-3 py-2 h-8 border ${
              selectedCategory === 'all' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'border-border bg-background/70'
            }`}
          >
            All Videos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory('from_fortune_bridge')}
            className={`rounded-md text-xs px-3 py-2 h-8 border ${
              selectedCategory === 'from_fortune_bridge' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'border-border bg-background/70'
            }`}
          >
            From Fortune Bridge
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory('about_games')}
            className={`rounded-md text-xs px-3 py-2 h-8 border ${
              selectedCategory === 'about_games' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'border-border bg-background/70'
            }`}
          >
            Lottery Games
          </Button>
        </div>
      </div>

      {/* Comments Sheet */}
      {selectedVideoForComments && (
        <VideoCommentsSheet
          isOpen={!!selectedVideoForComments}
          onClose={() => setSelectedVideoForComments(null)}
          videoId={selectedVideoForComments.id}
          videoTitle={selectedVideoForComments.title}
        />
      )}

      {/* Authentication Message */}
      {showAuthMessage && (
        <div className="fixed bottom-36 left-4 right-4 z-[70] flex justify-center">
          <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg text-sm font-medium shadow-lg animate-in slide-in-from-bottom-2">
            {showAuthMessage}
          </div>
        </div>
      )}
    </div>
  );
}
