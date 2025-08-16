import { useState } from 'react';
import { Star, Calendar, Image as ImageIcon, Video, Play } from 'lucide-react';
import { Badge } from './badge';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { MediaLightbox } from './MediaLightbox';
import { Review } from '@/types/database';

interface ReviewCardProps {
  review: Review;
  userProfileImage?: string;
}

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  index: number;
}

export const ReviewCard = ({ review, userProfileImage }: ReviewCardProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Combine images and videos into a single media array
  const allMedia: MediaItem[] = [
    ...review.images.map((url, index) => ({ url, type: 'image' as const, index })),
    ...review.videos.map((url, index) => ({ url, type: 'video' as const, index: index + review.images.length }))
  ];

  const openLightbox = (index: number) => {
    setCurrentMediaIndex(index);
    setLightboxOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="p-6">
          {/* Mobile Layout - Stack vertically */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side - Profile and Content */}
            <div className="flex-1 space-y-4">
              {/* Profile Section */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                  <AvatarImage 
                    src={userProfileImage} 
                    alt={review.reviewer_name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                    {getInitials(review.reviewer_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.reviewer_name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating 
                                  ? 'text-yellow-500 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({review.rating})</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Experience Summary */}
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-800 italic leading-relaxed">
                  &ldquo;{review.experience_summary}&rdquo;
                </p>
              </div>

              {/* Detailed Review */}
              <div>
                <p className="text-gray-700 leading-relaxed">
                  {review.detailed_review}
                </p>
              </div>

              {/* Review Date */}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>

            {/* Right Side - Media Gallery */}
            {allMedia.length > 0 && (
              <div className="lg:w-80 space-y-3">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Media Gallery ({allMedia.length})
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {allMedia.slice(0, 4).map((media, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
                      onClick={() => openLightbox(index)}
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={`Review media ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Show "+" overlay for additional media */}
                      {index === 3 && allMedia.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            +{allMedia.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Media Type Indicators */}
                <div className="flex justify-between text-xs text-gray-500">
                  {review.images.length > 0 && (
                    <span>{review.images.length} image{review.images.length !== 1 ? 's' : ''}</span>
                  )}
                  {review.videos.length > 0 && (
                    <span>{review.videos.length} video{review.videos.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Lightbox */}
      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        media={allMedia}
        currentIndex={currentMediaIndex}
        onIndexChange={setCurrentMediaIndex}
      />
    </>
  );
};