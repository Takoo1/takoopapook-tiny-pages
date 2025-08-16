import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePackage } from '@/hooks/usePackages';
import { useReviewStatistics } from '@/hooks/useReviewStatistics';
import { Location } from '@/types/database';
import { Star, MapPin, Clock, Users, Edit, ArrowLeft, Eye, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DestinationCard from '@/components/DestinationCard';
import DestinationDetailPopup from '@/components/DestinationDetailPopup';
import ReviewSection from '@/components/ReviewSection';
import BookingButton from '@/components/BookingButton';
import PlanButton from '@/components/PlanButton';
import AppLayout from '@/components/AppLayout';
import { Capacitor } from '@capacitor/core';
const PackageDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Location | null>(null);
  const isNativeApp = Capacitor.isNativePlatform();

  // Fetch package data
  const {
    data: packageData,
    isLoading: packageLoading
  } = usePackage(id || '');

  // Fetch real review statistics
  const {
    data: reviewStats
  } = useReviewStatistics('package', id || '');

  // Fetch included locations
  const {
    data: includedLocations,
    isLoading: locationsLoading
  } = useQuery({
    queryKey: ['package-locations', packageData?.locations_included],
    queryFn: async () => {
      if (!packageData?.locations_included.length) return [];
      console.log('Fetching locations for package:', packageData.locations_included);
      const {
        data,
        error
      } = await supabase.from('locations').select('*').in('name', packageData.locations_included).eq('is_active', true);
      if (error) {
        console.error('Error fetching package locations:', error);
        throw error;
      }
      console.log('Fetched package locations:', data);
      return data as Location[];
    },
    enabled: !!packageData?.locations_included.length
  });
  const handlePreviousImage = () => {
    const imageUrl = packageData?.image_url;
    if (imageUrl) {
      setSelectedImageIndex(prev => prev === 0 ? 0 : prev - 1);
    }
  };
  const handleNextImage = () => {
    const imageUrl = packageData?.image_url;
    if (imageUrl) {
      setSelectedImageIndex(prev => prev === 0 ? 0 : prev + 1);
    }
  };
  if (packageLoading) {
    return <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>;
  }
  if (!packageData) {
    return <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Package not found</h1>
        <Link to="/packages" className="text-primary hover:underline">
          Back to Packages
        </Link>
      </div>;
  }

  // Enhanced images array - can include multiple images from package data
  const images = packageData?.image_url ? [packageData.image_url] : [];
  return <AppLayout>
    <div className={`${isNativeApp ? 'mobile-container mobile-section' : 'container mx-auto px-4 py-8'}`}>
      {/* Package Header */}
      <div className={`${isNativeApp ? 'mb-4' : 'mb-8'}`}>
        <div className="text-center space-y-3">
          <h1 className={`${isNativeApp ? 'text-lg font-semibold' : 'text-3xl md:text-4xl font-bold'} text-foreground leading-tight`}>
            {packageData.title}
          </h1>
          
          
          
          <div className="flex items-center justify-center gap-4">
            <div className={`${isNativeApp ? 'text-lg' : 'text-2xl'} font-bold text-primary`}>
              {packageData.price}
            </div>
            <div className="flex items-center">
              <Star className={`${isNativeApp ? 'h-3 w-3' : 'h-4 w-4'} fill-yellow-400 text-yellow-400 mr-1`} />
              <span className={`font-medium ${isNativeApp ? 'text-xs' : 'text-sm'}`}>
                {reviewStats ? reviewStats.averageRating.toFixed(1) : '0.0'}
              </span>
              <span className={`text-muted-foreground ${isNativeApp ? 'text-xs' : 'text-sm'} ml-1`}>
                ({reviewStats ? reviewStats.totalReviews : 0})
              </span>
            </div>
            <PlanButton itemId={packageData.id} itemType="package" itemName={packageData.title} labelMode="liked" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={`grid grid-cols-1 ${isNativeApp ? 'gap-3 mb-4' : 'lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12'}`}>
        {/* Left Column - Description */}
        <div className={`space-y-4 ${isNativeApp ? 'order-2' : 'lg:space-y-6 order-2 lg:order-1'}`}>
          <Card>
            <CardHeader className={`${isNativeApp ? 'pb-1 px-3 pt-3' : 'pb-4'}`}>
              <CardTitle className={`${isNativeApp ? 'text-sm font-medium' : 'text-lg lg:text-xl'}`}>Package Details</CardTitle>
            </CardHeader>
            <CardContent className={`space-y-3 ${isNativeApp ? 'px-3 pb-3' : 'space-y-4'}`}>
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${isNativeApp ? 'gap-2' : 'gap-3 lg:gap-4'}`}>
                <div className={`flex items-center ${isNativeApp ? 'p-1.5' : 'p-3'} bg-muted/50 rounded-lg`}>
                  <Clock className={`${isNativeApp ? 'h-2.5 w-2.5' : 'h-4 w-4'} mr-2 text-muted-foreground flex-shrink-0`} />
                  <span className={`${isNativeApp ? 'text-xs' : 'text-sm'} font-medium`}>Duration: {packageData.duration}</span>
                </div>
                <div className={`flex items-center ${isNativeApp ? 'p-1.5' : 'p-3'} bg-muted/50 rounded-lg`}>
                  <Users className={`${isNativeApp ? 'h-2.5 w-2.5' : 'h-4 w-4'} mr-2 text-muted-foreground flex-shrink-0`} />
                  <span className={`${isNativeApp ? 'text-xs' : 'text-sm'} font-medium`}>Group Size: {packageData.group_size}</span>
                </div>
              </div>
              
              <div>
                <h4 className={`font-semibold mb-2 ${isNativeApp ? 'text-sm' : ''}`}>Description</h4>
                <p className={`text-muted-foreground leading-relaxed ${isNativeApp ? 'text-sm' : ''}`}>
                  Experience the beauty and culture of {packageData.location} with this carefully curated {packageData.duration} adventure. 
                  This package includes visits to {packageData.locations_included.length} amazing destinations and offers 
                  {packageData.features.join(', ').toLowerCase()} to make your journey unforgettable.
                </p>
              </div>

              {/* Key Highlights */}
              {packageData.features.length > 0 && <div>
                  <h4 className={`font-semibold mb-3 ${isNativeApp ? 'text-sm' : ''}`}>Key Highlights</h4>
                  <div className={`grid grid-cols-1 md:grid-cols-2 ${isNativeApp ? 'gap-2' : 'gap-3'}`}>
                    {packageData.features.map((feature, index) => <div key={index} className={`flex items-center ${isNativeApp ? 'p-2' : 'p-3'} bg-muted/50 rounded-lg`}>
                        <div className={`${isNativeApp ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-primary rounded-full mr-3 flex-shrink-0`}></div>
                        <span className={`${isNativeApp ? 'text-xs' : 'text-sm'}`}>{feature}</span>
                      </div>)}
                  </div>
                </div>}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Image Gallery */}
        <div className="space-y-4 order-1 lg:order-2">
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl cursor-pointer group" onClick={() => setShowImageLightbox(true)}>
              <img src={images[selectedImageIndex] || '/placeholder.svg'} alt={packageData.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={e => {
                e.currentTarget.src = '/placeholder.svg';
              }} />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-3">
                  <Eye className="h-6 w-6 text-gray-800" />
                </div>
              </div>
            </div>
            
            {/* Image thumbnails - For future enhancement when multiple images are available */}
            {images.length > 1 && <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide" onClick={e => e.stopPropagation()} // Prevent parent lightbox trigger
            >
                {images.map((image, index) => <button key={index} type="button" onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedImageIndex(index);
              }} className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${index === selectedImageIndex ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-200' : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'}`}>
                    <img src={image} alt={`${packageData.title} view ${index + 1}`} className={`w-full h-full object-cover transition-all duration-300 ${index === selectedImageIndex ? 'opacity-100' : 'opacity-70 hover:opacity-90'}`} onError={e => {
                  e.currentTarget.src = '/placeholder.svg';
                }} draggable={false} />
                  </button>)}
              </div>}
          </div>
        </div>
      </div>


      {/* Locations Included */}
      {includedLocations && includedLocations.length > 0 && <div className={`${isNativeApp ? 'mb-6' : 'mb-12'}`}>
          <h2 className={`${isNativeApp ? 'text-lg' : 'text-2xl'} font-bold ${isNativeApp ? 'mb-3' : 'mb-6'}`}>Destinations Included</h2>
          <div className={`grid grid-cols-1 ${isNativeApp ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {includedLocations.map(location => <DestinationCard key={location.id} location={location} onClick={() => setSelectedDestination(location)} />)}
          </div>
        </div>}

      {/* Price and Action Buttons */}
      <Card className={`${isNativeApp ? 'mb-6' : 'mb-8 lg:mb-12'}`}>
        <CardContent className={`${isNativeApp ? 'p-2.5' : 'p-4 lg:p-6'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-center sm:text-left">
              <div className={`${isNativeApp ? 'text-base font-semibold' : 'text-2xl lg:text-3xl font-bold'} text-primary mb-1`}>{packageData.price}</div>
              <div className={`text-muted-foreground ${isNativeApp ? 'text-xs' : 'text-sm lg:text-base'}`}>Total package price</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {packageData.is_editable && <Button variant="outline" asChild className={`w-full sm:w-auto ${isNativeApp ? 'h-7 text-xs px-2' : ''}`}>
                  <Link to={`/admin/map-editor`}>
                    <Edit className={`${isNativeApp ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
                    Edit Package
                  </Link>
                </Button>}
              <BookingButton packageId={packageData.id} className={`w-full sm:w-auto ${isNativeApp ? 'h-7 text-xs px-2' : ''}`} />
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Image Lightbox */}
      {showImageLightbox && <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setShowImageLightbox(false)}>
          <div className="relative max-w-4xl max-h-full">
            <img src={images[selectedImageIndex] || '/placeholder.svg'} alt={packageData.title} className="max-w-full max-h-full object-contain rounded-lg" onError={e => {
            e.currentTarget.src = '/placeholder.svg';
          }} />
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20" onClick={() => setShowImageLightbox(false)}>
              <Plus className="h-6 w-6 rotate-45" />
            </Button>
          </div>
        </div>}

      {/* Reviews Section */}
      <div className={`${isNativeApp ? 'mb-6' : 'mb-12'}`}>
        <ReviewSection itemType="package" itemId={packageData.id} />
      </div>

      {/* Destination Detail Popup */}
      {selectedDestination && <DestinationDetailPopup destination={selectedDestination} onClose={() => setSelectedDestination(null)} />}
    </div>
    </AppLayout>;
};
export default PackageDetail;