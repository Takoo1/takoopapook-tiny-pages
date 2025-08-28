import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MediaVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
}

export function VideoThumbnailCarousel() {
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<MediaVideo | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (videos.length === 0) return;

    const interval = setInterval(() => {
      if (videos.length > 3) {
        setCurrentIndex((prevIndex) => 
          prevIndex >= videos.length - 3 ? 0 : prevIndex + 1
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [videos.length]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('media_videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (videos.length > 3) {
      setCurrentIndex((prevIndex) => 
        prevIndex >= videos.length - 3 ? 0 : prevIndex + 1
      );
    }
  };

  const prevSlide = () => {
    if (videos.length > 3) {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? videos.length - 3 : prevIndex - 1
      );
    }
  };

  if (loading || videos.length === 0) {
    return null;
  }

  const visibleVideos = videos.slice(currentIndex, currentIndex + 3);
  if (visibleVideos.length < 3 && videos.length >= 3) {
    visibleVideos.push(...videos.slice(0, 3 - visibleVideos.length));
  }

  return (
    <>
      <section className="py-12 bg-gradient-to-r from-secondary/30 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Videos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover exciting content and stay updated with our latest videos
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-3 gap-6">
              {visibleVideos.map((video, index) => (
                <div
                  key={`${video.id}-${index}`}
                  className="group cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="aspect-[9/16] relative bg-muted rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={video.video_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                      <div className="bg-white/90 hover:bg-white rounded-full p-3 transform group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-8 w-8 text-primary ml-1" />
                      </div>
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-white font-medium text-sm line-clamp-2">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation arrows */}
            {videos.length > 3 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-3 rounded-full shadow-lg transition-colors duration-200"
                  aria-label="Previous videos"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-3 rounded-full shadow-lg transition-colors duration-200"
                  aria-label="Next videos"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          {selectedVideo && (
            <div className="aspect-video">
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}