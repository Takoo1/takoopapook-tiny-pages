
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PackageCard from '@/components/PackageCard';
import { Search } from 'lucide-react';
import { usePackages } from '@/hooks/usePackages';
import { usePackageCategories } from '@/hooks/usePackageCategories';

const Packages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || 'all';
  
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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20 bg-gradient-to-br from-emerald-50 to-teal-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              {getCategoryTitle()}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover curated travel experiences crafted for unforgettable journeys
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg"
              />
            </div>
          </div>

          {/* Category Filters */}
          {categoryFilter === 'all' && (
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={category.id === 'all' ? '/packages' : `/packages?category=${category.id}`}
                  className="bg-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600">
                    {category.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.count} packages
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading packages...</div>
            </div>
          ) : filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPackages.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">
                {searchTerm || categoryFilter 
                  ? 'No packages found matching your criteria.'
                  : 'No packages available at the moment.'
                }
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Packages;
