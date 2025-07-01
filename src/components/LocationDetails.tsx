
import { useState } from 'react';
import { Location } from '@/types/database';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface LocationDetailsProps {
  location: Location | null;
}

const LocationDetails = ({ location }: LocationDetailsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!location) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 h-[500px] lg:h-[600px] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Explore Arunachal Pradesh
          </h3>
          <p className="text-gray-600 max-w-md">
            Click on any location marker on the map to discover detailed information, 
            stunning images, and unique experiences that await you.
          </p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === location.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? location.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[500px] lg:h-[600px] flex flex-col animate-fade-in">
      {/* Image Carousel */}
      {location.images.length > 0 && (
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          <img
            src={location.images[currentImageIndex]}
            alt={location.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
          
          {location.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {location.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-5 w-5 text-emerald-500" />
          <h3 className="text-2xl font-bold text-gray-800">{location.name}</h3>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
          {location.description}
        </p>

        {/* Bullet Points */}
        {location.bullet_points.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Key Highlights
            </h4>
            <ul className="space-y-2">
              {location.bullet_points.map((point, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDetails;
