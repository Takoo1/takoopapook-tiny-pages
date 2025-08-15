
import HeroSection from '@/components/HeroSection';
import PackageCarousel from '@/components/PackageCarousel';
import DestinationCarousel from '@/components/DestinationCarousel';
import AppLayout from '@/components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, Heart, Users } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const [isNativeApp, setIsNativeApp] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());
  }, []);

  // Hide founder section on mobile (both native and web)
  const shouldHideFounderSection = isNativeApp || isMobile;

  return (
    <AppLayout>
      <HeroSection />
      
      <PackageCarousel />

      <DestinationCarousel />

      {/* Founder Section - Hidden on mobile/native */}
      {!shouldHideFounderSection && (
      <section className="mobile-section bg-gradient-to-br from-muted/30 to-accent/20">
        <div className="mobile-container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mobile-spacing-lg animate-fade-in">
              <h2 className="mobile-heading-xl mb-3 sm:mb-4">
                Meet Our Founder
              </h2>
              <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            </div>

            <div className="text-center">
              <div className="relative animate-scale-in mb-6 sm:mb-8 lg:mb-10 flex justify-center">
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                    <img
                      src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                      alt="Jumnya John Dini - Founder"
                      className="w-80 h-80 sm:w-96 sm:h-96 lg:w-[400px] lg:h-[400px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent" />
                  </div>
                  
                  <div className="absolute -top-3 -left-3 sm:-top-6 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-full animate-pulse" />
                  <div className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-400/30 to-emerald-500/30 rounded-full animate-pulse" />
                  
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Jumnya John Dini</h3>
                    <p className="text-sm sm:text-base text-emerald-600 font-semibold">Founder & CEO</p>
                  </div>
                </div>
              </div>

              <div className="content-spacing animate-fade-in max-w-4xl mx-auto">
                  <div>
                    <h3 className="mobile-heading-lg mb-4 sm:mb-6 text-center">
                      Visionary Leader
                      <span className="block mobile-text-sm font-normal text-primary mt-1 sm:mt-2">From Likabali, Arunachal Pradesh</span>
                    </h3>
                    
                    <div className="mobile-spacing mobile-text text-muted-foreground leading-relaxed text-center">
                      <p className="mb-4">
                        Jumnya John Dini, founder of TAKOO-PAPOOK Eco-Tourist, hails from Likabali, Arunachal Pradesh—a land of rich cultural heritage and natural beauty. Growing up amidst dense forests, flowing rivers, and vibrant indigenous traditions, Jumnya developed a deep-rooted love for nature and his homeland's unique culture.
                      </p>
                      
                      <p>
                        With a Diploma in Tourism Studies and years of experience in environmental conservation, Jumnya combines formal education with real-world knowledge to promote sustainable tourism while preserving Arunachal Pradesh's environment and culture.
                      </p>
                    </div>

                    <div className="mt-6 sm:mt-8">
                      <button 
                        onClick={() => navigate('/founder-profile')}
                        className="mobile-btn-primary transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Read More About Him
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
    </AppLayout>
  );
};

export default Index;
