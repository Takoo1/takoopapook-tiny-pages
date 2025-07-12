
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DestinationCard from '@/components/DestinationCard';
import { useLocations } from '@/hooks/useLocations';
import { Search, Filter } from 'lucide-react';

const Explore = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const categoryFilter = searchParams.get('category');
  const { data: locations = [], isLoading } = useLocations();

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
              Discover the breathtaking beauty and rich culture of Arunachal Pradesh
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg"
              />
            </div>
          </div>

          {/* Category Filters */}
          {!categoryFilter && (
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => {
                const categoryCount = locations.filter(loc => 
                  loc.categories?.includes(category) && loc.is_active
                ).length;
                
                return (
                  <a
                    key={category}
                    href={`/explore?category=${category}`}
                    className="bg-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600">
                      {category}
                    </div>
                    <div className="text-sm text-gray-500">
                      {categoryCount} destinations
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading destinations...</div>
            </div>
          ) : filteredLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLocations.map((location) => (
                <DestinationCard key={location.id} location={location} />
              ))}
            </div>
          ) : (
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
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
