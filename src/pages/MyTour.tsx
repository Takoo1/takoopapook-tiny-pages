
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePlannedLocations, useRemoveFromPlanned } from '@/hooks/usePlannedLocations';
import { MapPin, Calendar, Trash2, Plus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MyTour = () => {
  const { data: plannedLocations = [], isLoading } = usePlannedLocations();
  const removeFromPlanned = useRemoveFromPlanned();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const handleRemoveLocation = (locationId: string) => {
    removeFromPlanned.mutate(locationId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your tour plans...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              My Tour <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Planner</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Manage your planned destinations and create your perfect Arunachal Pradesh adventure
            </p>
          </div>

          {plannedLocations.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <Card className="text-center p-12">
                <CardContent>
                  <MapPin className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No Destinations Planned Yet</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                    Start building your dream trip by exploring locations on our interactive map and adding them to your tour plan.
                  </p>
                  <a 
                    href="/" 
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Explore Destinations</span>
                  </a>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-emerald-500" />
                      <span>Planned Destinations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-800">{plannedLocations.length}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-emerald-500" />
                      <span>Trip Duration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-800">{Math.max(plannedLocations.length, 1)}</p>
                    <p className="text-sm text-gray-600">Days recommended</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-emerald-500" />
                      <span>Last Updated</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold text-gray-800">
                      {new Date(plannedLocations[0]?.planned_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Planned Locations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plannedLocations.map((planned, index) => (
                  <Card key={planned.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative">
                      {/* Location Image */}
                      <div className="h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={planned.locations.images?.[0] || 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80'}
                          alt={planned.locations.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      
                      {/* Day number badge */}
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Day {index + 1}
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveLocation(planned.location_id)}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove from tour"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                        {planned.locations.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {planned.locations.description || 'Discover the beauty and culture of this amazing destination.'}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Added {new Date(planned.planned_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                      
                      {planned.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 italic">"{planned.notes}"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Add More Button */}
              <div className="text-center mt-12">
                <a 
                  href="/" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add More Destinations</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyTour;
