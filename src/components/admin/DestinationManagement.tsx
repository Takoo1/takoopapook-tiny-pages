import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAllLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/hooks/useLocations';
import { useAllPackages, useUpdatePackage } from '@/hooks/usePackages';
import { useToast } from '@/hooks/use-toast';
import { Location } from '@/types/database';
import LocationForm, { LocationFormData } from './LocationForm';
import LocationsList from './LocationsList';
import { Plus } from 'lucide-react';

const DestinationManagement = () => {
  const { data: locations = [], isLoading: locationsLoading } = useAllLocations();
  const { data: packages = [] } = useAllPackages();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  const updatePackage = useUpdatePackage();
  const { toast } = useToast();

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmitLocation = async (data: LocationFormData) => {
    try {
      if (isEditing && selectedLocation) {
        await updateLocation.mutateAsync({
          id: selectedLocation.id,
          ...data
        });
        
        // Sync packages if location name changed
        if (selectedLocation.name !== data.name) {
          await syncPackageLocations(selectedLocation.name, data.name);
        }
        
        toast({
          title: "Success",
          description: "Location updated successfully",
        });
      } else {
        await createLocation.mutateAsync(data);
        toast({
          title: "Success",
          description: "Location created successfully",
        });
      }
      
      setShowForm(false);
      setIsEditing(false);
      setIsCreating(false);
      setSelectedLocation(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save location",
        variant: "destructive",
      });
      console.error('Error saving location:', error);
    }
  };

  const syncPackageLocations = async (oldName: string, newName: string) => {
    const packagesToUpdate = packages.filter(pkg => 
      pkg.locations_included.includes(oldName)
    );

    for (const pkg of packagesToUpdate) {
      const updatedLocations = pkg.locations_included.map(loc => 
        loc === oldName ? newName : loc
      );
      
      await updatePackage.mutateAsync({
        id: pkg.id,
        locations_included: updatedLocations
      });
    }
  };

  const editLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsEditing(true);
    setShowForm(true);
    setIsCreating(false);
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      const location = locations.find(loc => loc.id === id);
      if (location) {
        // Remove from packages
        const packagesToUpdate = packages.filter(pkg => 
          pkg.locations_included.includes(location.name)
        );

        for (const pkg of packagesToUpdate) {
          const updatedLocations = pkg.locations_included.filter(loc => 
            loc !== location.name
          );
          
          await updatePackage.mutateAsync({
            id: pkg.id,
            locations_included: updatedLocations
          });
        }
      }

      await deleteLocation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
      console.error('Error deleting location:', error);
    }
  };

  const toggleLocationActive = async (id: string, isActive: boolean) => {
    try {
      await updateLocation.mutateAsync({
        id,
        is_active: isActive
      });
      
      toast({
        title: "Success",
        description: `Location ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location status",
        variant: "destructive",
      });
      console.error('Error updating location status:', error);
    }
  };

  const addNewLocation = () => {
    setSelectedLocation(null);
    setIsEditing(false);
    setIsCreating(true);
    setShowForm(true);
  };

  if (locationsLoading) {
    return (
      <div className="p-6">
        <div className="text-lg">Loading destinations...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Destination Management</h1>
          <p className="text-muted-foreground">
            Add and manage tourist destinations with their details, images, and information
          </p>
        </div>
        <Button onClick={addNewLocation} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Destination
        </Button>
      </div>

      {showForm ? (
        <LocationForm
          location={selectedLocation}
          isEditing={isEditing}
          isCreating={isCreating}
          coordinates={{ x: 0, y: 0 }}
          onSubmit={handleSubmitLocation}
          onCancel={() => {
            setShowForm(false);
            setIsEditing(false);
            setIsCreating(false);
            setSelectedLocation(null);
          }}
        />
      ) : (
        <LocationsList
          locations={locations}
          onEditLocation={editLocation}
          onDeleteLocation={handleDeleteLocation}
          onToggleActive={toggleLocationActive}
          selectedLocationId={selectedLocation?.id}
        />
      )}

      {!showForm && locations.length === 0 && (
        <Card className="p-12">
          <CardContent className="text-center">
            <div className="text-muted-foreground">
              <Plus className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No destinations yet</h3>
              <p className="mb-4">Add your first tourist destination to get started.</p>
              <Button onClick={addNewLocation}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Destination
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DestinationManagement;