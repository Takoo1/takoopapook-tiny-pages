import { MapPin, Clock, Users, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PlanButton from './PlanButton';
import { usePackages } from '@/hooks/usePackages';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from '@/hooks/use-mobile';

const PackageCarousel = () => {
  const { data: allPackages = [], isLoading } = usePackages();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Limit to 6 packages only
  const packages = allPackages.slice(0, 6);

  if (isLoading) {
    return (
      <section className="section-padding-lg bg-background">
        <div className="container mx-auto container-padding">
          <div className="text-center">
            <div className="text-lg text-muted-foreground">Loading packages...</div>
          </div>
        </div>
      </section>
    );
  }

  if (packages.length === 0) {
    return (
      <section className="section-padding-lg bg-background">
        <div className="container mx-auto container-padding">
          <div className="text-center">
            <h2 className="mb-4 sm:mb-6">
              Popular Tour
              <span className="text-primary"> Packages</span>
            </h2>
            <p className="text-xl text-muted-foreground">No packages available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding-lg bg-background">
      <div className="container mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in">
          <h2 className="mb-4 sm:mb-6">
            Popular Tour
            <span className="text-primary"> Packages</span>
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-primary mx-auto rounded-full mb-4 sm:mb-6" />
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover handcrafted journeys that showcase the best of Arunachal Pradesh's natural beauty, 
            rich culture, and adventurous spirit.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative px-4 md:px-12">
          <Carousel
            opts={{
              align: "start",
              slidesToScroll: 1,
              skipSnaps: false,
              dragFree: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {packages.map((pkg) => (
                <CarouselItem 
                  key={pkg.id} 
                  className={`pl-2 md:pl-4 ${isMobile ? 'basis-full' : 'basis-1/3'}`}
                >
                  <div 
                    className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2 h-full cursor-pointer backdrop-blur-sm"
                    onClick={() => navigate(`/my-tour/package/${pkg.id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                      <img 
                        src={pkg.image_url} 
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-primary/90 text-primary-foreground px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                        {pkg.price}
                      </div>
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                        <PlanButton 
                          itemId={pkg.id} 
                          itemType="package"
                          itemName={pkg.title}
                          variant="compact"
                        />
                      </div>
                      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex flex-wrap gap-1">
                        {pkg.features.slice(0, 2).map((feature, index) => (
                          <span key={index} className="bg-primary/90 text-primary-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center text-amber-500">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                          <span className="text-xs sm:text-sm font-medium ml-1">{pkg.rating}</span>
                          <span className="text-muted-foreground text-xs sm:text-sm ml-1">({pkg.reviews_count})</span>
                        </div>
                        <div className="flex items-center text-muted-foreground text-xs sm:text-sm">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {pkg.group_size}
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {pkg.title}
                      </h3>

                      <div className="flex items-center text-muted-foreground mb-1 sm:mb-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary" />
                        <span className="text-xs sm:text-sm line-clamp-1">{pkg.location}</span>
                      </div>

                      <div className="flex items-center text-muted-foreground mb-3 sm:mb-4">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary" />
                        <span className="text-xs sm:text-sm">{pkg.duration}</span>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/my-tour/package/${pkg.id}`);
                        }}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-1.5 sm:py-2 rounded-xl text-sm sm:text-base font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 group/btn flex items-center justify-center space-x-1 sm:space-x-2 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Buttons */}
            <CarouselPrevious className={`-left-6 md:-left-12 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'} bg-background/95 hover:bg-background border border-border hover:border-primary/50 shadow-xl`} />
            <CarouselNext className={`-right-6 md:-right-12 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'} bg-background/95 hover:bg-background border border-border hover:border-primary/50 shadow-xl`} />
          </Carousel>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 animate-fade-in">
          <button 
            onClick={() => navigate('/packages')}
            className="group bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl font-semibold text-base hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 hover:scale-105 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
          >
            <span>View All Packages</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PackageCarousel;