import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from './button';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  index: number;
}

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export const MediaLightbox = ({ 
  isOpen, 
  onClose, 
  media, 
  currentIndex, 
  onIndexChange 
}: MediaLightboxProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen || media.length === 0) return null;

  const currentMedia = media[currentIndex];
  const canGoNext = currentIndex < media.length - 1;
  const canGoPrev = currentIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      onIndexChange(currentIndex + 1);
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      onIndexChange(currentIndex - 1);
      setIsPlaying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight' && canGoNext) handleNext();
    if (e.key === 'ArrowLeft' && canGoPrev) handlePrev();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Navigation Buttons */}
        {canGoPrev && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {canGoNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Media Content */}
        <div 
          className="max-w-5xl max-h-full w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt={`Media ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : (
            <div className="relative">
              <video
                src={currentMedia.url}
                controls
                className="max-w-full max-h-full object-contain rounded-lg"
                autoPlay={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        {/* Media Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} of {media.length}
        </div>

        {/* Thumbnail Navigation */}
        {media.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex space-x-2 max-w-xs overflow-x-auto">
            {media.map((item, index) => (
              <button
                key={index}
                className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden ${
                  index === currentIndex ? 'border-white' : 'border-white/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onIndexChange(index);
                }}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};