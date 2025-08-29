import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Plus } from "lucide-react";
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
  const [showSearchInput, setShowSearchInput] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // D-shaped button constants
  const buttonSize = 56; // Main button diameter
  const buttonRadius = buttonSize / 2;
  const rectWidth = 12; // Flat edge width

  // Expanded buttons configuration
  const expandedButtonHeight = 36;
  const expandedButtonWidth = 180;
  const expandedButtonSpacing = 6;
  
  // Four buttons in vertical stack
  const buttons = [
    { 
      label: "Search", 
      value: "search", 
      type: "search",
      position: -2 // 2 positions above center
    },
    { 
      label: "Rs. 200 Tickets", 
      value: "200", 
      type: "filter",
      position: -1 // 1 position above center
    },
    { 
      label: "Rs. 500 Tickets", 
      value: "500", 
      type: "filter",
      position: 1 // 1 position below center
    },
    { 
      label: "Rs. 1000 Tickets", 
      value: "1000", 
      type: "filter",
      position: 2 // 2 positions below center
    }
  ];

  // Calculate button position
  const getButtonPosition = (position: number) => {
    return {
      y: position * (expandedButtonHeight + expandedButtonSpacing)
    };
  };

  // Handle button click
  const handleButtonClick = (button: typeof buttons[0]) => {
    if (button.value === "search") {
      setShowSearchInput(!showSearchInput);
    } else {
      onPriceFilterChange(selectedPriceFilter === button.value ? "all" : button.value);
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setShowSearchInput(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div 
      ref={fabRef}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 md:hidden"
    >
      {/* Expanded Rectangular Buttons */}
      {buttons.map((button) => {
        const position = getButtonPosition(button.position);
        const isActive = button.value === "search" 
          ? showSearchInput 
          : selectedPriceFilter === button.value;
        
        return (
          <div key={button.value}>
            {button.type === "search" ? (
              /* Search Input */
              <div
                className={cn(
                  "absolute transition-all duration-500 ease-out",
                  isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                )}
                style={{
                  width: `${expandedButtonWidth}px`,
                  right: 0,
                  top: `50%`,
                  transform: `translateY(calc(-50% + ${position.y}px))`,
                  transitionDelay: isExpanded ? `${buttons.indexOf(button) * 50}ms` : '0ms'
                }}
              >
                <Input
                  type="text"
                  placeholder="Search organizer..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="text-sm bg-background/95 backdrop-blur-sm border shadow-lg"
                  style={{ height: `${expandedButtonHeight}px` }}
                />
              </div>
            ) : (
              /* Filter Buttons */
              <button
                className={cn(
                  "absolute rounded-lg shadow-lg flex items-center justify-center transition-all duration-500 ease-out text-sm font-medium",
                  isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                style={{
                  width: `${expandedButtonWidth}px`,
                  height: `${expandedButtonHeight}px`,
                  right: 0,
                  top: `50%`,
                  transform: `translateY(calc(-50% + ${position.y}px))`,
                  transitionDelay: isExpanded ? `${buttons.indexOf(button) * 50}ms` : '0ms'
                }}
                onClick={() => handleButtonClick(button)}
              >
                {button.label}
              </button>
            )}
          </div>
        );
      })}

      {/* Main D-shaped Button */}
      <button
        className={cn(
          "bg-primary hover:bg-primary/90 rounded-l-full rounded-r-none shadow-xl flex items-center justify-center transition-all duration-300 relative z-10",
          isExpanded ? "scale-110" : "scale-100"
        )}
        style={{
          width: `${rectWidth + buttonRadius}px`,
          height: `${buttonSize}px`,
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Search className="w-6 h-6 text-primary-foreground" />
      </button>
    </div>
  );
}