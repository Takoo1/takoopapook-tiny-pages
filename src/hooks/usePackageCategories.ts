import { Package } from '@/hooks/usePackages';
import { useLocations } from '@/hooks/useLocations';
import { useMemo } from 'react';

export const usePackageCategories = (packages: Package[]) => {
  const { data: locations = [] } = useLocations();
  
  return useMemo(() => {
    const getPackageCategories = (pkg: Package): string[] => {
      const categories = new Set<string>();
      
      // Get categories based on included locations
      pkg.locations_included.forEach(locationName => {
        const location = locations.find(loc => loc.name === locationName);
        if (location?.categories) {
          location.categories.forEach(category => categories.add(category));
        }
      });
      
      return Array.from(categories);
    };

    const categorizedPackages = {
      all: packages,
      nature: packages.filter(pkg => getPackageCategories(pkg).includes('Nature')),
      adventure: packages.filter(pkg => getPackageCategories(pkg).includes('Adventure')),
      cultural: packages.filter(pkg => getPackageCategories(pkg).includes('Cultural')),
      pilgrims: packages.filter(pkg => getPackageCategories(pkg).includes('Pilgrims')),
    };

    return { categorizedPackages, getPackageCategories };
  }, [packages, locations]);
};