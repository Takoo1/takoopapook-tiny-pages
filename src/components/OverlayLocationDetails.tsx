import { useState } from 'react';
import { Location } from '@/types/database';
import { X, ChevronLeft, ChevronRight, MapPin, Camera, Info, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlanButton from './PlanButton';

interface OverlayLocationDetailsProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
}

const OverlayLocationDetails = ({ location, isOpen, onClose }: OverlayLocationDetailsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!location || !isOpen) return null;

  const nextImage = () => {
    if (location.images && location.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === location.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (location.images && location.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? location.images.length - 1 : prev - 1
      );
    }
  };

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('video');
  };

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{location.name}</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Explore Different Location</span>
          </Button>
        </div>

        {/* Content Area - 70% for media, 30% for info */}
        <div className="flex-1 flex flex-col">
          {/* Media Section - 70% */}
          <div className="h-[70%] relative bg-muted">
            {location.images && location.images.length > 0 ? (
              <div className="relative h-full">
                {isVideo(location.images[currentImageIndex]) ? (
                  <video
                    src={location.images[currentImageIndex]}
                    className="w-full h-full object-cover"
                    controls
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <img
                    src={location.images[currentImageIndex]}
                    alt={location.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80';
                    }}
                  />
                )}

                {/* Navigation arrows */}
                {location.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Media indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {location.images.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    >
                      {isVideo(media) && index === currentImageIndex && (
                        <Play className="h-2 w-2 text-black" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Media counter */}
                <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm flex items-center space-x-1">
                  <Camera className="h-4 w-4" />
                  <span>{currentImageIndex + 1} / {location.images.length}</span>
                </div>
              </div>
            ) : (
              <div className="h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold">{location.name}</h3>
                </div>
              </div>
            )}
          </div>

          {/* Information Section - 30% */}
          <div className="h-[30%] bg-background border-t border-border">
            <div className="h-full flex">
              {/* Description Column - 50% */}
              <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
                <div className="flex items-center space-x-2 mb-4">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">About</h3>
                </div>
                {location.description ? (
                  <p className="text-muted-foreground leading-relaxed">
                    {location.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    No description available for this location.
                  </p>
                )}
              </div>

              {/* Highlights Column - 50% */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Key Highlights</span>
                </h3>
                {location.bullet_points && location.bullet_points.length > 0 ? (
                  <ul className="space-y-3">
                    {location.bullet_points.map((point, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">
                    No highlights available for this location.
                  </p>
                )}

                {/* Plan Button */}
                <div className="mt-6">
                  <PlanButton 
                    locationId={location.id} 
                    locationName={location.name}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayLocationDetails;