
import { useState } from 'react';
import { useLocations, useMapSettings } from '@/hooks/useLocations';
import StaticImageMap from './StaticImageMap';
import LocationDetails from './LocationDetails';
import { Location } from '@/types/database';

const InteractiveLeafletSection = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const { data: mapSettings, isLoading: settingsLoading } = useMapSettings();

  if (locationsLoading || settingsLoading) {
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
            Click on any location marker to learn more about its unique attractions and experiences.
          </p>
          {locations.length === 0 && (
            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
              <p className="text-yellow-800">
                No locations are currently available. Please check back later or contact the administrator.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Map Container - Takes 2 columns */}
          <div className="lg:col-span-2 order-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 h-[600px]">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Interactive Tourism Map</h3>
                <p className="text-sm text-gray-600">
                  Click on the markers to explore different locations. Use mouse wheel to zoom and drag to pan.
                </p>
              </div>
              <div className="h-[500px]">
                <StaticImageMap
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                  mapSettings={mapSettings || undefined}
                />
              </div>
            </div>
          </div>

          {/* Details Container - Takes 1 column */}
          <div className="lg:col-span-1 order-2">
            <LocationDetails location={selectedLocation} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveLeafletSection;
