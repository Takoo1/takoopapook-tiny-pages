
import { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Star, ArrowRight } from 'lucide-react';

const PackageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const packages = [
    {
      id: 1,
      title: 'Tawang Monastery Adventure',
      location: 'Tawang, Arunachal Pradesh',
      duration: '5 Days, 4 Nights',
      groupSize: '2-8 People',
      price: '₹25,000',
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      features: ['Ancient Monastery', 'Mountain Views', 'Local Culture']
    },
    {
      id: 2,
      title: 'Ziro Valley Cultural Tour',
      location: 'Ziro Valley, Arunachal Pradesh',
      duration: '4 Days, 3 Nights',
      groupSize: '2-6 People',
      price: '₹18,000',
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      features: ['Apatani Tribe', 'Rice Fields', 'Music Festival']
    },
    {
      id: 3,
      title: 'Sela Pass Expedition',
      location: 'Sela Pass, Arunachal Pradesh',
      duration: '3 Days, 2 Nights',
      groupSize: '4-12 People',
      price: '₹15,000',
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      features: ['High Altitude', 'Snow Views', 'Adventure Trek']
    },
    {
      id: 4,
      title: 'Namdapha Wildlife Safari',
      location: 'Namdapha National Park',
      duration: '6 Days, 5 Nights',
      groupSize: '3-10 People',
      price: '₹32,000',
      rating: 4.6,
      reviews: 78,
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      features: ['Wildlife Safari', 'Dense Forests', 'Rare Species']
    },
    {
      id: 5,
      title: 'Bomdila Heritage Walk',
      location: 'Bomdila, Arunachal Pradesh',
      duration: '3 Days, 2 Nights',
      groupSize: '2-8 People',
      price: '₹12,000',
      rating: 4.5,
      reviews: 92,
      image: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      features: ['Buddhist Culture', 'Craft Center', 'Mountain Views']
    }
  ];

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, packages.length - 2));
    }, 4000);

    return () => clearInterval(interval);
  }, [packages.length]);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Popular Tour
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Packages</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover handcrafted journeys that showcase the best of Arunachal Pradesh's natural beauty, 
            rich culture, and adventurous spirit.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / 3)}%)`,
              width: `${packages.length * (100 / 3)}%`
            }}
          >
            {packages.map((pkg) => (
              <div key={pkg.id} className="w-full px-4" style={{ width: `${100 / packages.length}%` }}>
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={pkg.image} 
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium">
                      {pkg.price}
                    </div>
                    <div className="absolute bottom-4 left-4 flex space-x-1">
                      {pkg.features.map((feature, index) => (
                        <span key={index} className="bg-emerald-500/90 text-white px-2 py-1 rounded-md text-xs font-medium">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium ml-1">{pkg.rating}</span>
                        <span className="text-gray-500 text-sm ml-1">({pkg.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Users className="h-4 w-4 mr-1" />
                        {pkg.groupSize}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                      {pkg.title}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1 text-emerald-500" />
                      <span className="text-sm">{pkg.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-4">
                      <Clock className="h-4 w-4 mr-1 text-emerald-500" />
                      <span className="text-sm">{pkg.duration}</span>
                    </div>

                    <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group/btn flex items-center justify-center space-x-2">
                      <span>Book Now</span>
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.max(1, packages.length - 2) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-emerald-500 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 mx-auto">
            <span>View All Packages</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PackageCarousel;
