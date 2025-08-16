import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Package, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocations } from '@/hooks/useLocations';
import { usePackages } from '@/hooks/usePackages';

const searchSuggestions = [
  "Search destinations",
  "Search packages",
  "Your next adventure",
  "Discover Arunachal ",
  "Explore hidden gems...",
  "Trekking routes...",
  "Find cultural tours...",
  "Discover monasteries...",
  "Search nature trails..."
];

interface SearchResult {
  id: string;
  title: string;
  type: 'location' | 'package';
  subtitle?: string;
  icon: React.ReactNode;
  url: string;
}

interface SearchBarProps {
  onClose?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: locations } = useLocations();
  const { data: packages } = usePackages();

  // Rotate placeholder suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % searchSuggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // Search locations
    if (locations) {
      locations
        .filter(location => 
          location.name.toLowerCase().includes(searchTerm)
        )
        .slice(0, 5)
        .forEach(location => {
          searchResults.push({
            id: location.id,
            title: location.name,
            type: 'location',
            subtitle: 'Destination',
            icon: <MapPin className="h-4 w-4" />,
            url: `/explore?location=${location.id}`
          });
        });
    }

    // Search packages
    if (packages) {
      packages
        .filter(pkg => 
          pkg.title.toLowerCase().includes(searchTerm)
        )
        .slice(0, 5)
        .forEach(pkg => {
          searchResults.push({
            id: pkg.id,
            title: pkg.title,
            type: 'package',
            subtitle: `${pkg.duration} • ₹${pkg.price}`,
            icon: <Package className="h-4 w-4" />,
            url: `/packages?package=${pkg.id}`
          });
        });
    }

    setResults(searchResults.slice(0, 8));
  }, [query, locations, packages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      onClose?.();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setQuery('');
    setIsOpen(false);
    onClose?.();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={searchSuggestions[currentPlaceholder]}
          className="w-full pl-10 pr-8 py-2.5 rounded-xl border-2 border-primary/20 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm hover:shadow-md transition-all duration-300 text-sm placeholder:text-muted-foreground/70 placeholder:transition-opacity placeholder:duration-500 placeholder:text-xs"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-[300] max-h-80 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted transition-colors ${
                index === selectedIndex ? 'bg-muted' : ''
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === results.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                {result.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">
                  {result.title}
                </div>
                {result.subtitle && (
                  <div className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-xs text-muted-foreground capitalize">
                {result.type}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Popular Suggestions when no query */}
      {isOpen && query.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-[300]">
          <div className="p-3 border-b border-border">
            <h4 className="text-sm font-medium text-foreground">Popular Searches</h4>
          </div>
          <div className="p-2">
            {['Trekking', 'Cultural Tours', 'Adventure', 'Nature', 'Monasteries'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  navigate(`/explore?category=${suggestion}`);
                  setIsOpen(false);
                  onClose?.();
                }}
                className="w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
