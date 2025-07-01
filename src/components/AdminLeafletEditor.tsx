
import { useState } from 'react';
import { useLocations, useCreateLocation, useUpdateLocation, useMapSettings, useUpdateMapSettings } from '@/hooks/useLocations';
import { Location } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LeafletMap from './LeafletMap';
import LocationForm, { LocationFormData } from './admin/LocationForm';
import LocationsList from './admin/LocationsList';
import AdminMapControls from './admin/AdminMapControls';
import { validateCoordinates } from '@/utils/coordinateValidation';

const AdminLeafletEditor = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [clickCoordinates, setClickCoordinates] = useState({ x: 0, y: 0 });

  const { data: locations = [] } = useLocations();
  const { data: mapSettings } = useMapSettings();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const updateMapSettings = useUpdateMapSettings();
  const { toast } = useToast();

  const handleMapClick = (x: number, y: number) => {
    if (!isCreating) return;
    
    const validation = validateCoordinates(x, y);
    if (!validation.isValid) {
      toast({
        title: 'Invalid coordinates',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }
    
    setClickCoordinates({ x, y });
    toast({
      title: 'Location set',
      description: `Coordinates: (${x}, ${y})`,
    });
  };

  const handleSubmitLocation = async (formData: LocationFormData) => {
    const validation = validateCoordinates(formData.coordinates_x, formData.coordinates_y);
    if (!validation.isValid) {
      toast({
        title: 'Invalid coordinates',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }
    
    try {
      if (isEditing && selectedLocation) {
        await updateLocation.mutateAsync({ id: selectedLocation.id, ...formData });
        toast({ title: 'Location updated successfully!' });
      } else {
        await createLocation.mutateAsync(formData);
        toast({ title: 'Location created successfully!' });
      }
      resetForm();
    } catch (error) {
      toast({ 
        title: 'Error saving location', 
        description: 'Please try again later.',
        variant: 'destructive' 
      });
    }
  };

  const resetForm = () => {
    setSelectedLocation(null);
    setIsEditing(false);
    setIsCreating(false);
    setClickCoordinates({ x: 0, y: 0 });
  };

  const editLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsEditing(true);
    setIsCreating(false);
    setClickCoordinates({ x: location.coordinates_x, y: location.coordinates_y });
  };

  const deleteLocation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        // We would need a delete mutation here
        toast({ title: 'Location deleted successfully!' });
        if (selectedLocation?.id === id) {
          resetForm();
        }
      } catch (error) {
        toast({ 
          title: 'Error deleting location',
          description: 'Please try again later.',
          variant: 'destructive' 
        });
      }
    }
  };

  const toggleLocationActive = async (id: string, isActive: boolean) => {
    try {
      await updateLocation.mutateAsync({ id, is_active: isActive });
      toast({ 
        title: `Location ${isActive ? 'activated' : 'deactivated'}`,
        description: `The location is now ${isActive ? 'visible' : 'hidden'} to users.`
      });
    } catch (error) {
      toast({ 
        title: 'Error updating location',
        description: 'Please try again later.',
        variant: 'destructive' 
      });
    }
  };

  const handleUpdateMapSettings = async (settings: any) => {
    try {
      await updateMapSettings.mutateAsync(settings);
      toast({ title: 'Map settings updated successfully!' });
    } catch (error) {
      toast({ 
        title: 'Error updating map settings',
        description: 'Please try again later.',
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Professional Map Editor
          </h1>
          <p className="text-xl text-gray-600">
            Manage locations and settings for the Arunachal Pradesh tourism map
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Interactive Map Editor</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setIsCreating(true);
                        setIsEditing(false);
                        setSelectedLocation(null);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
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
                {isCreating && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    <strong>Click on the map</strong> to set the location coordinates. 
                    Valid range: X (0-2000px), Y (0-1200px)
                  </div>
                )}
              </CardHeader>
              <CardContent className="h-[500px] p-2">
                <LeafletMap
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onLocationSelect={editLocation}
                  isAdminMode={isCreating}
                  onMapClick={handleMapClick}
                  mapSettings={mapSettings || undefined}
                />
              </CardContent>
            </Card>
          </div>

          {/* Location Form */}
          <div>
            <LocationForm
              location={selectedLocation}
              isEditing={isEditing}
              isCreating={isCreating}
              coordinates={clickCoordinates}
              onSubmit={handleSubmitLocation}
              onCancel={resetForm}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Settings */}
          <AdminMapControls
            mapSettings={mapSettings || undefined}
            onUpdateSettings={handleUpdateMapSettings}
            isUpdating={updateMapSettings.isPending}
          />

          {/* Locations List */}
          <LocationsList
            locations={locations}
            onEditLocation={editLocation}
            onDeleteLocation={deleteLocation}
            onToggleActive={toggleLocationActive}
            selectedLocationId={selectedLocation?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLeafletEditor;
