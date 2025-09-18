import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
interface MediaImage {
  id: string;
  name: string;
  public_url: string;
}
export function ImageCarousel() {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  useEffect(() => {
    fetchImages();
  }, []);
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => prevIndex === images.length - 1 ? 0 : prevIndex + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, [images.length]);
  const fetchImages = async () => {
    try {
      // First try to fetch from media_images table
      const {
        data: mediaImagesData,
        error: dbError
      } = await supabase.from('media_images').select('*').eq('is_active', true).eq('section_type', 'carousel').order('display_order', {
        ascending: true
      });
      if (dbError) {
        console.error('Error fetching from media_images:', dbError);
      }
      if (mediaImagesData && mediaImagesData.length > 0) {
        // Use data from media_images table
        const imageData: MediaImage[] = mediaImagesData.map(img => ({
          id: img.id,
          name: img.name,
          public_url: img.public_url
        }));
        setImages(imageData);
      } else {
        // Fallback to storage listing for backward compatibility
        const {
          data: imageFiles
        } = await supabase.storage.from('media-images').list('', {
          limit: 100
        });
        if (imageFiles && imageFiles.length > 0) {
          const imageData: MediaImage[] = imageFiles.map(file => ({
            id: file.name,
            name: file.name,
            public_url: supabase.storage.from('media-images').getPublicUrl(file.name).data.publicUrl
          }));
          setImages(imageData);

          // Seed the media_images table for future use
          const seedData = imageData.map((img, index) => ({
            name: img.name,
            public_url: img.public_url,
            display_order: index + 1,
            is_active: true,
            section_type: 'carousel'
          }));
          try {
            await supabase.from('media_images').upsert(seedData, {
              onConflict: 'name',
              ignoreDuplicates: true
            });
          } catch (seedError) {
            console.error('Error seeding media_images:', seedError);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };
  const nextSlide = () => {
    setCurrentIndex(prevIndex => prevIndex === images.length - 1 ? 0 : prevIndex + 1);
  };
  const prevSlide = () => {
    setCurrentIndex(prevIndex => prevIndex === 0 ? images.length - 1 : prevIndex - 1);
  };
  if (loading || images.length === 0) {
    return null;
  }
  return <section className="py-8 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="mx-auto px-2 md:px-4">
        {isMobile ?
      // Mobile Layout: Heading above carousel
      <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold text-center text-foreground px-4 whitespace-nowrap">
                Why Choose <br/> <img src="https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/Site_name-removebg-preview.png" alt="Fortune Bridge" className="inline-block h-9 max-w-fit object-contain" />
              </h2>
            <div className="relative overflow-hidden rounded-2xl shadow-card">
              <div className="flex transition-transform duration-500 ease-in-out" style={{
            transform: `translateX(-${currentIndex * 100}%)`
          }}>
                {images.map(image => <div key={image.id} className="w-full flex-shrink-0">
                    <div className="aspect-video relative">
                      <img src={image.public_url} alt="Promotional content" className="w-full h-full object-cover" />
                    </div>
                  </div>)}
              </div>

            </div>
          </div> :
      // Desktop Layout: Two columns
      <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground whitespace-nowrap text-center">
                Why Choose <img src="https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/Site_name-removebg-preview.png" alt="Fortune Bridge" className="inline-block h-14 object-contain" />
              </h2>
            </div>
            <div className="relative overflow-hidden rounded-2xl shadow-card">
              <div className="flex transition-transform duration-500 ease-in-out" style={{
            transform: `translateX(-${currentIndex * 100}%)`
          }}>
                {images.map(image => <div key={image.id} className="w-full flex-shrink-0">
                    <div className="aspect-video relative">
                      <img src={image.public_url} alt="Promotional content" className="w-full h-full object-cover" />
                    </div>
                  </div>)}
              </div>

            </div>
          </div>}
      </div>
    </section>;
}
