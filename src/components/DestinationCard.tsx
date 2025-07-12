
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Location } from '@/types/database';

interface DestinationCardProps {
  location: Location;
}

const DestinationCard = ({ location }: DestinationCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-slide carousel
  useEffect(() => {
    if (!location.images || location.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % location.images.length
      );
    }, 3000); // Auto slide every 3 seconds

    return () => clearInterval(interval);
  }, [location.images]);

  const hasMedia = location.images && location.images.length > 0;
  const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop";

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full max-w-sm">
      {/* Image/Video Carousel */}
      <div className="relative h-48 overflow-hidden">
        {hasMedia ? (
          <>
            <img
              src={location.images[currentImageIndex] || defaultImage}
              alt={location.name}
              className="w-full h-full object-cover transition-opacity duration-500"
              onError={(e) => {
                e.currentTarget.src = defaultImage;
              }}
            />
            {location.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {location.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <img
            src={defaultImage}
            alt={location.name}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Rating Overlay */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1 text-sm">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{location.rating || 0}</span>
          <span className="text-gray-300">({location.reviews_count || 0})</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
          {location.name}
        </h3>
        
        {/* Key Points/Highlights */}
        {location.bullet_points && location.bullet_points.length > 0 && (
          <div className="space-y-1">
            {location.bullet_points.slice(0, 3).map((point, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="line-clamp-1">{point}</span>
              </div>
            ))}
            {location.bullet_points.length > 3 && (
              <div className="text-xs text-gray-400 mt-1">
                +{location.bullet_points.length - 3} more highlights
              </div>
            )}
          </div>
        )}

        {/* Description fallback if no bullet points */}
        {(!location.bullet_points || location.bullet_points.length === 0) && location.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {location.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default DestinationCard;
