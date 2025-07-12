import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Package, generatePackageCode } from '@/hooks/usePackages';

interface PackageFormProps {
  package?: Package;
  existingCodes: string[];
  onSubmit: (packageData: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PackageForm = ({ package: editPackage, existingCodes, onSubmit, onCancel, isLoading }: PackageFormProps) => {
  const [formData, setFormData] = useState({
    package_code: '',
    title: '',
    location: '',
    duration: '',
    group_size: '',
    price: '',
    rating: 0,
    reviews_count: 0,
    image_url: '',
    features: [] as string[],
    locations_included: [] as string[],
    reviews: [] as string[],
    is_active: true,
  });

  const [newFeature, setNewFeature] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newReview, setNewReview] = useState('');

  useEffect(() => {
    if (editPackage) {
      setFormData({
        package_code: editPackage.package_code,
        title: editPackage.title,
        location: editPackage.location,
        duration: editPackage.duration,
        group_size: editPackage.group_size,
        price: editPackage.price,
        rating: editPackage.rating,
        reviews_count: editPackage.reviews_count,
        image_url: editPackage.image_url,
        features: editPackage.features,
        locations_included: editPackage.locations_included,
        reviews: editPackage.reviews,
        is_active: editPackage.is_active,
      });
    } else {
      setFormData(prev => ({
        ...prev,
        package_code: generatePackageCode(existingCodes),
      }));
    }
  }, [editPackage, existingCodes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addArrayItem = (field: 'features' | 'locations_included' | 'reviews', value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const removeArrayItem = (field: 'features' | 'locations_included' | 'reviews', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{editPackage ? 'Edit Package' : 'Add New Package'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="package_code">Package Code</Label>
              <Input
                id="package_code"
                value={formData.package_code}
                onChange={(e) => setFormData(prev => ({ ...prev, package_code: e.target.value }))}
                placeholder="12A"
                required
                disabled={!!editPackage}
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Package Title"
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Location, State"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="5 Days, 4 Nights"
                required
              />
            </div>
            <div>
              <Label htmlFor="group_size">Group Size</Label>
              <Input
                id="group_size"
                value={formData.group_size}
                onChange={(e) => setFormData(prev => ({ ...prev, group_size: e.target.value }))}
                placeholder="2-8 People"
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="₹25,000"
                required
              />
            </div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                placeholder="4.8"
                required
              />
            </div>
            <div>
              <Label htmlFor="reviews_count">Reviews Count</Label>
              <Input
                id="reviews_count"
                type="number"
                min="0"
                value={formData.reviews_count}
                onChange={(e) => setFormData(prev => ({ ...prev, reviews_count: parseInt(e.target.value) || 0 }))}
                placeholder="124"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://..."
              required
            />
          </div>

          {/* Features */}
          <div>
            <Label>Features</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add feature"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('features', newFeature, setNewFeature))}
              />
              <Button 
                type="button" 
                onClick={() => addArrayItem('features', newFeature, setNewFeature)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeArrayItem('features', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Locations Included */}
          <div>
            <Label>Locations Included</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add location"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('locations_included', newLocation, setNewLocation))}
              />
              <Button 
                type="button" 
                onClick={() => addArrayItem('locations_included', newLocation, setNewLocation)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.locations_included.map((location, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {location}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeArrayItem('locations_included', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <Label>Reviews</Label>
            <div className="flex gap-2 mb-2">
              <Textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Add review"
                rows={2}
              />
              <Button 
                type="button" 
                onClick={() => addArrayItem('reviews', newReview, setNewReview)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.reviews.map((review, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                  <span className="text-sm flex-1">{review}</span>
                  <X 
                    className="h-4 w-4 cursor-pointer mt-1" 
                    onClick={() => removeArrayItem('reviews', index)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : editPackage ? 'Update Package' : 'Create Package'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PackageForm;