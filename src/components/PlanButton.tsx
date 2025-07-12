import { Heart, HeartHandshake } from 'lucide-react';
import { useAddToPlanned, useRemoveFromPlanned, useIsLocationPlanned } from '@/hooks/usePlannedLocations';
import { cn } from '@/lib/utils';

interface PlanButtonProps {
  locationId: string;
  locationName?: string;
  variant?: 'default' | 'compact';
  className?: string;
}

// Helper function to check if locationId is a valid UUID
const isValidUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const PlanButton = ({ locationId, locationName, variant = 'default', className }: PlanButtonProps) => {
  // Don't render plan button for non-UUID location IDs (like package IDs)
  if (!isValidUUID(locationId)) {
    return null;
  }
  const { data: isPlanned, isLoading } = useIsLocationPlanned(locationId);
  const addToPlanned = useAddToPlanned();
  const removeFromPlanned = useRemoveFromPlanned();

  const handleClick = () => {
    if (isPlanned) {
      removeFromPlanned.mutate(locationId);
    } else {
      addToPlanned.mutate({ locationId });
    }
  };

  const isProcessing = addToPlanned.isPending || removeFromPlanned.isPending || isLoading;

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={cn(
          "p-2 rounded-full transition-all duration-200 hover:scale-110",
          isPlanned 
            ? "bg-red-500 text-white hover:bg-red-600" 
            : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30",
          isProcessing && "opacity-50 cursor-not-allowed",
          className
        )}
        title={isPlanned ? `Remove ${locationName || 'location'} from My Tour` : `Add ${locationName || 'location'} to My Tour`}
      >
        {isPlanned ? (
          <HeartHandshake className="h-4 w-4" />
        ) : (
          <Heart className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
        isPlanned
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-emerald-500 text-white hover:bg-emerald-600",
        isProcessing && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isPlanned ? (
        <>
          <HeartHandshake className="h-4 w-4" />
          <span>Remove from Tour</span>
        </>
      ) : (
        <>
          <Heart className="h-4 w-4" />
          <span>Add to My Tour</span>
        </>
      )}
    </button>
  );
};

export default PlanButton;