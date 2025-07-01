import { useState, useEffect } from 'react';
import { useLocations, useCreateLocation, useUpdateLocation, useMapSettings } from '@/hooks/useLocations';
import { Location } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Save, Plus, Edit, Eye, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LeafletMap from './LeafletMap';

const AdminLeafletEditor = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    coordinates_x: 0,
    coordinates_y: 0,
    description: '',
    bullet_points: [''],
    images: [''],
    is_active: true,
  });

  const { data: locations = [] } = useLocations();
  const { data: mapSettings } = useMapSettings();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const { toast } = useToast();

  const handleMapClick = (x: number, y: number) => {
    if (!isCreating) return;
    
    // Validate coordinates are within bounds
    if (x < 0 || x > 2000 || y < 0 || y > 1200) {
      toast({
        title: 'Invalid coordinates',
        description: 'Coordinates must be within the map bounds (0-2000, 0-1200)',
        variant: 'destructive'
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      coordinates_x: x,
      coordinates_y: y,
    }));
    
    toast({
      title: 'Location set',
      description: `Coordinates: (${x}, ${y})`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate coordinates
    if (formData.coordinates_x < 0 || formData.coordinates_x > 2000 || 
        formData.coordinates_y < 0 || formData.coordinates_y > 1200) {
      toast({
        title: 'Invalid coordinates',
        description: 'Coordinates must be within the map bounds (X: 0-2000, Y: 0-1200)',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const locationData = {
        ...formData,
        bullet_points: formData.bullet_points.filter(point => point.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== ''),
      };

      if (isEditing && selectedLocation) {
        await updateLocation.mutateAsync({ id: selectedLocation.id, ...locationData });
        toast({ title: 'Location updated successfully!' });
      } else {
        await createLocation.mutateAsync(locationData);
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
    setFormData({
      name: '',
      coordinates_x: 0,
      coordinates_y: 0,
      description: '',
      bullet_points: [''],
      images: [''],
      is_active: true,
    });
    setIsEditing(false);
    setIsCreating(false);
    setSelectedLocation(null);
  };

  const editLocation = (location: Location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      coordinates_x: location.coordinates_x,
      coordinates_y: location.coordinates_y,
      description: location.description,
      bullet_points: location.bullet_points.length > 0 ? location.bullet_points : [''],
      images: location.images.length > 0 ? location.images : [''],
      is_active: location.is_active,
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const addBulletPoint = () => {
    setFormData(prev => ({
      ...prev,
      bullet_points: [...prev.bullet_points, ''],
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ''],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Leaflet Map Editor Admin Panel
          </h1>
          <p className="text-xl text-gray-600">
            Manage locations on the interactive Arunachal Pradesh map using pixel coordinates
          </p>
          {mapSettings && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg inline-block">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Settings className="h-4 w-4" />
                <span>Map Settings: Zoom {mapSettings.min_zoom} to {mapSettings.max_zoom} | Center: ({mapSettings.center_x}, {mapSettings.center_y})</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Interactive Map</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsCreating(true)}
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
              {isCreating && (
                <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  Click on the map to set location coordinates (Valid range: X: 0-2000, Y: 0-1200)
                </div>
              )}
            </CardHeader>
            <CardContent className="h-[480px] p-2">
              <LeafletMap
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationSelect={editLocation}
                isAdminMode={isCreating}
                onMapClick={handleMapClick}
                mapSettings={mapSettings}
              />
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card className="h-[600px] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {isEditing ? 'Edit Location' : isCreating ? 'Create New Location' : 'Select a Location'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(isEditing || isCreating) ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Location Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="x">X Coordinate (0-2000 px)</Label>
                      <Input
                        id="x"
                        type="number"
                        min="0"
                        max="2000"
                        value={formData.coordinates_x}
                        onChange={(e) => setFormData(prev => ({ ...prev, coordinates_x: parseFloat(e.target.value) }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="y">Y Coordinate (0-1200 px)</Label>
                      <Input
                        id="y"
                        type="number"
                        min="0"
                        max="1200"
                        value={formData.coordinates_y}
                        onChange={(e) => setFormData(prev => ({ ...prev, coordinates_y: parseFloat(e.target.value) }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Bullet Points</Label>
                    {formData.bullet_points.map((point, index) => (
                      <Input
                        key={index}
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...formData.bullet_points];
                          newPoints[index] = e.target.value;
                          setFormData(prev => ({ ...prev, bullet_points: newPoints }));
                        }}
                        placeholder={`Bullet point ${index + 1}`}
                        className="mt-2"
                      />
                    ))}
                    <Button type="button" onClick={addBulletPoint} variant="outline" size="sm" className="mt-2">
                      Add Bullet Point
                    </Button>
                  </div>

                  <div>
                    <Label>Images (URLs)</Label>
                    {formData.images.map((img, index) => (
                      <Input
                        key={index}
                        value={img}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[index] = e.target.value;
                          setFormData(prev => ({ ...prev, images: newImages }));
                        }}
                        placeholder={`Image URL ${index + 1}`}
                        className="mt-2"
                      />
                    ))}
                    <Button type="button" onClick={addImage} variant="outline" size="sm" className="mt-2">
                      Add Image
                    </Button>
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Update' : 'Create'} Location
                    </Button>
                    <Button type="button" onClick={resetForm} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Click on existing locations to edit them, or click "Add Location" to create new ones.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Valid coordinates: X (0-2000), Y (0-1200)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Existing Locations List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Existing Locations ({locations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => editLocation(location)}
                >
                  <h4 className="font-semibold text-lg">{location.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Position: ({location.coordinates_x}px, {location.coordinates_y}px)
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Status: {location.is_active ? 'Active' : 'Inactive'}
                  </p>
                  <Button size="sm" className="mt-2">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLeafletEditor;
