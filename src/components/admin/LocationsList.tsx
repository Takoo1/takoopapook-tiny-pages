
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Location } from '@/types/database';
import { Edit, Trash2, MapPin, Eye, EyeOff } from 'lucide-react';

interface LocationsListProps {
  locations: Location[];
  onEditLocation: (location: Location) => void;
  onDeleteLocation: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  selectedLocationId?: string;
}

const LocationsList = ({ 
  locations, 
  onEditLocation, 
  onDeleteLocation, 
  onToggleActive,
  selectedLocationId 
}: LocationsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Locations ({locations.length})</span>
          <div className="text-sm text-gray-500">
            Active: {locations.filter(l => l.is_active).length}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {locations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No locations added yet</p>
              <p className="text-sm">Click "Add Location" to create your first location</p>
            </div>
          ) : (
            locations.map((location) => (
              <div
                key={location.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                  selectedLocationId === location.id 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg flex items-center space-x-2">
                      <span>{location.name}</span>
                      {!location.is_active && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Position: ({location.coordinates_x}px, {location.coordinates_y}px)
                    </p>
                    {location.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {location.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      {location.bullet_points && location.bullet_points.length > 0 && (
                        <span>{location.bullet_points.length} key points</span>
                      )}
                      {location.images && location.images.length > 0 && (
                        <span>{location.images.length} images</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <Button
                    onClick={() => onEditLocation(location)}
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => onToggleActive(location.id, !location.is_active)}
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
                      onClick={() => onDeleteLocation(location.id)}
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
  );
};

export default LocationsList;
