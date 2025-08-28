import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileStickySearchFABProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedPriceFilter: string;
  onPriceFilterChange: (filter: string) => void;
}

export function MobileStickySearchFAB({
  searchTerm,
  onSearchChange,
  selectedPriceFilter,
  onPriceFilterChange
}: MobileStickySearchFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  const priceOptions = [
    { label: "₹200", value: "200", position: "bottom" },
    { label: "₹500", value: "500", position: "right" }, 
    { label: "₹1000", value: "1000", position: "top" }
  ];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const getButtonPosition = (position: string) => {
    const baseClasses = "absolute w-12 h-12 rounded-full shadow-lg transition-all duration-300 transform";
    
    switch (position) {
      case "bottom":
        return `${baseClasses} ${isExpanded ? 'translate-y-16 opacity-100' : 'translate-y-0 opacity-0'}`;
      case "right": 
        return `${baseClasses} ${isExpanded ? 'translate-x-16 opacity-100' : 'translate-x-0 opacity-0'}`;
      case "top":
        return `${baseClasses} ${isExpanded ? '-translate-y-16 opacity-100' : 'translate-y-0 opacity-0'}`;
      default:
        return baseClasses;
    }
  };

  return (
    <div 
      ref={fabRef}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 md:hidden"
    >
      {/* Price filter buttons */}
      {priceOptions.map((option) => (
        <Button
          key={option.value}
          size="icon"
          variant={selectedPriceFilter === option.value ? "default" : "secondary"}
          className={cn(
            getButtonPosition(option.position),
            "text-xs font-semibold border-2 border-white/20"
          )}
          onClick={() => {
            onPriceFilterChange(selectedPriceFilter === option.value ? "all" : option.value);
          }}
          style={{ 
            pointerEvents: isExpanded ? 'auto' : 'none'
          }}
        >
          {option.label.replace('₹', '')}
        </Button>
      ))}

      {/* Search input */}
      <div 
        className={cn(
          "absolute w-48 transition-all duration-300 transform",
          isExpanded ? '-translate-x-52 opacity-100' : '-translate-x-0 opacity-0'
        )}
        style={{ 
          pointerEvents: isExpanded ? 'auto' : 'none'
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search organizer..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 text-sm bg-background/95 backdrop-blur-sm border-white/20"
          />
        </div>
      </div>

      {/* Main FAB button */}
      <Button
        size="icon"
        className={cn(
          "w-14 h-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300 transform",
          isExpanded ? "rotate-45 scale-110" : "rotate-0 scale-100"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <Search className="w-6 h-6 text-primary-foreground" />
        )}
      </Button>
    </div>
  );
}