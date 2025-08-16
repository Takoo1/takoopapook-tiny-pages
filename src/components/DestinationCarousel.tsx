import { useAllLocations } from '@/hooks/useLocations';
import DestinationCard from './DestinationCard';
import { MapPin } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { useIsMobile } from '@/hooks/use-mobile';
import { Capacitor } from '@capacitor/core';
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";
const DestinationCarousel = () => {
  const {
    data: locations = [],
    isLoading,
    error
  } = useAllLocations();
  const isMobile = useIsMobile();
  const isNativeApp = Capacitor.isNativePlatform();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  // Filter only active locations and limit to 9
  const activeLocations = locations.filter(location => location.is_active).slice(0, 9);
  React.useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);
  if (isLoading) {
    return <section className="section-padding-lg bg-background">
        <div className="container mx-auto container-padding">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="mb-4 sm:mb-6">
              Popular
              <span className="text-primary"> Destinations</span>
            </h2>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-primary mx-auto rounded-full mb-4 sm:mb-6" />
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-4">
              {[1, 2, 3].map(i => <div key={i} className="bg-muted rounded-xl w-80 h-80"></div>)}
            </div>
          </div>
        </div>
      </section>;
  }
  if (error) {
    return <section className="section-padding-lg bg-background">
        <div className="container mx-auto container-padding">
          <div className="text-center">
            <h2 className="mb-4 sm:mb-6">
              Popular
              <span className="text-primary"> Destinations</span>
            </h2>
            <p className="text-destructive">Failed to load destinations. Please try again later.</p>
          </div>
        </div>
      </section>;
  }
  return <section className="section-padding-lg bg-background">
      <div className="container mx-auto container-padding py-[20px]">
        {/* Section Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
          <h2 className="mb-2 sm:mb-3">
            Popular
            <span className="text-primary"> Destinations</span>
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        {activeLocations.length === 0 ? <div className="text-center py-8 sm:py-12 lg:py-16">
            <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">
              No Destinations Available Yet
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground/70 max-w-md mx-auto">
              We're working on adding amazing destinations for you to explore. 
              Check back soon for exciting new places to visit!
            </p>
          </div> : (/* Carousel */
      <div className="relative">
            <Carousel setApi={setApi} plugins={[Autoplay({
          delay: 3000
        }) as any]} opts={{
          align: "start",
          slidesToScroll: 1,
          skipSnaps: false,
          dragFree: false,
          loop: true
        }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {activeLocations.map(location => <CarouselItem key={location.id} className={`pl-2 md:pl-4 ${isMobile ? 'basis-full' : 'basis-1/3'}`}>
                    <DestinationCard location={location} />
                  </CarouselItem>)}
              </CarouselContent>
            </Carousel>
            
            {/* Navigation Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {activeLocations.map((_, index) => <button key={index} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === current ? 'bg-primary w-6' : 'bg-muted-foreground/30'}`} onClick={() => api?.scrollTo(index)} />)}
            </div>
          </div>)}
      </div>
    </section>;
};
export default DestinationCarousel;