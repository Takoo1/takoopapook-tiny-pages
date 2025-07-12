
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Location } from '@/types/database';
import { Plus, Save, X, Image, List, MapPin, Star } from 'lucide-react';
import FileUploadInput from '@/components/FileUploadInput';
import { usePackages } from '@/hooks/usePackages';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationFormProps {
  location?: Location | null;
  isEditing: boolean;
  isCreating: boolean;
  coordinates: { x: number; y: number };
  onSubmit: (data: LocationFormData) => void;
  onCancel: () => void;
}

export interface LocationFormData {
  name: string;
  coordinates_x: number;
  coordinates_y: number;
  description: string;
  bullet_points: string[];
  images: string[];
  rating: number;
  reviews_count: number;
  reviews: string[];
  packages_included: string[];
  is_active: boolean;
}

const LocationForm = ({ location, isEditing, isCreating, coordinates, onSubmit, onCancel }: LocationFormProps) => {
  const { data: packages = [] } = usePackages();
  const [formData, setFormData] = useState<LocationFormData>(() => ({
    name: location?.name || '',
    coordinates_x: location?.coordinates_x || coordinates.x,
    coordinates_y: location?.coordinates_y || coordinates.y,
    description: location?.description || '',
    bullet_points: location?.bullet_points?.length ? location.bullet_points : [''],
    images: location?.images?.length ? location.images : [''],
    rating: location?.rating || 0,
    reviews_count: location?.reviews_count || 0,
    reviews: location?.reviews?.length ? location.reviews : [''],
    packages_included: location?.packages_included || [],
    is_active: location?.is_active ?? true,
  }));

  // Update coordinates when they change
  useEffect(() => {
    if (coordinates.x > 0 || coordinates.y > 0) {
      setFormData(prev => ({
        ...prev,
        coordinates_x: coordinates.x,
        coordinates_y: coordinates.y
      }));
    }
  }, [coordinates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReviews = formData.reviews.filter(review => review.trim() !== '');
    onSubmit({
      ...formData,
      bullet_points: formData.bullet_points.filter(point => point.trim() !== ''),
      images: formData.images.filter(img => img.trim() !== ''),
      reviews: cleanReviews,
      reviews_count: cleanReviews.length,
    });
  };

  const addBulletPoint = () => {
    setFormData(prev => ({
      ...prev,
      bullet_points: [...prev.bullet_points, ''],
    }));
  };

  const removeBulletPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bullet_points: prev.bullet_points.filter((_, i) => i !== index),
    }));
  };


  if (!isEditing && !isCreating) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500 space-y-4">
            <MapPin className="h-16 w-16 mx-auto text-gray-300" />
            <div>
              <p className="text-lg font-medium mb-2">Ready to Add Locations</p>
              <p className="text-sm">Click "Add Location" to start placing markers on the map.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasValidCoordinates = formData.coordinates_x > 0 && formData.coordinates_y > 0;

  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span>
            {isEditing ? `Edit: ${location?.name}` : 'New Location Details'}
          </span>
        </CardTitle>
        {hasValidCoordinates && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            📍 Marker placed at: ({formData.coordinates_x}, {formData.coordinates_y})
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!hasValidCoordinates && isCreating && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Step 1:</strong> Click "Add Location" button, then click on the map to place a marker.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Location Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter location name (e.g., Tawang Monastery)"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="x">X Coordinate</Label>
              <Input
                id="x"
                type="number"
                min="0"
                max="2000"
                value={formData.coordinates_x}
                onChange={(e) => setFormData(prev => ({ ...prev, coordinates_x: parseFloat(e.target.value) || 0 }))}
                required
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="y">Y Coordinate</Label>
              <Input
                id="y"
                type="number"
                min="0"
                max="1200"
                value={formData.coordinates_y}
                onChange={(e) => setFormData(prev => ({ ...prev, coordinates_y: parseFloat(e.target.value) || 0 }))}
                required
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this beautiful location, its significance, and what visitors can experience here..."
              rows={4}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Key Highlights</Label>
              <Button type="button" onClick={addBulletPoint} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Point
              </Button>
            </div>
            <div className="space-y-2">
              {formData.bullet_points.map((point, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={point}
                    onChange={(e) => {
                      const newPoints = [...formData.bullet_points];
                      newPoints[index] = e.target.value;
                      setFormData(prev => ({ ...prev, bullet_points: newPoints }));
                    }}
                    placeholder={`Highlight ${index + 1} (e.g., Ancient Buddhist monastery)`}
                  />
                  {formData.bullet_points.length > 1 && (
                    <Button 
                      type="button" 
                      onClick={() => removeBulletPoint(index)} 
                      variant="outline" 
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <FileUploadInput
              label="Images & Videos"
              value={formData.images}
              onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
              accept="image/*,video/*"
              maxFiles={10}
            />
          </div>

          <div>
            <Label htmlFor="rating">Rating (0-5 stars)</Label>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                placeholder="4.5"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Customer Reviews</Label>
              <Button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, reviews: [...prev.reviews, ''] }))} 
                variant="outline" 
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Review
              </Button>
            </div>
            <div className="space-y-2">
              {formData.reviews.map((review, index) => (
                <div key={index} className="flex space-x-2">
                  <Textarea
                    value={review}
                    onChange={(e) => {
                      const newReviews = [...formData.reviews];
                      newReviews[index] = e.target.value;
                      setFormData(prev => ({ ...prev, reviews: newReviews }));
                    }}
                    placeholder={`Customer review ${index + 1}...`}
                    rows={2}
                  />
                  {formData.reviews.length > 1 && (
                    <Button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        reviews: prev.reviews.filter((_, i) => i !== index) 
                      }))} 
                      variant="outline" 
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Packages Included</Label>
            <div className="space-y-2">
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`package-${pkg.id}`}
                      checked={formData.packages_included.includes(pkg.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            packages_included: [...prev.packages_included, pkg.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            packages_included: prev.packages_included.filter(id => id !== pkg.id)
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`package-${pkg.id}`} className="text-sm">
                      {pkg.package_code} - {pkg.title}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No packages available. Create packages first.</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive">Make this location visible to users</Label>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              disabled={!hasValidCoordinates || !formData.name.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Location' : 'Add This Location'}
            </Button>
            <Button type="button" onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LocationForm;
