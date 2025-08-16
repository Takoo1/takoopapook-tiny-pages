
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Location } from '@/types/database';
import PlanButton from '@/components/PlanButton';

interface DestinationCardProps {
  location: Location;
  onClick?: () => void; // Optional click handler to override default navigation
}

const DestinationCard = ({ location, onClick }: DestinationCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

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

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/my-tour/destination/${location.id}`);
    }
  };

  const handlePlanClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation when clicking heart
  };

  return (
    <div 
      className="mobile-card mobile-card-hover w-full h-[360px] sm:h-[380px] flex flex-col cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image/Video Carousel */}
      <div className="relative h-44 sm:h-48 overflow-hidden flex-shrink-0 rounded-t-xl">
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
        
        {/* Plan Button (Heart Icon) */}
        <div className="absolute top-3 right-3" onClick={handlePlanClick}>
          <PlanButton 
            itemId={location.id} 
            itemType="location"
            itemName={location.name}
            variant="compact"
          />
        </div>
        
        {/* Rating Overlay */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1 mobile-text-sm">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{location.rating || 0}</span>
          <span className="text-gray-300">({location.reviews_count || 0})</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="mobile-card-content flex-1 flex flex-col">
        <h3 className="mobile-heading-md mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {location.name}
        </h3>
        
        {/* Content Area with Fixed Height */}
        <div className="flex-1 min-h-[60px]">
          {/* Key Points/Highlights */}
          {location.bullet_points && location.bullet_points.length > 0 ? (
            <div className="mobile-spacing">
              {location.bullet_points.slice(0, 2).map((point, index) => (
                <div key={index} className="flex items-start space-x-2 mobile-text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="line-clamp-1">{point}</span>
                </div>
              ))}
              {location.bullet_points.length > 2 && (
                <div className="mobile-text-sm text-muted-foreground mt-1">
                  +{location.bullet_points.length - 2} more
                </div>
              )}
            </div>
          ) : location.description ? (
            <p className="mobile-text-sm text-muted-foreground line-clamp-2">
              {location.description}
            </p>
          ) : (
            <div className="mobile-text-sm text-muted-foreground italic">
              Discover this amazing destination
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
