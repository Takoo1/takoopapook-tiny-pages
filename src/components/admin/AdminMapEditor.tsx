

import { useState } from 'react';
import { useAllLocations, useCreateLocation, useUpdateLocation, useDeleteLocation, useMapSettings, useUpdateMapSettings } from '@/hooks/useLocations';
import { Location } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Plus, Settings, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StaticImageMap from '../StaticImageMap';
import LocationForm, { LocationFormData } from './LocationForm';
import LocationsList from './LocationsList';
import ViewportSelector from './ViewportSelector';
import { validateCoordinates } from '@/utils/coordinateValidation';

type AdminMode = 'map' | 'viewport' | 'locations';

const AdminMapEditor = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [clickCoordinates, setClickCoordinates] = useState({ x: 0, y: 0 });
  const [adminMode, setAdminMode] = useState<AdminMode>('map');
  const [viewport, setViewport] = useState({ x: 400, y: 200, width: 800, height: 480 });

  const { data: locations = [] } = useAllLocations();
  const { data: mapSettings } = useMapSettings();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  const updateMapSettings = useUpdateMapSettings();
  const { toast } = useToast();

  const handleAddLocationClick = () => {
    setIsAddingLocation(true);
    setSelectedLocation(null);
    toast({
      title: 'Click on the map',
      description: 'Click anywhere on the map to place a marker for the new location.',
    });
  };

  const handleMapClick = (x: number, y: number) => {
    if (!isAddingLocation) return;
    
    console.log('Map clicked with coordinates:', { x, y });
    
    const validation = validateCoordinates(x, y);
    if (!validation.isValid) {
      toast({
        title: 'Invalid coordinates',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }
    
    // Ensure coordinates are integers and within bounds
    const safeX = Math.max(0, Math.min(2000, Math.round(x)));
    const safeY = Math.max(0, Math.min(1200, Math.round(y)));
    
    console.log('Setting safe coordinates:', { safeX, safeY });
    
    setClickCoordinates({ x: safeX, y: safeY });
    setIsAddingLocation(false);
    toast({
      title: 'Marker placed!',
      description: `Location marker set at coordinates (${safeX}, ${safeY}). Fill in the details below.`,
    });
  };

  const handleSubmitLocation = async (formData: LocationFormData) => {
    // Ensure coordinates are safe integers within bounds
    const safeCoordinates = {
      coordinates_x: Math.max(0, Math.min(2000, Math.round(formData.coordinates_x))),
      coordinates_y: Math.max(0, Math.min(1200, Math.round(formData.coordinates_y)))
    };
    
    console.log('Submitting location with safe coordinates:', safeCoordinates);
    
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
        is_active: formData.is_active,
        ...safeCoordinates
      };
      
      if (selectedLocation) {
        await updateLocation.mutateAsync({ id: selectedLocation.id, ...locationData });
        toast({ title: 'Location updated successfully!' });
      } else {
        await createLocation.mutateAsync(locationData);
        toast({ title: 'Location created successfully!' });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving location:', error);
      toast({ 
        title: 'Error saving location', 
        description: 'Please check coordinates and try again.',
        variant: 'destructive' 
      });
    }
  };

  const resetForm = () => {
    setSelectedLocation(null);
    setIsAddingLocation(false);
    setClickCoordinates({ x: 0, y: 0 });
  };

  const editLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsAddingLocation(false);
    setClickCoordinates({ x: location.coordinates_x, y: location.coordinates_y });
  };

  const handleDeleteLocation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation.mutateAsync(id);
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
      await updateLocation.mutateAsync({ 
        id, 
        is_active: isActive 
      });
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

  const handleSaveViewport = async () => {
    try {
      // Ensure all values are safe integers for the database
      const safeViewport = {
        x: Math.max(0, Math.min(2000, Math.round(viewport.x))),
        y: Math.max(0, Math.min(1200, Math.round(viewport.y))),
        width: Math.max(100, Math.min(2000, Math.round(viewport.width))),
        height: Math.max(100, Math.min(1200, Math.round(viewport.height)))
      };
      
      // Calculate center point of the viewport
      const centerX = Math.round(safeViewport.x + safeViewport.width / 2);
      const centerY = Math.round(safeViewport.y + safeViewport.height / 2);
      
      // Calculate initial zoom based on viewport size
      // The zoom should fit the viewport area to a standard container size (800x600)
      const standardWidth = 800;
      const standardHeight = 600;
      const zoomX = standardWidth / safeViewport.width;
      const zoomY = standardHeight / safeViewport.height;
      const initialZoom = Math.min(zoomX, zoomY);
      
      const settings = {
        center_x: centerX,
        center_y: centerY,
        initial_zoom: Math.round(initialZoom * 1000) / 1000, // Round to 3 decimal places
        min_zoom: mapSettings?.min_zoom || 0.3,
        max_zoom: mapSettings?.max_zoom || 4
      };
      
      console.log('Saving viewport settings:', {
        viewport: safeViewport,
        center: { x: centerX, y: centerY },
        zoom: initialZoom,
        settings
      });
      
      await updateMapSettings.mutateAsync(settings);
      toast({ 
        title: 'Viewport settings saved!',
        description: `Users will see this area centered at (${centerX}, ${centerY}) with ${Math.round(initialZoom * 100)}% zoom by default.`
      });
    } catch (error) {
      console.error('Error saving viewport:', error);
      toast({ 
        title: 'Error saving viewport',
        description: 'Please try again later.',
        variant: 'destructive' 
      });
    }
  };

  const isFormVisible = selectedLocation || clickCoordinates.x > 0 || clickCoordinates.y > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Tourism Map Admin Panel
          </h1>
          <p className="text-xl text-gray-600">
            Manage locations and map settings for the Arunachal Pradesh tourism map
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-2 shadow-lg flex space-x-2">
            <Button
              onClick={() => setAdminMode('map')}
              variant={adminMode === 'map' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>Manage Locations</span>
            </Button>
            <Button
              onClick={() => setAdminMode('viewport')}
              variant={adminMode === 'viewport' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Set Default View</span>
            </Button>
            <Button
              onClick={() => setAdminMode('locations')}
              variant={adminMode === 'locations' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>All Locations</span>
            </Button>
          </div>
        </div>

        {/* Map Management Mode */}
        {adminMode === 'map' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="xl:col-span-2">
              <Card className="h-[700px]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span>Map Editor</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleAddLocationClick}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                        disabled={isAddingLocation}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {isAddingLocation ? 'Click on Map' : 'Add Location'}
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
                <CardContent className="h-[600px] p-4">
                  <StaticImageMap
                    locations={locations}
                    selectedLocation={selectedLocation}
                    onLocationSelect={editLocation}
                    isAdminMode={true}
                    isAddingLocation={isAddingLocation}
                    onMapClick={handleMapClick}
                    mapSettings={mapSettings || undefined}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Location Form */}
            <div className="xl:col-span-1">
              <LocationForm
                location={selectedLocation}
                isEditing={!!selectedLocation}
                isCreating={isFormVisible && !selectedLocation}
                coordinates={clickCoordinates}
                onSubmit={handleSubmitLocation}
                onCancel={resetForm}
              />
            </div>
          </div>
        )}

        {/* Viewport Selection Mode */}
        {adminMode === 'viewport' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <Card className="h-[700px]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-green-600" />
                      <span>Set Default User View</span>
                    </div>
                    <Button
                      onClick={handleSaveViewport}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Save Viewport
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[600px] p-4">
                  <StaticImageMap
                    locations={locations}
                    selectedLocation={null}
                    onLocationSelect={() => {}}
                    isAdminMode={true}
                    isViewportMode={true}
                    viewport={viewport}
                    onViewportChange={setViewport}
                    mapSettings={mapSettings || undefined}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-1">
              <ViewportSelector
                viewport={viewport}
                onViewportChange={setViewport}
                onSave={handleSaveViewport}
              />
            </div>
          </div>
        )}

        {/* Locations List Mode */}
        {adminMode === 'locations' && (
          <div className="grid grid-cols-1">
            <LocationsList
              locations={locations}
              onEditLocation={(location) => {
                setAdminMode('map');
                editLocation(location);
              }}
              onDeleteLocation={handleDeleteLocation}
              onToggleActive={toggleLocationActive}
              selectedLocationId={selectedLocation?.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMapEditor;

