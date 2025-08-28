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
  const [showSearchInput, setShowSearchInput] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // SVG dimensions and radii
  const svgSize = 200;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const innerRadius = 29; // Just 1px larger than FAB button radius (28px)
  const outerRadius = 65;

  // Ring segments configuration - rotated 90 degrees clockwise
  const segments = [
    { label: "Search", value: "search", startAngle: 315, endAngle: 360, icon: "search" },
    { label: "₹200", value: "200", startAngle: 270, endAngle: 315 },
    { label: "₹500", value: "500", startAngle: 225, endAngle: 270 },
    { label: "₹1000", value: "1000", startAngle: 180, endAngle: 225 }
  ];

  // Helper function to convert polar to cartesian coordinates
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Helper function to create SVG arc path
  const createArcPath = (startAngle: number, endAngle: number) => {
    const start1 = polarToCartesian(centerX, centerY, outerRadius, endAngle);
    const end1 = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const start2 = polarToCartesian(centerX, centerY, innerRadius, endAngle);
    const end2 = polarToCartesian(centerX, centerY, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start1.x, start1.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end1.x, end1.y,
      "L", end2.x, end2.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, start2.x, start2.y,
      "Z"
    ].join(" ");
  };

  // Get text position for segment labels
  const getTextPosition = (startAngle: number, endAngle: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const textRadius = (innerRadius + outerRadius) / 2;
    return polarToCartesian(centerX, centerY, textRadius, midAngle);
  };

  // Handle segment click
  const handleSegmentClick = (segment: typeof segments[0]) => {
    if (segment.value === "search") {
      setShowSearchInput(!showSearchInput);
    } else {
      onPriceFilterChange(selectedPriceFilter === segment.value ? "all" : segment.value);
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
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 md:hidden"
    >
      {/* SVG Ring Menu */}
      <div 
        className={cn(
          "absolute transition-all duration-500 ease-out",
          isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        )}
        style={{
          right: '0', // Align with FAB button
          top: '0',
          width: '56px', // Same as FAB button
          height: '56px', // Same as FAB button
          transform: 'translate(0, 0)'
        }}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="filter drop-shadow-lg"
          style={{
            position: 'absolute',
            right: '50%',
            top: '50%',
            transform: 'translate(50%, -50%)' // Center SVG on FAB button
          }}
        >
          {segments.map((segment) => {
            const isActive = segment.value === "search" 
              ? showSearchInput 
              : selectedPriceFilter === segment.value;
            const textPos = getTextPosition(segment.startAngle, segment.endAngle);
            
            return (
              <g key={segment.value}>
                <path
                  d={createArcPath(segment.startAngle, segment.endAngle)}
                  className={cn(
                    "cursor-pointer transition-all duration-300",
                    isActive 
                      ? "fill-primary stroke-primary-foreground/20" 
                      : "fill-secondary hover:fill-secondary/80 stroke-border"
                  )}
                  strokeWidth="1"
                  onClick={() => handleSegmentClick(segment)}
                />
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn(
                    "text-xs font-semibold pointer-events-none select-none transition-colors duration-300",
                    isActive ? "fill-primary-foreground" : "fill-foreground"
                  )}
                  onClick={() => handleSegmentClick(segment)}
                >
                  {segment.value === "search" ? (
                    <tspan className="text-sm">🔍</tspan>
                  ) : (
                    segment.label.replace('₹', '')
                  )}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Search Input Popover */}
      {showSearchInput && (
        <div 
          className={cn(
            "absolute w-64 transition-all duration-300 ease-out",
            showSearchInput ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}
          style={{
            right: '80px',
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

      {/* Main FAB Button - Half circle + rectangle design */}
      <div className="relative">
        <Button
          size="icon"
          className={cn(
            "w-14 h-14 shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300 transform relative z-10",
            "rounded-l-full rounded-r-none", // Half circle on left, flat on right
            isExpanded ? "rotate-45 scale-110" : "rotate-0 scale-100"
          )}
          style={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <X className="w-6 h-6 text-primary-foreground" />
          ) : (
            <Search className="w-6 h-6 text-primary-foreground" />
          )}
        </Button>
        
        {/* Hidden rectangle extending off-screen */}
        <div 
          className="absolute top-0 left-14 w-4 h-14 bg-primary transition-all duration-300"
          style={{
            transform: isExpanded ? "scale(1.1)" : "scale(1)"
          }}
        />
      </div>
    </div>
  );
}