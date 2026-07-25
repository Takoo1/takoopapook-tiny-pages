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
      <div className="min-h-screen px-4 pt-5 pb-32">
        <div className="mb-5 animate-fade-in">
          <div className="h-6 w-40 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-3 w-56 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
              <div className="h-3 w-4/5 mx-auto rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 pb-24">
        <div className="text-center max-w-sm">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25 flex items-center justify-center mb-5 shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.5)]">
            <Video className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Videos Yet</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Check back soon for premium draw highlights and updates from Fortune Bridge.
          </p>
          <Button onClick={() => window.location.assign('/')} className="rounded-2xl h-12 px-6">
            Browse Lotteries
          </Button>
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
  const categories: { id: typeof selectedCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'from_fortune_bridge', label: 'Fortune Bridge' },
    { id: 'about_games', label: 'Lottery Games' },
  ];

  return (
    <div className="min-h-screen pb-32 px-4 pt-5">
      {/* Page Header */}
      <div className="mb-4 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Videos</h1>
        <p className="text-sm text-muted-foreground mt-1">Draw highlights, previews and updates</p>
      </div>

      {/* Video Grid - Premium 2-column layout */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {filteredVideos.map((video, index) => (
          <button
            key={video.id}
            onClick={() => handleThumbnailClick(video)}
            className="group text-left animate-fade-in active:scale-[0.98] transition-transform"
            style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border/60 bg-card shadow-[0_6px_20px_-10px_hsl(var(--primary)/0.35)]">
              {/* Thumbnail */}
              <img
                src={video.preview_image_url || video.thumbnail_url || '/placeholder.svg'}
                alt={video.title}
                loading="lazy"
                onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
                className="w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:scale-[1.03]"
              />

              {/* Gradient veil for legibility */}
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Serial pill */}
              <div className="absolute top-2 left-2 h-6 min-w-6 px-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white text-[11px] font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/95 border border-primary-foreground/20 shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.7)] flex items-center justify-center transition-transform group-active:scale-90">
                  <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground ml-0.5" />
                </div>
              </div>

              {/* Title overlay */}
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <h3 className="text-white text-[12px] font-semibold leading-snug line-clamp-2 drop-shadow">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-white/70 text-[10px] line-clamp-1 mt-0.5">{video.description}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Empty in category */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25 flex items-center justify-center mb-4">
            <Video className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold mb-1">Nothing here yet</h3>
          <p className="text-xs text-muted-foreground">Try selecting a different category</p>
        </div>
      )}

      {/* Category Filter Bar - premium noir pills */}
      <div className="fixed bottom-[3.75rem] left-0 right-0 z-30">
        <div className="mx-3 mb-2 rounded-2xl border border-primary/25 bg-card/90 backdrop-blur-xl shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.5)] px-2 py-2">
          <div className="flex justify-center gap-1.5">
            {categories.map((c) => {
              const active = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`flex-1 h-9 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97] ${
                    active
                      ? 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.6)]'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
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
