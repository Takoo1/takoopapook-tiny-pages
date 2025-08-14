
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import DestinationCard from '@/components/DestinationCard';
import { useLocations } from '@/hooks/useLocations';
import { Search, Filter } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

const Explore = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const categoryFilter = searchParams.get('category');
  const { data: locations = [], isLoading } = useLocations();
  const isNativeApp = Capacitor.isNativePlatform();

  const categories = ['Nature', 'Adventure', 'Cultural', 'Pilgrims'];

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || 
                           (location.categories && location.categories.includes(categoryFilter));
    
    return matchesSearch && matchesCategory && location.is_active;
  });

  const getCategoryTitle = () => {
    if (categoryFilter) {
      return `${categoryFilter} Destinations`;
    }
    return 'All Destinations';
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/explore?category=${category}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppLayout>
      <div className={`bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 relative overflow-hidden ${isNativeApp ? 'min-h-[calc(100vh-5rem)]' : 'min-h-screen'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
        {/* Hero Section */}
        <div className={`container mx-auto container-padding section-padding relative ${isNativeApp ? 'px-6 py-6' : ''}`}>
          <div className="text-center mb-8 sm:mb-12">
            <h1 className={`mb-4 sm:mb-6 leading-tight ${isNativeApp ? 'text-2xl' : ''}`}>
              {getCategoryTitle()}
            </h1>
            <p className={`text-base sm:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed ${isNativeApp ? 'text-sm' : ''}`}>
              Discover the breathtaking beauty and rich culture of Arunachal Pradesh through our curated destinations
            </p>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-6 sm:mt-8 rounded-full" />
          </div>

          {/* Top Row: Search/Filter + First Two Cards */}
          {!isLoading && filteredLocations.length > 0 && (
            <div className="mb-12">
              <div className={`grid grid-cols-1 gap-8 items-start ${isNativeApp ? 'lg:grid-cols-1' : 'xl:grid-cols-3'}`}>
                {/* Left Side - Search and Category Filters */}
                <div className={`${isNativeApp ? '' : 'xl:col-span-1'} space-y-6`}>
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search destinations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-transparent bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg text-base placeholder:text-muted-foreground transition-all duration-300"
                    />
                  </div>

                  {/* Category Filters */}
                  {!categoryFilter && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground">Categories</h3>
                      <div className={`space-y-2 ${isNativeApp ? 'grid grid-cols-2 gap-2' : ''}`}>
                        {categories.map((category) => {
                          const categoryCount = locations.filter(loc => 
                            loc.categories?.includes(category) && loc.is_active
                          ).length;
                          
                          return (
                            <button
                              key={category}
                              onClick={() => handleCategoryClick(category)}
                              className="w-full bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group text-left border border-white/20"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-base font-medium text-foreground group-hover:text-emerald-600 transition-colors duration-300">
                                  {category}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {categoryCount}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - First Two Cards or All Cards in Native */}
                {!isNativeApp && (
                  <div className="xl:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredLocations.slice(0, 2).map((location) => (
                        <DestinationCard key={location.id} location={location} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading destinations...</div>
            </div>
          )}

          {/* Remaining Cards or All Cards for Native */}
          {!isLoading && filteredLocations.length > 0 && (
            <div className="mb-8">
              {!isNativeApp && filteredLocations.length > 2 && (
                <h3 className="text-xl font-semibold text-foreground mb-6">More Destinations</h3>
              )}
              <div className={`grid gap-8 ${isNativeApp ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {(isNativeApp ? filteredLocations : filteredLocations.slice(2)).map((location) => (
                  <DestinationCard key={location.id} location={location} />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredLocations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">
                {searchTerm || categoryFilter 
                  ? 'No destinations found matching your criteria.'
                  : 'No destinations available at the moment.'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;
