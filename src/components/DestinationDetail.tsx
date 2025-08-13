import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Package as PackageIcon, Eye, Heart, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocations } from '@/hooks/useLocations';
import { usePackages } from '@/hooks/usePackages';
import { useReviewStatistics } from '@/hooks/useReviewStatistics';
import PackageCard from './PackageCard';
import ReviewSection from './ReviewSection';
import type { Package } from '@/hooks/usePackages';
import PlanButton from '@/components/PlanButton';

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: locations = [] } = useLocations();
  const { data: packages = [] } = usePackages();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const destination = locations.find(loc => loc.id === id);
  
  // Fetch real review statistics
  const { data: reviewStats } = useReviewStatistics('destination', id || '');
  
  if (!destination) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Destination not found</h2>
          <Button onClick={() => navigate('/explore')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back To All Destinations
          </Button>
        </div>
      </div>
    );
  }

  // Filter packages that include this destination (check both name and ID)
  const destinationPackages = packages.filter(pkg => {
    const includesName = pkg.locations_included.includes(destination.name);
    const includesId = pkg.locations_included.includes(destination.id);
    return includesName || includesId;
  });

  // Debug log to help troubleshoot
  console.log('Destination:', destination.name, destination.id);
  console.log('All packages:', packages.length);
  console.log('Filtered packages:', destinationPackages.length);
  console.log('Package locations:', packages.map(p => ({ title: p.title, locations: p.locations_included })));

  const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop";
  const images = destination.images && destination.images.length > 0 ? destination.images : [defaultImage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-4">
        {/* Back Button */}
        <Button 
          onClick={() => navigate('/explore')} 
          variant="ghost" 
          className="mb-4 hover:bg-white/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back To All Destinations
        </Button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="relative">
              <div 
                className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
                onClick={() => setShowImageLightbox(true)}
              >
                <img
                  src={images[selectedImageIndex]}
                  alt={destination.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = defaultImage;
                  }}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-3">
                    <Eye className="h-6 w-6 text-gray-800" />
                  </div>
                </div>
              </div>
              
              {/* Image thumbnails */}
              {images.length > 1 && (
                <div 
                  className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide"
                  onClick={(e) => e.stopPropagation()} // Prevent parent lightbox trigger
                >
                  {images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedImageIndex(index);
                      }}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                        index === selectedImageIndex 
                          ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-200' 
                          : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${destination.name} view ${index + 1}`}
                        className={`w-full h-full object-cover transition-all duration-300 ${
                          index === selectedImageIndex ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                        }`}
                        onError={(e) => {
                          e.currentTarget.src = defaultImage;
                        }}
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {destination.name}
              </h1>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-700">
                      {reviewStats ? reviewStats.averageRating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-gray-500">
                      ({reviewStats ? reviewStats.totalReviews : 0} reviews)
                    </span>
                  </div>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>Arunachal Pradesh</span>
                  </Badge>
                </div>
                <PlanButton 
                  itemId={destination.id}
                  itemType="location"
                  itemName={destination.name}
                  labelMode="liked"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {destination.description || 'Discover the beauty and culture of this amazing destination in Arunachal Pradesh.'}
                  </p>
                </div>

                {destination.bullet_points && destination.bullet_points.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Key Highlights</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {destination.bullet_points.map((point, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700 leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Packages Available Section */}
        {destinationPackages.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Our All Available Packages For {destination.name}</h2>
                <p className="text-gray-600">Explore curated packages that include this destination</p>
              </div>
              <Badge variant="outline" className="flex items-center space-x-1">
                <PackageIcon className="h-3 w-3" />
                <span>{destinationPackages.length} packages</span>
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinationPackages.map((pkg) => (
                <Card key={pkg.id} className="h-full flex flex-col group hover:shadow-lg transition-all duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={pkg.image_url || '/placeholder.svg'}
                      alt={pkg.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">
                        {pkg.package_code}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="flex-1 p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{pkg.title}</h3>
                    
                    <div className="flex items-center text-muted-foreground text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{pkg.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <span>{pkg.group_size}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">{pkg.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          ({pkg.reviews_count} reviews)
                        </span>
                      </div>
                      <span className="font-bold text-lg text-primary">{pkg.price}</span>
                    </div>
                    
                    {pkg.features.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {pkg.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {pkg.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{pkg.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {pkg.locations_included.length > 0 && (
                      <div className="text-sm text-muted-foreground mb-4">
                        <span className="font-medium">Includes:</span> {pkg.locations_included.slice(0, 2).join(', ')}
                        {pkg.locations_included.length > 2 && ` +${pkg.locations_included.length - 2} more`}
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/booking/${pkg.id}`)}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Package Detail Modal */}
        {selectedPackage && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
            <div className="bg-white rounded-t-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Package Details</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPackage(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Package Image */}
                  <div>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden">
                      <img
                        src={selectedPackage.image_url}
                        alt={selectedPackage.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop";
                        }}
                      />
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{selectedPackage.package_code}</Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{selectedPackage.rating}</span>
                          <span className="text-gray-500">({selectedPackage.reviews_count})</span>
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold mb-2">{selectedPackage.title}</h4>
                      <p className="text-lg font-semibold text-emerald-600 mb-4">{selectedPackage.price}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">{selectedPackage.duration}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Group Size</p>
                        <p className="font-semibold">{selectedPackage.group_size}</p>
                      </div>
                    </div>

                    {selectedPackage.features.length > 0 && (
                      <div>
                        <h5 className="font-semibold mb-2">Package Features</h5>
                        <div className="space-y-1">
                          {selectedPackage.features.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPackage.locations_included.length > 0 && (
                      <div>
                        <h5 className="font-semibold mb-2">Included Destinations</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedPackage.locations_included.map((location, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setSelectedPackage(null);
                          navigate(`/booking/${selectedPackage.id}`);
                        }}
                      >
                        Book This Package
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Build My Package Button */}
        <div className="text-center mb-12">
          <Card className="max-w-2xl mx-auto p-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Create Your Custom Package</h3>
              <p className="text-gray-600 mb-6">
                Don't see what you're looking for? Build a personalized package tailored to your preferences.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3">
                <Plus className="mr-2 h-5 w-5" />
                Build My Package
              </Button>
            </div>
          </Card>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <ReviewSection itemType="destination" itemId={destination.id} />
        </div>

        {/* Image Lightbox */}
        {showImageLightbox && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageLightbox(false)}
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={images[selectedImageIndex]}
                alt={destination.name}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = defaultImage;
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => setShowImageLightbox(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationDetail;