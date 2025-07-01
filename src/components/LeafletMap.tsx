
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/types/database';

interface LeafletMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  isAdminMode?: boolean;
  onMapClick?: (x: number, y: number) => void;
}

const LeafletMap = ({ 
  locations, 
  selectedLocation, 
  onLocationSelect, 
  isAdminMode = false,
  onMapClick 
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Image dimensions - adjust these to match your actual image size
  const imageWidth = 2000;
  const imageHeight = 1200;

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map with CRS.Simple
    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 2,
      zoomControl: true,
      attributionControl: false,
    });

    // Image bounds
    const bounds = [[0, 0], [imageHeight, imageWidth]] as L.LatLngBoundsExpression;
    
    // Add the image overlay
    L.imageOverlay('/lovable-uploads/85ee2b76-d8ce-4074-93bb-76db5001d131.png', bounds).addTo(map);
    
    // Set map view
    map.fitBounds(bounds);
    map.setMaxBounds(bounds);

    mapInstanceRef.current = map;

    // Add click handler for admin mode
    if (isAdminMode && onMapClick) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        // Convert Leaflet coordinates back to pixel coordinates
        const x = Math.round(lng);
        const y = Math.round(imageHeight - lat); // Flip Y coordinate
        onMapClick(x, y);
      });
    }

    return () => {
      map.remove();
    };
  }, [isAdminMode, onMapClick, imageHeight, imageWidth]);

  // Update markers when locations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      // Convert pixel coordinates to Leaflet coordinates
      const lat = imageHeight - location.coordinates_y; // Flip Y coordinate
      const lng = location.coordinates_x;

      // Create custom icon
      const isSelected = selectedLocation?.id === location.id;
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-container ${isSelected ? 'selected' : ''}">
            <div class="marker-pulse"></div>
            <div class="marker-dot"></div>
            ${isSelected ? `<div class="marker-tooltip">${location.name}</div>` : ''}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .on('click', () => onLocationSelect(location));

      markersRef.current.push(marker);
    });
  }, [locations, selectedLocation, onLocationSelect, imageHeight]);

  return (
    <>
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-marker {
            background: transparent !important;
            border: none !important;
          }
          
          .marker-container {
            position: relative;
            width: 24px;
            height: 24px;
          }
          
          .marker-pulse {
            position: absolute;
            top: 0;
            left: 0;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.4);
            animation: pulse 2s infinite;
          }
          
          .marker-container.selected .marker-pulse {
            background: rgba(251, 146, 60, 0.4);
          }
          
          .marker-dot {
            position: absolute;
            top: 4px;
            left: 4px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #10b981;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .marker-container.selected .marker-dot {
            background: #ea580c;
            transform: scale(1.2);
          }
          
          .marker-tooltip {
            position: absolute;
            top: -35px;
            left: 50%;
            transform: translateX(-50%);
            background: #1f2937;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            white-space: nowrap;
            z-index: 1000;
          }
          
          .marker-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: #1f2937;
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
        `
      }} />
    </>
  );
};

export default LeafletMap;
