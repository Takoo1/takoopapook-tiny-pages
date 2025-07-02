
import { useState, useRef, useEffect } from 'react';
import { Location, MapSettings } from '@/types/database';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StaticImageMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  isAdminMode?: boolean;
  isAddingLocation?: boolean;
  onMapClick?: (x: number, y: number) => void;
  mapSettings?: MapSettings;
  isViewportMode?: boolean;
  viewport?: { x: number; y: number; width: number; height: number };
  onViewportChange?: (viewport: { x: number; y: number; width: number; height: number }) => void;
}

const StaticImageMap = ({ 
  locations, 
  selectedLocation, 
  onLocationSelect, 
  isAdminMode = false,
  isAddingLocation = false,
  onMapClick,
  mapSettings,
  isViewportMode = false,
  viewport,
  onViewportChange
}: StaticImageMapProps) => {
  const [zoom, setZoom] = useState(isAdminMode ? 0.5 : (mapSettings?.initial_zoom || 1));
  const [pan, setPan] = useState({ 
    x: isAdminMode ? 0 : (-(mapSettings?.center_x || 1000) * (mapSettings?.initial_zoom || 1) + 400),
    y: isAdminMode ? 0 : (-(mapSettings?.center_y || 600) * (mapSettings?.initial_zoom || 1) + 300)
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isViewportDragging, setIsViewportDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const minZoom = isAdminMode ? 0.3 : (mapSettings?.min_zoom || 0.5);
  const maxZoom = isAdminMode ? 2 : (mapSettings?.max_zoom || 3);

  // Initialize admin mode to show full map
  useEffect(() => {
    if (isAdminMode && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const imageAspectRatio = 2000 / 1200;
      const containerAspectRatio = containerRect.width / containerRect.height;
      
      let fitZoom;
      if (containerAspectRatio > imageAspectRatio) {
        fitZoom = containerRect.height / 1200;
      } else {
        fitZoom = containerRect.width / 2000;
      }
      
      setZoom(fitZoom);
      setPan({
        x: (containerRect.width - 2000 * fitZoom) / 2,
        y: (containerRect.height - 1200 * fitZoom) / 2
      });
    }
  }, [isAdminMode]);

  const handleWheel = (e: React.WheelEvent) => {
    if (isViewportMode) return;
    
    // Don't use preventDefault here to avoid passive listener issues
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
    if (isViewportMode || isAddingLocation) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isViewportMode) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isAddingLocation || !onMapClick) return;
    
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

  const handleViewportDrag = (e: React.MouseEvent) => {
    if (!isViewportMode || !viewport || !onViewportChange) return;
    
    if (isViewportDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Convert to map coordinates
      const mapX = (mouseX - pan.x) / zoom;
      const mapY = (mouseY - pan.y) / zoom;
      
      // Update viewport position (keeping it within bounds)
      const newX = Math.max(0, Math.min(2000 - viewport.width, mapX - viewport.width / 2));
      const newY = Math.max(0, Math.min(1200 - viewport.height, mapY - viewport.height / 2));
      
      onViewportChange({
        ...viewport,
        x: newX,
        y: newY
      });
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

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden rounded-lg">
      {/* Zoom Controls - Hide in viewport mode */}
      {!isViewportMode && (
        <div className="absolute top-4 right-4 z-30 flex flex-col space-y-2">
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
      )}

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 left-4 z-30 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
        Zoom: {Math.round(zoom * 100)}%
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full ${
          isDragging ? 'cursor-grabbing' : 
          isAddingLocation ? 'cursor-crosshair' : 
          isViewportMode ? 'cursor-default' : 'cursor-grab'
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={isViewportMode ? handleViewportDrag : handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMapClick}
        style={{ touchAction: 'none' }} // Prevent passive touch events
      >
        {/* Map Image */}
        <div
          className="absolute select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '2000px',
            height: '1200px',
            zIndex: 1
          }}
        >
          <img
            src="/lovable-uploads/85ee2b76-d8ce-4074-93bb-76db5001d131.png"
            alt="Arunachal Pradesh Map"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        </div>
        
        {/* Map Overlays Container - Higher z-index than map image */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '2000px',
            height: '1200px',
            zIndex: 10
          }}
        >
          {/* Viewport Rectangle Overlay */}
          {isViewportMode && viewport && (
            <div
              className="absolute border-4 border-blue-500 bg-blue-200/30 cursor-move pointer-events-auto"
              style={{
                left: `${viewport.x}px`,
                top: `${viewport.y}px`,
                width: `${viewport.width}px`,
                height: `${viewport.height}px`,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsViewportDragging(true);
              }}
              onMouseUp={() => setIsViewportDragging(false)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                  User View Area
                </span>
              </div>
              {/* Resize handles */}
              <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-blue-600 cursor-se-resize"></div>
            </div>
          )}
          
          {/* Location Markers */}
          {locations.filter(loc => loc.is_active).map((location) => {
            const isSelected = selectedLocation?.id === location.id;
            return (
              <div
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer"
                style={{
                  left: `${location.coordinates_x}px`,
                  top: `${location.coordinates_y}px`,
                  zIndex: 20
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAddingLocation) {
                    onLocationSelect(location);
                  }
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
      {isAddingLocation && (
        <div className="absolute bottom-4 left-4 z-30 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
          📍 Click on the map to place a marker for the new location
        </div>
      )}

      {/* Viewport Mode Instructions */}
      {isViewportMode && (
        <div className="absolute bottom-4 left-4 z-30 bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
          🔧 Drag the blue rectangle to set the default user view area
        </div>
      )}
    </div>
  );
};

export default StaticImageMap;
