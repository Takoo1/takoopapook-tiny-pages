
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PackageCard from '@/components/PackageCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tour Packages
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover curated travel experiences crafted for unforgettable journeys
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={categoryFilter === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  if (category.id === 'all') {
                    newParams.delete('category');
                  } else {
                    newParams.set('category', category.id);
                  }
                  window.history.pushState({}, '', `${window.location.pathname}?${newParams}`);
                  window.location.reload();
                }}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {category.name}
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <main className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              {getCategoryTitle()}
            </h2>
            <span className="text-gray-600">
              {filteredPackages.length} packages found
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPackages.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No packages found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or browse different categories.
                </p>
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
