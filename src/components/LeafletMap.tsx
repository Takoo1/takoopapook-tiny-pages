
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

  // Map configuration - these match the actual image dimensions
  const imageWidth = 2000;
  const imageHeight = 1200;
  const minZoom = mapSettings?.min_zoom || -2;
  const maxZoom = mapSettings?.max_zoom || 2;
  const initialZoom = mapSettings?.initial_zoom || 0;

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

    // Image bounds - using [y, x] format for Leaflet
    const bounds: L.LatLngBoundsExpression = [[0, 0], [imageHeight, imageWidth]];
    
    // Add the image overlay as the base map
    const imageOverlay = L.imageOverlay('/lovable-uploads/85ee2b76-d8ce-4074-93bb-76db5001d131.png', bounds, {
      interactive: false,
      className: 'map-base-image'
    }).addTo(map);

    // Set initial view - convert center coordinates
    const centerX = mapSettings?.center_x || imageWidth / 2;
    const centerY = mapSettings?.center_y || imageHeight / 2;
    // In Leaflet's coordinate system for images, we use [y, x]
    const lat = imageHeight - centerY; // Flip Y coordinate
    const lng = centerX;
    
    map.setView([lat, lng], initialZoom);
    
    // Set max bounds to prevent panning outside the image
    const paddedBounds: L.LatLngBoundsExpression = [
      [-100, -100], 
      [imageHeight + 100, imageWidth + 100]
    ];
    map.setMaxBounds(paddedBounds);

    mapInstanceRef.current = map;

    // Add click handler for admin mode
    if (isAdminMode && onMapClick) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        // Convert Leaflet coordinates back to image pixel coordinates
        const x = Math.max(0, Math.min(imageWidth, Math.round(lng)));
        const y = Math.max(0, Math.min(imageHeight, Math.round(imageHeight - lat)));
        onMapClick(x, y);
      });
    }

    // Wait for image to load
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

    // Add markers for each location
    locations.forEach((location) => {
      // Convert pixel coordinates to Leaflet coordinates
      const lat = imageHeight - location.coordinates_y; // Flip Y coordinate
      const lng = location.coordinates_x;

      // Validate coordinates are within bounds
      if (lng < 0 || lng > imageWidth || lat < 0 || lat > imageHeight) {
        console.warn(`Invalid coordinates for location ${location.name}: (${location.coordinates_x}, ${location.coordinates_y})`);
        return;
      }

      const isSelected = selectedLocation?.id === location.id;
      
      // Create professional marker
      const markerHtml = `
        <div class="location-marker ${isSelected ? 'selected' : ''}" data-location-id="${location.id}">
          <div class="marker-pulse"></div>
          <div class="marker-pin">
            <div class="marker-icon">📍</div>
          </div>
          <div class="marker-shadow"></div>
          ${isSelected ? `<div class="marker-label">${location.name}</div>` : ''}
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-marker-wrapper',
        html: markerHtml,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // Add click handler
      marker.on('click', (e) => {
        e.originalEvent?.stopPropagation();
        onLocationSelect(location);
      });

      // Add hover effects
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
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden bg-gray-200" />
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-marker-wrapper {
            background: transparent !important;
            border: none !important;
            z-index: 1000 !important;
          }
          
          .location-marker {
            position: relative;
            width: 32px;
            height: 42px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .location-marker:hover,
          .location-marker.hovered {
            transform: scale(1.15);
            z-index: 1001;
          }
          
          .marker-shadow {
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 24px;
            height: 8px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            filter: blur(3px);
          }
          
          .marker-pulse {
            position: absolute;
            top: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.4);
            animation: pulse 2s infinite;
            z-index: 1;
          }
          
          .location-marker.selected .marker-pulse {
            background: rgba(251, 146, 60, 0.6);
            animation: pulse-selected 1.5s infinite;
          }
          
          .marker-pin {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 32px;
            height: 42px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            transition: all 0.3s ease;
            transform: translateX(-50%) rotate(45deg);
          }
          
          .location-marker.selected .marker-pin {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            transform: translateX(-50%) rotate(45deg) scale(1.1);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
          }
          
          .marker-icon {
            font-size: 18px;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
            z-index: 3;
            transform: rotate(-45deg);
          }
          
          .marker-label {
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: #1f2937;
            color: white;
            padding: 8px 14px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
            z-index: 4;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
            animation: labelFadeIn 0.4s ease-out;
          }
          
          .marker-label::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 8px solid transparent;
            border-top-color: #1f2937;
          }
          
          @keyframes pulse {
            0% {
              transform: translateX(-50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateX(-50%) scale(2.2);
              opacity: 0;
            }
          }
          
          @keyframes pulse-selected {
            0% {
              transform: translateX(-50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateX(-50%) scale(2.5);
              opacity: 0;
            }
          }
          
          @keyframes labelFadeIn {
            0% {
              opacity: 0;
              transform: translateX(-50%) translateY(8px);
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
            background: #f8fafc !important;
          }
          
          .map-base-image {
            filter: brightness(1.02) contrast(1.08) saturate(1.05);
          }
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .location-marker {
              width: 28px;
              height: 36px;
            }
            
            .marker-pin {
              width: 28px;
              height: 36px;
            }
            
            .marker-icon {
              font-size: 16px;
            }
            
            .marker-label {
              font-size: 12px;
              padding: 6px 10px;
            }
          }
        `
      }} />
    </>
  );
};

export default LeafletMap;
