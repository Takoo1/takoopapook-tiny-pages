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

  // Quarter-circle expansion constants
  const expandRadius = 120; // Distance from main button center to expanded buttons
  const expandedButtonSize = 48; // Size of expanded circular buttons

  // Four buttons positioned in a quarter circle (90° arc)
  const buttons = [
    { 
      label: "Search", 
      value: "search", 
      icon: "🔍", 
      angle: 90 // Top position (touches right edge)
    },
    { 
      label: "₹200", 
      value: "200", 
      icon: "200", 
      angle: 120 // Upper middle
    },
    { 
      label: "₹500", 
      value: "500", 
      icon: "500", 
      angle: 150 // Lower middle
    },
    { 
      label: "₹1000", 
      value: "1000", 
      icon: "1K", 
      angle: 180 // Bottom position (touches right edge)
    }
  ];

  // Calculate button position from angle
  const getButtonPosition = (angle: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: -expandRadius * Math.cos(radian), // Negative because expanding left
      y: -expandRadius * Math.sin(radian)  // Negative because 0° is right, 90° is up
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
      {/* Expanded Circular Buttons */}
      {buttons.map((button) => {
        const position = getButtonPosition(button.angle);
        const isActive = button.value === "search" 
          ? showSearchInput 
          : selectedPriceFilter === button.value;
        
        return (
          <button
            key={button.value}
            className={cn(
              "absolute rounded-full shadow-lg flex items-center justify-center transition-all duration-500 ease-out text-xs font-semibold",
              isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
            style={{
              width: `${expandedButtonSize}px`,
              height: `${expandedButtonSize}px`,
              right: `${-position.x - expandedButtonSize/2}px`,
              top: `50%`,
              transform: `translateY(calc(-50% + ${position.y}px))`,
              transitionDelay: isExpanded ? `${buttons.indexOf(button) * 50}ms` : '0ms'
            }}
            onClick={() => handleButtonClick(button)}
          >
            {button.icon}
          </button>
        );
      })}

      {/* Search Input Popover */}
      {showSearchInput && (
        <div 
          className={cn(
            "absolute w-64 transition-all duration-300 ease-out",
            showSearchInput ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}
          style={{
            right: `${expandRadius + expandedButtonSize + 16}px`,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search organizer..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 text-sm bg-background/95 backdrop-blur-sm border-white/20 shadow-lg"
              autoFocus
            />
          </div>
        </div>
      )}

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