
import { Location } from '@/types/database';

interface MapHotspotProps {
  location: Location;
  isSelected: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}

const MapHotspot = ({ location, isSelected, onClick, style }: MapHotspotProps) => {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
      style={style}
      onClick={onClick}
    >
      {/* Pulsing ring animation */}
      <div className={`absolute inset-0 rounded-full animate-ping ${
        isSelected ? 'bg-orange-400' : 'bg-emerald-400'
      } opacity-75`} />
      
      {/* Main hotspot */}
      <div className={`relative w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-300 ${
        isSelected 
          ? 'bg-orange-500 scale-125 shadow-orange-200' 
          : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-110 shadow-emerald-200'
      }`}>
        {/* Inner dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Location name tooltip */}
      <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap transition-all duration-200 ${
        isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        {location.name}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
      </div>
    </div>
  );
};

export default MapHotspot;
