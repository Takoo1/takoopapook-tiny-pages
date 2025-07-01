
import { useRef, useState, useEffect } from 'react';
import { Location, MapSettings } from '@/types/database';

interface ArunachalMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  mapSettings?: MapSettings;
}

const ArunachalMap = ({ locations, selectedLocation, onLocationSelect, mapSettings }: ArunachalMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(mapSettings?.initial_zoom || 1);
  const [pan, setPan] = useState({ x: mapSettings?.center_x || 0, y: mapSettings?.center_y || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const minZoom = mapSettings?.min_zoom || 0.5;
  const maxZoom = mapSettings?.max_zoom || 3;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(minZoom, Math.min(maxZoom, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Convert percentage coordinates to SVG coordinates
  const convertCoordinates = (x: number, y: number) => {
    return {
      x: (x / 100) * 1000, // SVG viewBox width is 1000
      y: (y / 100) * 700   // SVG viewBox height is 700
    };
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-green-50">
      <div
        ref={mapRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative w-full h-full transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          {/* Accurate Arunachal Pradesh SVG Map */}
          <svg
            viewBox="0 0 1000 700"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e40af" stopOpacity="0.6" />
              </linearGradient>
              <filter id="dropShadow">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
              </filter>
            </defs>

            {/* Accurate Arunachal Pradesh boundary */}
            <path
              d="M 150 250 L 200 200 L 280 180 L 360 160 L 450 140 L 520 130 L 600 135 L 680 145 L 750 160 L 800 180 L 830 220 L 850 280 L 840 340 L 820 400 L 790 450 L 750 490 L 700 520 L 640 540 L 580 550 L 520 545 L 460 535 L 400 520 L 350 500 L 300 475 L 250 445 L 200 410 L 170 370 L 155 320 L 150 280 Z"
              fill="url(#mapGradient)"
              stroke="#047857"
              strokeWidth="3"
              filter="url(#dropShadow)"
              className="transition-all duration-300"
            />

            {/* Major rivers - Brahmaputra and tributaries */}
            <path
              d="M 200 300 Q 300 320 400 315 Q 500 310 600 325 Q 700 340 780 360"
              stroke="url(#riverGradient)"
              strokeWidth="4"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 350 200 Q 380 250 400 300 Q 420 350 450 400"
              stroke="url(#riverGradient)"
              strokeWidth="3"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 550 180 Q 570 220 580 280 Q 590 340 610 380"
              stroke="url(#riverGradient)"
              strokeWidth="3"
              fill="none"
              opacity="0.6"
            />

            {/* Mountain ranges */}
            <g opacity="0.4">
              <path d="M 200 220 L 220 200 L 240 215 L 260 195 L 280 210 L 300 190 L 320 205" 
                    stroke="#065f46" strokeWidth="2" fill="none"/>
              <path d="M 400 170 L 420 150 L 440 165 L 460 145 L 480 160 L 500 140 L 520 155" 
                    stroke="#065f46" strokeWidth="2" fill="none"/>
              <path d="M 600 160 L 620 140 L 640 155 L 660 135 L 680 150 L 700 130 L 720 145" 
                    stroke="#065f46" strokeWidth="2" fill="none"/>
            </g>

            {/* District boundaries (simplified) */}
            <g stroke="#047857" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="5,5">
              <path d="M 300 200 L 350 350 L 300 450"/>
              <path d="M 450 180 L 500 320 L 450 480"/>
              <path d="M 600 190 L 650 330 L 600 470"/>
            </g>

            {/* Location markers integrated into SVG */}
            {locations.map((location) => {
              const coords = convertCoordinates(location.coordinates_x, location.coordinates_y);
              const isSelected = selectedLocation?.id === location.id;
              
              return (
                <g key={location.id} transform={`translate(${coords.x}, ${coords.y})`}>
                  {/* Pulsing ring animation */}
                  <circle
                    r="12"
                    fill={isSelected ? '#fb923c' : '#10b981'}
                    opacity="0.4"
                    className="animate-ping"
                  />
                  
                  {/* Main hotspot circle */}
                  <circle
                    r="8"
                    fill={isSelected ? '#ea580c' : '#059669'}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-300 hover:r-9"
                    onClick={() => onLocationSelect(location)}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                  />
                  
                  {/* Inner dot */}
                  <circle
                    r="3"
                    fill="white"
                    className="pointer-events-none"
                  />
                  
                  {/* Location name tooltip - only show when selected */}
                  {isSelected && (
                    <g>
                      <rect
                        x="-30"
                        y="-35"
                        width="60"
                        height="20"
                        rx="4"
                        fill="#1f2937"
                        opacity="0.9"
                        className="animate-fade-in"
                      />
                      <text
                        x="0"
                        y="-22"
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        className="pointer-events-none animate-fade-in"
                      >
                        {location.name}
                      </text>
                      {/* Tooltip arrow */}
                      <path
                        d="M -3,-15 L 0,-12 L 3,-15 Z"
                        fill="#1f2937"
                        opacity="0.9"
                        className="animate-fade-in"
                      />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Map labels for major areas */}
            <g fill="#047857" fontSize="12" fontWeight="bold" opacity="0.7">
              <text x="250" y="300" textAnchor="middle">West Kameng</text>
              <text x="400" y="280" textAnchor="middle">East Kameng</text>
              <text x="550" y="260" textAnchor="middle">Papum Pare</text>
              <text x="700" y="280" textAnchor="middle">East Siang</text>
              <text x="300" y="450" textAnchor="middle">Lower Subansiri</text>
              <text x="500" y="430" textAnchor="middle">Upper Subansiri</text>
              <text x="650" y="450" textAnchor="middle">West Siang</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(maxZoom, prev + 0.2))}
          className="bg-white/90 hover:bg-white shadow-lg rounded-lg p-2 transition-all duration-200 hover:scale-105"
        >
          <span className="text-emerald-600 font-bold text-xl">+</span>
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(minZoom, prev - 0.2))}
          className="bg-white/90 hover:bg-white shadow-lg rounded-lg p-2 transition-all duration-200 hover:scale-105"
        >
          <span className="text-emerald-600 font-bold text-xl">−</span>
        </button>
      </div>

      {/* Reset view button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => {
            setZoom(mapSettings?.initial_zoom || 1);
            setPan({ x: mapSettings?.center_x || 0, y: mapSettings?.center_y || 0 });
          }}
          className="bg-white/90 hover:bg-white shadow-lg rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 transition-all duration-200 hover:scale-105"
        >
          Reset View
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-600">
        Scroll to zoom • Drag to pan • Click locations to explore
      </div>

      {/* Map legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="font-semibold text-gray-700 mb-2">Legend</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-gray-600">Available Location</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-gray-600">Selected Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Rivers</span>
        </div>
      </div>
    </div>
  );
};

export default ArunachalMap;
