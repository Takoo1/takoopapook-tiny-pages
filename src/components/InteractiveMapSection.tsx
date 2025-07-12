
import { useState } from 'react';
import { useLocations, useMapSettings } from '@/hooks/useLocations';
import StaticImageMap from './StaticImageMap';
import OverlayLocationDetails from './OverlayLocationDetails';
import { Location } from '@/types/database';

const InteractiveMapSection = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const { data: mapSettings } = useMapSettings();

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedLocation(null);
  };

  if (locationsLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Explore Arunachal Pradesh
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the breathtaking destinations across the Land of the Rising Sun. 
            Click on any location to learn more about its unique attractions and experiences.
          </p>
        </div>

        {/* Single Full-Width Map Container */}
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden h-[600px] lg:h-[700px]">
            <StaticImageMap
              locations={locations}
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
              mapSettings={mapSettings}
            />
            
            {/* Overlay Details */}
            <OverlayLocationDetails
              location={selectedLocation}
              isOpen={isDetailsOpen}
              onClose={handleCloseDetails}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMapSection;
