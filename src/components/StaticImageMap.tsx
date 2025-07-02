
import { useState, useRef, useEffect } from 'react';
import { Location, MapSettings } from '@/types/database';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StaticImageMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  isAdminMode?: boolean;
  onMapClick?: (x: number, y: number) => void;
  mapSettings?: MapSettings;
}

const StaticImageMap = ({ 
  locations, 
  selectedLocation, 
  onLocationSelect, 
  isAdminMode = false,
  onMapClick,
  mapSettings 
}: StaticImageMapProps) => {
  const [zoom, setZoom] = useState(mapSettings?.initial_zoom || 1);
  const [pan, setPan] = useState({ x: -(mapSettings?.center_x || 1000) * (mapSettings?.initial_zoom || 1) + 400, y: -(mapSettings?.center_y || 600) * (mapSettings?.initial_zoom || 1) + 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const minZoom = mapSettings?.min_zoom || 0.5;
  const maxZoom = mapSettings?.max_zoom || 3;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomFactor = newZoom / zoom;
      setPan(prev => ({
        x: mouseX - (mouseX - prev.x) * zoomFactor,
        y: mouseY - (mouseY - prev.y) * zoomFactor
      }));
    }
    
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAdminMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isAdminMode || !onMapClick) return;
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Convert screen coordinates to map coordinates
      const mapX = Math.round((clickX - pan.x) / zoom);
      const mapY = Math.round((clickY - pan.y) / zoom);
      
      // Ensure coordinates are within bounds
      if (mapX >= 0 && mapX <= 2000 && mapY >= 0 && mapY <= 1200) {
        onMapClick(mapX, mapY);
      }
    }
  };

  const zoomIn = () => {
    const newZoom = Math.min(maxZoom, zoom + 0.2);
    setZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(minZoom, zoom - 0.2);
    setZoom(newZoom);
  };

  useEffect(() => {
    if (mapSettings) {
      setZoom(mapSettings.initial_zoom);
      setPan({ 
        x: -mapSettings.center_x * mapSettings.initial_zoom + 400, 
        y: -mapSettings.center_y * mapSettings.initial_zoom + 300 
      });
    }
  }, [mapSettings]);

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden rounded-lg">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <Button
          onClick={zoomIn}
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm"
          disabled={zoom >= maxZoom}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          onClick={zoomOut}
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm"
          disabled={zoom <= minZoom}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 left-4 z-20 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
        Zoom: {Math.round(zoom * 100)}%
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full ${isDragging ? 'cursor-grabbing' : isAdminMode ? 'cursor-crosshair' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMapClick}
      >
        {/* Map Image */}
        <div
          className="absolute select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '2000px',
            height: '1200px'
          }}
        >
          <img
            src="/lovable-uploads/85ee2b76-d8ce-4074-93bb-76db5001d131.png"
            alt="Arunachal Pradesh Map"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
          
          {/* Location Markers */}
          {locations.filter(loc => loc.is_active).map((location) => {
            const isSelected = selectedLocation?.id === location.id;
            return (
              <div
                key={location.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full z-10"
                style={{
                  left: `${location.coordinates_x}px`,
                  top: `${location.coordinates_y}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onLocationSelect(location);
                }}
              >
                {/* Marker Pin */}
                <div className={`relative transition-all duration-300 ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
                  <div className={`w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center ${
                    isSelected ? 'bg-orange-500' : 'bg-emerald-500'
                  }`}>
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  
                  {/* Pulse Animation */}
                  <div className={`absolute inset-0 rounded-full animate-ping ${
                    isSelected ? 'bg-orange-400' : 'bg-emerald-400'
                  } opacity-75`} />
                  
                  {/* Location Label */}
                  {isSelected && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                      {location.name}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Mode Instructions */}
      {isAdminMode && (
        <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
          Click on the map to place a marker
        </div>
      )}
    </div>
  );
};

export default StaticImageMap;
