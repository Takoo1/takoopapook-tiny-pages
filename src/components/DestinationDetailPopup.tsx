import { useState } from 'react';
import { X, Star, MapPin, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Location } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DestinationDetailPopupProps {
  destination: Location;
  onClose: () => void;
}

const DestinationDetailPopup = ({ destination, onClose }: DestinationDetailPopupProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop";
  const images = destination.images && destination.images.length > 0 ? destination.images : [defaultImage];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        {/* Popup Content */}
        <Card 
          className="w-full max-w-4xl max-h-[90vh] bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                  {destination.name}
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-700">{destination.rating}</span>
                    <span className="text-gray-500">({destination.reviews_count} reviews)</span>
                  </div>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>Arunachal Pradesh</span>
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-0">
            <ScrollArea className="h-[calc(90vh-140px)]">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Images */}
                <div className="space-y-4">
                  <div className="relative">
                    <div 
                      className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg cursor-pointer group"
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
                        <div className="bg-white/90 rounded-full p-2">
                          <Eye className="h-5 w-5 text-gray-800" />
                        </div>
                      </div>
                      
                      {/* Navigation arrows for multiple images */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all duration-200"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all duration-200"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Image thumbnails */}
                    {images.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                              index === selectedImageIndex 
                                ? 'border-emerald-500 shadow-lg ring-1 ring-emerald-200' 
                                : 'border-gray-200 hover:border-emerald-300'
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
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-800">Description</h4>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {destination.description || 'Discover the beauty and culture of this amazing destination in Arunachal Pradesh.'}
                    </p>
                  </div>

                  {destination.bullet_points && destination.bullet_points.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-800">Key Highlights</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {destination.bullet_points.map((point, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm leading-relaxed">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Information Cards */}
                  <div className="grid grid-cols-1 gap-3 mt-6">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3">
                      <h5 className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm mb-1">Best Time to Visit</h5>
                      <p className="text-emerald-700 dark:text-emerald-300 text-xs">October to April for pleasant weather</p>
                    </div>
                    
                    <div className="bg-teal-50 dark:bg-teal-950/20 rounded-lg p-3">
                      <h5 className="font-semibold text-teal-800 dark:text-teal-200 text-sm mb-1">Experience Level</h5>
                      <p className="text-teal-700 dark:text-teal-300 text-xs">Suitable for all experience levels</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Image Lightbox */}
      {showImageLightbox && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setShowImageLightbox(false)}>
          <div className="relative max-w-4xl max-h-full">
            <img
              src={images[selectedImageIndex]}
              alt={destination.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = defaultImage;
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowImageLightbox(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-5 w-5" />
            </Button>
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DestinationDetailPopup;