import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Star,
  Users,
  Calendar
} from 'lucide-react';
import { Location } from '@/types/database';

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
  const activeLocations = locations.filter(loc => loc.is_active).length;

  if (locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Destinations (0)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="text-muted-foreground">
            <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No destinations found. Add your first destination to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Destinations ({locations.length})
          </div>
          <Badge variant="outline">
            {activeLocations} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {locations.map((location) => (
            <Card 
              key={location.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                selectedLocationId === location.id ? 'ring-2 ring-primary' : ''
              } ${!location.is_active ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{location.name}</h3>
                      {!location.is_active && (
                        <Badge variant="secondary">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                      {location.categories && location.categories.length > 0 && (
                        <div className="flex gap-1">
                          {location.categories.map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Coordinates:</span>
                        <div className="font-medium">
                          ({location.coordinates_x}, {location.coordinates_y})
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{location.rating}</span>
                        <span className="text-muted-foreground">
                          ({location.reviews_count} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(location.created_at || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {location.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {location.description}
                      </p>
                    )}

                    {location.bullet_points && location.bullet_points.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-1">Key Highlights:</div>
                        <div className="text-sm text-muted-foreground">
                          {location.bullet_points.slice(0, 3).join(' • ')}
                          {location.bullet_points.length > 3 && ' • ...'}
                        </div>
                      </div>
                    )}

                    {location.packages_included && location.packages_included.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-1">Included in Packages:</div>
                        <div className="text-sm text-muted-foreground">
                          {location.packages_included.length} package(s)
                        </div>
                      </div>
                    )}

                    {location.images && location.images.length > 0 && (
                      <div className="flex gap-2">
                        {location.images.slice(0, 4).map((image, index) => (
                          <div key={index} className="w-16 h-16 rounded-lg overflow-hidden">
                            <img
                              src={image}
                              alt={`${location.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        ))}
                        {location.images.length > 4 && (
                          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-muted-foreground">
                            +{location.images.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditLocation(location)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleActive(location.id, !location.is_active)}
                      className={location.is_active ? 'text-orange-600' : 'text-green-600'}
                    >
                      {location.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteLocation(location.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationsList;