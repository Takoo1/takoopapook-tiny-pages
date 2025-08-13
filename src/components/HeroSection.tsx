
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Discover the Hidden Paradise',
      subtitle: 'Experience the untouched beauty of Arunachal Pradesh',
      description: 'From snow-capped peaks to lush valleys, embark on a journey through India\'s northeastern gem.'
    },
    {
      image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Pristine Rivers & Waterfalls',
      subtitle: 'Nature\'s symphony awaits your arrival',
      description: 'Witness the power and beauty of cascading waterfalls and crystal-clear mountain streams.'
    },
    {
      image: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Majestic Mountain Ranges',
      subtitle: 'Touch the clouds, feel the serenity',
      description: 'Explore the Eastern Himalayas and discover peaks that have stories to tell.'
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[70vh] sm:h-[80vh] lg:h-screen overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            
            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto container-padding">
                <div className="max-w-xl lg:max-w-2xl">
                  <div className={`transform transition-all duration-1000 delay-300 ${
                    index === currentSlide 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-8 opacity-0'
                  }`}>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-emerald-200 mb-4 sm:mb-6 font-light">
                      {slide.subtitle}
                    </p>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-6 sm:mb-8 leading-relaxed">
                      {slide.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button 
                        onClick={() => navigate('/explore')}
                        className="group flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                      >
                        <span>Explore Now</span>
                        <Compass className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 group"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 group-hover:-translate-x-1 transition-transform" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 group"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-8 sm:w-12 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white shadow-lg' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 animate-bounce hidden sm:block">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white/70 rounded-full mt-1.5 sm:mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
