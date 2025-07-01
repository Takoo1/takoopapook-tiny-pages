
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, MapSettings } from '@/types/database';

interface LeafletMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  isAdminMode?: boolean;
  onMapClick?: (x: number, y: number) => void;
  mapSettings?: MapSettings;
}

const LeafletMap = ({ 
  locations, 
  selectedLocation, 
  onLocationSelect, 
  isAdminMode = false,
  onMapClick,
  mapSettings 
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Map configuration
  const imageWidth = 2000;
  const imageHeight = 1200;
  const minZoom = mapSettings?.min_zoom || -2;
  const maxZoom = mapSettings?.max_zoom || 2;
  const initialZoom = mapSettings?.initial_zoom || 1;

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Initialize map with CRS.Simple for image coordinates
    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: minZoom,
      maxZoom: maxZoom,
      zoomControl: true,
      attributionControl: false,
      zoomSnap: 0.1,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 120,
    });

    // Image bounds
    const bounds = [[0, 0], [imageHeight, imageWidth]] as L.LatLngBoundsExpression;
    
    // Add the image overlay
    const imageOverlay = L.imageOverlay('/lovable-uploads/85ee2b76-d8ce-4074-93bb-76db5001d131.png', bounds, {
      interactive: false,
      className: 'map-image'
    }).addTo(map);

    // Set initial view
    const centerX = mapSettings?.center_x || imageWidth / 2;
    const centerY = mapSettings?.center_y || imageHeight / 2;
    const lat = imageHeight - centerY; // Convert to Leaflet coordinates
    const lng = centerX;
    
    map.setView([lat, lng], initialZoom);
    map.setMaxBounds(bounds.map(bound => [bound[0] - 100, bound[1] - 100]) as L.LatLngBoundsExpression);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    // Add click handler for admin mode
    if (isAdminMode && onMapClick) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        // Convert Leaflet coordinates back to pixel coordinates
        const x = Math.max(0, Math.min(imageWidth, Math.round(lng)));
        const y = Math.max(0, Math.min(imageHeight, Math.round(imageHeight - lat)));
        onMapClick(x, y);
      });
    }

    // Wait for image to load before showing markers
    imageOverlay.on('load', () => {
      setIsMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isAdminMode, onMapClick, minZoom, maxZoom, initialZoom, mapSettings]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers with professional styling
    locations.forEach((location) => {
      // Convert pixel coordinates to Leaflet coordinates
      const lat = imageHeight - location.coordinates_y;
      const lng = location.coordinates_x;

      // Validate coordinates
      if (lng < 0 || lng > imageWidth || lat < 0 || lat > imageHeight) {
        console.warn(`Invalid coordinates for location ${location.name}: (${location.coordinates_x}, ${location.coordinates_y})`);
        return;
      }

      const isSelected = selectedLocation?.id === location.id;
      
      // Create professional marker with better visibility
      const markerHtml = `
        <div class="professional-marker ${isSelected ? 'selected' : ''}" data-location-id="${location.id}">
          <div class="marker-pulse"></div>
          <div class="marker-pin">
            <div class="marker-icon">📍</div>
          </div>
          <div class="marker-shadow"></div>
          ${isSelected ? `<div class="marker-label">${location.name}</div>` : ''}
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-marker-container',
        html: markerHtml,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map);

      // Add click handler
      marker.on('click', (e) => {
        e.originalEvent?.stopPropagation();
        onLocationSelect(location);
      });

      // Add hover effects for better UX
      marker.on('mouseover', function() {
        const markerElement = this.getElement();
        if (markerElement) {
          markerElement.classList.add('hovered');
        }
      });

      marker.on('mouseout', function() {
        const markerElement = this.getElement();
        if (markerElement) {
          markerElement.classList.remove('hovered');
        }
      });

      markersRef.current.push(marker);
    });
  }, [locations, selectedLocation, onLocationSelect, isMapReady]);

  return (
    <>
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden bg-gray-100" />
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-marker-container {
            background: transparent !important;
            border: none !important;
            z-index: 1000 !important;
          }
          
          .professional-marker {
            position: relative;
            width: 30px;
            height: 40px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .professional-marker:hover,
          .professional-marker.hovered {
            transform: scale(1.1);
            z-index: 1001;
          }
          
          .marker-shadow {
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 8px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 50%;
            filter: blur(2px);
          }
          
          .marker-pulse {
            position: absolute;
            top: 5px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.4);
            animation: pulse 2s infinite;
            z-index: 1;
          }
          
          .professional-marker.selected .marker-pulse {
            background: rgba(251, 146, 60, 0.4);
            animation: pulse-selected 1.5s infinite;
          }
          
          .marker-pin {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            height: 40px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            transition: all 0.3s ease;
          }
          
          .professional-marker.selected .marker-pin {
            background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
            transform: translateX(-50%) scale(1.2);
          }
          
          .marker-icon {
            font-size: 16px;
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            margin-top: -2px;
            z-index: 3;
          }
          
          .marker-label {
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            background: #1f2937;
            color: white;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            z-index: 4;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            animation: labelFadeIn 0.3s ease-out;
          }
          
          .marker-label::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 6px solid transparent;
            border-top-color: #1f2937;
          }
          
          .professional-marker:hover .marker-label {
            background: #374151;
          }
          
          @keyframes pulse {
            0% {
              transform: translateX(-50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateX(-50%) scale(2);
              opacity: 0;
            }
          }
          
          @keyframes pulse-selected {
            0% {
              transform: translateX(-50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateX(-50%) scale(2.2);
              opacity: 0;
            }
          }
          
          @keyframes labelFadeIn {
            0% {
              opacity: 0;
              transform: translateX(-50%) translateY(5px);
            }
            100% {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
          
          .leaflet-div-icon {
            background: transparent !important;
            border: none !important;
          }
          
          .leaflet-container {
            background: #f3f4f6 !important;
          }
          
          .map-image {
            filter: brightness(1.02) contrast(1.05);
          }
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .professional-marker {
              width: 25px;
              height: 35px;
            }
            
            .marker-pin {
              width: 25px;
              height: 35px;
            }
            
            .marker-icon {
              font-size: 14px;
            }
            
            .marker-label {
              font-size: 11px;
              padding: 4px 8px;
            }
          }
        `
      }} />
    </>
  );
};

export default LeafletMap;
