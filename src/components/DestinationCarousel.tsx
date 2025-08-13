import { useAllLocations } from '@/hooks/useLocations';
import DestinationCard from './DestinationCard';
import { MapPin } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from '@/hooks/use-mobile';

const DestinationCarousel = () => {
  const { data: locations = [], isLoading, error } = useAllLocations();
  const isMobile = useIsMobile();

  // Filter only active locations and limit to 9
  const activeLocations = locations.filter(location => location.is_active).slice(0, 9);

  if (isLoading) {
    return (
      <section className="section-padding-lg bg-background">
        <div className="container mx-auto container-padding">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="mb-4 sm:mb-6">
              Popular
              <span className="text-primary"> Destinations</span>
            </h2>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-primary mx-auto rounded-full mb-4 sm:mb-6" />
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover amazing places and create unforgettable memories
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted rounded-xl w-80 h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-padding-lg bg-background">
        <div className="container mx-auto container-padding">
          <div className="text-center">
            <h2 className="mb-4 sm:mb-6">
              Popular
              <span className="text-primary"> Destinations</span>
            </h2>
            <p className="text-destructive">Failed to load destinations. Please try again later.</p>
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
            Popular
            <span className="text-primary"> Destinations</span>
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-primary mx-auto rounded-full mb-4 sm:mb-6" />
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover amazing places and create unforgettable memories with our carefully curated destinations
          </p>
        </div>

        {activeLocations.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16">
            <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">
              No Destinations Available Yet
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground/70 max-w-md mx-auto">
              We're working on adding amazing destinations for you to explore. 
              Check back soon for exciting new places to visit!
            </p>
          </div>
        ) : (
          /* Carousel */
          <div className="relative px-4 md:px-12">
            <Carousel
              opts={{
                align: "start",
                slidesToScroll: 1,
                skipSnaps: false,
                dragFree: false,
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {activeLocations.map((location) => (
                  <CarouselItem 
                    key={location.id} 
                    className={`pl-2 md:pl-4 ${isMobile ? 'basis-full' : 'basis-1/3'}`}
                  >
                    <DestinationCard location={location} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Navigation Buttons */}
              <CarouselPrevious className={`-left-6 md:-left-12 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'} bg-background/95 hover:bg-background border border-border hover:border-primary/50 shadow-xl`} />
              <CarouselNext className={`-right-6 md:-right-12 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'} bg-background/95 hover:bg-background border border-border hover:border-primary/50 shadow-xl`} />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
};

export default DestinationCarousel;