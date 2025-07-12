import { useState } from 'react';
import { useAllLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/hooks/useLocations';
import { Location } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StaticImageMap from '../StaticImageMap';
import LocationForm, { LocationFormData } from './LocationForm';
import { validateCoordinates } from '@/utils/coordinateValidation';

const DestinationManagement = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [clickCoordinates, setClickCoordinates] = useState({ x: 0, y: 0 });
  const [showForm, setShowForm] = useState(false);

  const { data: locations = [] } = useAllLocations();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  const { toast } = useToast();

  const handleAddLocationClick = () => {
    setIsAddingLocation(true);
    setSelectedLocation(null);
    setShowForm(false);
    toast({
      title: 'Click on the map',
      description: 'Click anywhere on the map to place a marker for the new destination.',
    });
  };

  const handleMapClick = (x: number, y: number) => {
    if (!isAddingLocation) return;
    
    const validation = validateCoordinates(x, y);
    if (!validation.isValid) {
      toast({
        title: 'Invalid coordinates',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }
    
    const safeX = Math.max(0, Math.min(2000, Math.round(x)));
    const safeY = Math.max(0, Math.min(1200, Math.round(y)));
    
    setClickCoordinates({ x: safeX, y: safeY });
    setIsAddingLocation(false);
    setShowForm(true);
    toast({
      title: 'Location placed!',
      description: `New destination marker set at coordinates (${safeX}, ${safeY}).`,
    });
  };

  const handleSubmitLocation = async (formData: LocationFormData) => {
    const safeCoordinates = {
      coordinates_x: Math.max(0, Math.min(2000, Math.round(formData.coordinates_x))),
      coordinates_y: Math.max(0, Math.min(1200, Math.round(formData.coordinates_y)))
    };
    
    const validation = validateCoordinates(safeCoordinates.coordinates_x, safeCoordinates.coordinates_y);
    if (!validation.isValid) {
      toast({
        title: 'Invalid coordinates',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const locationData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        bullet_points: formData.bullet_points.filter(point => point.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== ''),
        rating: formData.rating || 0,
        reviews_count: formData.reviews.filter(r => r.trim() !== '').length,
        reviews: formData.reviews.filter(r => r.trim() !== ''),
        packages_included: formData.packages_included || [],
        categories: formData.categories || [],
        is_active: formData.is_active,
        ...safeCoordinates
      };
      
      if (selectedLocation) {
        await updateLocation.mutateAsync({ id: selectedLocation.id, ...locationData });
        toast({ title: 'Destination updated successfully!' });
      } else {
        await createLocation.mutateAsync(locationData);
        toast({ title: 'Destination created successfully!' });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving destination:', error);
      toast({ 
        title: 'Error saving destination', 
        description: 'Please check all fields and try again.',
        variant: 'destructive' 
      });
    }
  };

  const resetForm = () => {
    setSelectedLocation(null);
    setIsAddingLocation(false);
    setShowForm(false);
    setClickCoordinates({ x: 0, y: 0 });
  };

  const editLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsAddingLocation(false);
    setShowForm(true);
    setClickCoordinates({ x: location.coordinates_x, y: location.coordinates_y });
  };

  const handleDeleteLocation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        await deleteLocation.mutateAsync(id);
        toast({ title: 'Destination deleted successfully!' });
        if (selectedLocation?.id === id) {
          resetForm();
        }
      } catch (error) {
        toast({ 
          title: 'Error deleting destination',
          description: 'Please try again later.',
          variant: 'destructive' 
        });
      }
    }
  };

  const toggleLocationActive = async (id: string, isActive: boolean) => {
    try {
      await updateLocation.mutateAsync({ 
        id, 
        is_active: isActive 
      });
      toast({ 
        title: `Destination ${isActive ? 'activated' : 'deactivated'}`,
        description: `The destination is now ${isActive ? 'visible' : 'hidden'} to users.`
      });
    } catch (error) {
      toast({ 
        title: 'Error updating destination',
        description: 'Please try again later.',
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Destination Management
        </h2>
        <p className="text-gray-600">
          Add and manage tourism destinations that will appear on the explore map
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="xl:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>Destination Map</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAddLocationClick}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                    disabled={isAddingLocation}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isAddingLocation ? 'Click on Map' : 'Add Destination'}
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[500px] p-4">
              <StaticImageMap
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationSelect={editLocation}
                isAdminMode={true}
                isAddingLocation={isAddingLocation}
                onMapClick={handleMapClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Form/List Section */}
        <div className="xl:col-span-1">
          {showForm ? (
            <LocationForm
              location={selectedLocation}
              isEditing={!!selectedLocation}
              isCreating={!selectedLocation}
              coordinates={clickCoordinates}
              onSubmit={handleSubmitLocation}
              onCancel={resetForm}
            />
          ) : (
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>All Destinations ({locations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {locations.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No destinations added yet</p>
                      <p className="text-sm">Click "Add Destination" to create your first location</p>
                    </div>
                  ) : (
                    locations.map((location) => (
                      <div
                        key={location.id}
                        className="border rounded-lg p-3 transition-all hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold flex items-center space-x-2">
                              <span>{location.name}</span>
                              {!location.is_active && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  Hidden
                                </span>
                              )}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                              <span>⭐ {location.rating || 0}</span>
                              <span>•</span>
                              <span>{location.reviews_count || 0} reviews</span>
                              {location.packages_included && location.packages_included.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{location.packages_included.length} packages</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <Button
                            onClick={() => editLocation(location)}
                            size="sm"
                            variant="outline"
                            className="flex items-center space-x-1"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </Button>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => toggleLocationActive(location.id, !location.is_active)}
                              size="sm"
                              variant="outline"
                              className={`flex items-center space-x-1 ${
                                location.is_active 
                                  ? 'text-orange-600 hover:text-orange-700' 
                                  : 'text-green-600 hover:text-green-700'
                              }`}
                            >
                              {location.is_active ? (
                                <>
                                  <EyeOff className="h-3 w-3" />
                                  <span>Hide</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3" />
                                  <span>Show</span>
                                </>
                              )}
                            </Button>
                            
                            <Button
                              onClick={() => handleDeleteLocation(location.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationManagement;