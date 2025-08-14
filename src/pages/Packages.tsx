
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import PackageCard from '@/components/PackageCard';
import { Search } from 'lucide-react';
import { usePackages } from '@/hooks/usePackages';
import { usePackageCategories } from '@/hooks/usePackageCategories';
import { Capacitor } from '@capacitor/core';

const Packages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryFilter = searchParams.get('category') || 'all';
  const isNativeApp = Capacitor.isNativePlatform();
  
  const { data: packages = [], isLoading } = usePackages();
  const { categorizedPackages } = usePackageCategories(packages);
  
  const categories = [
    { id: 'all', name: 'All Packages', count: categorizedPackages.all.length },
    { id: 'nature', name: 'Nature', count: categorizedPackages.nature.length },
    { id: 'adventure', name: 'Adventure', count: categorizedPackages.adventure.length },
    { id: 'cultural', name: 'Cultural', count: categorizedPackages.cultural.length },
    { id: 'pilgrims', name: 'Pilgrims', count: categorizedPackages.pilgrims.length },
  ];
  
  // Filter packages based on category and search term
  const filteredPackages = categorizedPackages[categoryFilter as keyof typeof categorizedPackages]?.filter(pkg =>
    pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.locations_included.some(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];
  
  const getCategoryTitle = () => {
    const category = categories.find(cat => cat.id === categoryFilter);
    return category ? category.name : 'All Packages';
  };

  const handleCategoryClick = (categoryId: string) => {
    const url = categoryId === 'all' ? '/packages' : `/packages?category=${categoryId}`;
    navigate(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppLayout>
      <div className={`bg-gradient-to-br from-emerald-50 to-teal-50 ${isNativeApp ? 'min-h-[calc(100vh-5rem)]' : 'min-h-screen'}`}>
        {/* Hero Section */}
        <div className={`container mx-auto container-padding section-padding ${isNativeApp ? 'px-6 py-6' : ''}`}>
          <div className="text-center mb-8 sm:mb-12">
            <h1 className={`mb-4 sm:mb-6 ${isNativeApp ? 'text-2xl' : ''}`}>
              {getCategoryTitle()}
            </h1>
            <p className={`text-muted-foreground max-w-3xl mx-auto ${isNativeApp ? 'text-xs leading-relaxed' : 'text-base sm:text-lg'}`}>
              Curated travel experiences for unforgettable journeys
            </p>
          </div>

          {/* Top Row: Search/Filter + First Two Cards */}
          {!isLoading && filteredPackages.length > 0 && (
            <div className="mb-12">
              <div className={`grid grid-cols-1 gap-8 items-start ${isNativeApp ? 'lg:grid-cols-1' : 'xl:grid-cols-3'}`}>
                {/* Left Side - Search and Category Filters */}
                <div className={`${isNativeApp ? '' : 'xl:col-span-1'} space-y-6`}>
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search packages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg"
                    />
                  </div>

                  {/* Category Filters */}
                  {categoryFilter === 'all' && (
                   <div className="space-y-3">
                       <h3 className={`font-semibold text-foreground ${isNativeApp ? 'text-sm' : 'text-lg'}`}>Categories</h3>
                      <div className={`space-y-2 ${isNativeApp ? 'grid grid-cols-2 gap-2' : ''}`}>
                        {categories.slice(1).map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={`w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group text-left border border-gray-100 ${isNativeApp ? 'px-3 py-2' : 'px-4 py-3'}`}
                          >
                             <div className="flex justify-between items-center">
                               <span className={`font-medium text-foreground group-hover:text-emerald-600 transition-colors duration-300 ${isNativeApp ? 'text-xs' : 'text-base'}`}>
                                 {category.name}
                               </span>
                               <span className={`text-muted-foreground ${isNativeApp ? 'text-xs' : 'text-sm'}`}>
                                 {category.count}
                               </span>
                             </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - First Two Cards or All Cards in Native */}
                {!isNativeApp && (
                  <div className="xl:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredPackages.slice(0, 2).map((pkg) => (
                        <PackageCard key={pkg.id} package={pkg} />
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
              <div className="text-lg text-gray-600">Loading packages...</div>
            </div>
          )}

          {/* Remaining Cards or All Cards for Native */}
          {!isLoading && filteredPackages.length > 0 && (
            <div className="mb-8">
              {!isNativeApp && filteredPackages.length > 2 && (
                <h3 className="text-lg font-semibold text-foreground mb-4">More Packages</h3>
              )}
              <div className={`grid gap-6 ${isNativeApp ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {(isNativeApp ? filteredPackages : filteredPackages.slice(2)).map((pkg) => (
                  <PackageCard key={pkg.id} package={pkg} />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredPackages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">
                {searchTerm || categoryFilter !== 'all'
                  ? 'No packages found matching your criteria.'
                  : 'No packages available at the moment.'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Packages;
