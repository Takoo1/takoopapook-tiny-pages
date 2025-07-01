
import { useState } from 'react';
import { useLocations, useMapSettings } from '@/hooks/useLocations';
import ArunachalMap from './ArunachalMap';
import LocationDetails from './LocationDetails';
import { Location } from '@/types/database';

const InteractiveMapSection = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const { data: mapSettings } = useMapSettings();

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Map Container - Top on mobile, Right on desktop */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 h-[500px] lg:h-[600px]">
              <ArunachalMap
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
                mapSettings={mapSettings}
              />
            </div>
          </div>

          {/* Details Container - Bottom on mobile, Left on desktop */}
          <div className="order-2 lg:order-1">
            <LocationDetails location={selectedLocation} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMapSection;
