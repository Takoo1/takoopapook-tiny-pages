import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroFallback from "@/assets/hero-fortune-bridge.jpg";

interface HeroMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string;
  display_order: number;
  title?: string;
  link_url?: string;
}

export function HeroCarousel() {
  const navigate = useNavigate();
  const [heroMedia, setHeroMedia] = useState<HeroMedia[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroMedia();
  }, []);

  useEffect(() => {
    if (heroMedia.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === heroMedia.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroMedia.length]);

  const fetchHeroMedia = async () => {
    try {
      // Fetch hero images
      const { data: heroImages } = await supabase
        .from('media_images')
        .select('id, name, public_url, display_order, link_url')
        .eq('section_type', 'hero')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      // Fetch hero videos
      const { data: heroVideos } = await supabase
        .from('media_videos')
        .select('id, title, video_url, thumbnail_url, display_order, link_url')
        .eq('is_hero_section', true)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      const mediaArray: HeroMedia[] = [];

      // Add images
      (heroImages || []).forEach(img => {
        mediaArray.push({
          id: img.id,
          type: 'image',
          url: img.public_url,
          display_order: img.display_order,
          link_url: img.link_url
        });
      });

      // Add videos
      (heroVideos || []).forEach(video => {
        mediaArray.push({
          id: video.id,
          type: 'video',
          url: video.video_url,
          thumbnail_url: video.thumbnail_url,
          display_order: video.display_order,
          title: video.title,
          link_url: video.link_url
        });
      });

      // Sort by display order
      mediaArray.sort((a, b) => a.display_order - b.display_order);
      setHeroMedia(mediaArray);
    } catch (error) {
      console.error('Error fetching hero media:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === heroMedia.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? heroMedia.length - 1 : prevIndex - 1
    );
  };

  const handleMediaClick = (linkUrl: string) => {
    // Check if it's an external URL
    if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
      window.location.href = linkUrl;
      return;
    }

    // Handle internal URLs with hash fragments
    if (linkUrl.includes('#')) {
      const [path, hash] = linkUrl.split('#');
      navigate(path);
      
      // Scroll to the element after a short delay to ensure page is rendered
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Regular internal navigation
      navigate(linkUrl);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  // Empty state when no hero media is uploaded
  if (heroMedia.length === 0) {
    return (
      <div className="absolute inset-0 bg-muted/10 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">No hero media uploaded</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Media Container */}
      <div 
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {heroMedia.map((media, index) => (
          <div key={media.id} className="w-full flex-shrink-0 relative h-full">
            {media.link_url ? (
              <div 
                onClick={() => handleMediaClick(media.link_url!)}
                className="cursor-pointer w-full h-full relative group"
              >
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt="Hero content"
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: '16/9' }}
                  />
                ) : (
                  <video
                    src={media.url}
                    autoPlay={index === currentIndex}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: '16/9' }}
                    poster={media.thumbnail_url}
                  />
                )}
              </div>
            ) : (
              <>
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt="Hero content"
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: '16/9' }}
                  />
                ) : (
                  <video
                    src={media.url}
                    autoPlay={index === currentIndex}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: '16/9' }}
                    poster={media.thumbnail_url}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}