
import { useState } from 'react';
import { Location } from '@/types/database';
import { ChevronLeft, ChevronRight, MapPin, Camera, Info } from 'lucide-react';
import PlanButton from './PlanButton';

interface LocationDetailsProps {
  location: Location | null;
}

const LocationDetails = ({ location }: LocationDetailsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!location) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 h-[600px] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Select a Location
          </h3>
          <p className="text-gray-600 max-w-sm leading-relaxed">
            Click on any marker on the map to explore detailed information, 
            stunning images, and unique experiences of that tourism destination.
          </p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    if (location.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === location.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (location.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? location.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col animate-fade-in">
      {/* Image Carousel */}
      {location.images && location.images.length > 0 ? (
        <div className="relative h-80 bg-gray-200 overflow-hidden">
          <img
            src={location.images[currentImageIndex]}
            alt={location.name}
            className="w-full h-full object-cover transition-all duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80';
            }}
          />
          
          {location.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {location.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Image counter */}
          {location.images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              <Camera className="h-4 w-4 inline mr-1" />
              {currentImageIndex + 1} / {location.images.length}
            </div>
          )}
        </div>
      ) : (
        <div className="h-80 bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
          <div className="text-center text-white">
            <MapPin className="h-16 w-16 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold">{location.name}</h3>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{location.name}</h3>
        </div>

        {location.description && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="h-5 w-5 text-gray-500" />
              <h4 className="text-lg font-semibold text-gray-800">About</h4>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {location.description}
            </p>
          </div>
        )}

        {/* Key Highlights */}
        {location.bullet_points && location.bullet_points.length > 0 && (
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Key Highlights</span>
            </h4>
            <ul className="space-y-3 mb-6">
              {location.bullet_points.map((point, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700 leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Plan Button */}
        <div className="mt-auto">
          <PlanButton 
            itemId={location.id} 
            itemType="location"
            itemName={location.name}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;
