import { Heart, HeartHandshake } from 'lucide-react';
import { useAddToPlanned, useRemoveFromPlanned, useIsLocationPlanned, useAddPackageToPlanned, useRemovePackageFromPlanned, useIsPackagePlanned } from '@/hooks/usePlannedLocations';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
interface PlanButtonProps {
  itemId: string;
  itemType: 'location' | 'package';
  itemName?: string;
  variant?: 'default' | 'compact';
  className?: string;
  labelMode?: 'tour' | 'liked';
}

// Helper function to check if itemId is a valid UUID
const isValidUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};
const PlanButton = ({
  itemId,
  itemType,
  itemName,
  variant = 'default',
  className,
  labelMode = 'tour'
}: PlanButtonProps) => {
  // Don't render plan button for non-UUID IDs
  if (!isValidUUID(itemId)) {
    return null;
  }
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationPlannedQuery = useIsLocationPlanned(itemId);
  const packagePlannedQuery = useIsPackagePlanned(itemId);
  const addLocationToPlanned = useAddToPlanned();
  const removeLocationFromPlanned = useRemoveFromPlanned();
  const addPackageToPlanned = useAddPackageToPlanned();
  const removePackageFromPlanned = useRemovePackageFromPlanned();
  const isPlanned = itemType === 'location' ? locationPlannedQuery.data : packagePlannedQuery.data;
  const isLoading = itemType === 'location' ? locationPlannedQuery.isLoading : packagePlannedQuery.isLoading;
  const addLabel = labelMode === 'liked' ? `Add to Liked ${itemType === 'package' ? 'Package' : 'Destination'}` : 'Add to My Tour';
  const removeLabel = labelMode === 'liked' ? 'Remove from Liked' : 'Remove from Tour';
  const handleClick = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Require authentication to like/plan
    if (!user) {
      navigate('/auth', {
        state: {
          returnUrl: `${location.pathname}${location.search}`
        }
      });
      return;
    }
    if (itemType === 'location') {
      if (isPlanned) {
        removeLocationFromPlanned.mutate(itemId);
      } else {
        addLocationToPlanned.mutate({
          locationId: itemId
        });
      }
    } else {
      if (isPlanned) {
        removePackageFromPlanned.mutate(itemId);
      } else {
        addPackageToPlanned.mutate({
          packageId: itemId
        });
      }
    }
  };
  const isProcessing = addLocationToPlanned.isPending || removeLocationFromPlanned.isPending || addPackageToPlanned.isPending || removePackageFromPlanned.isPending || isLoading;
  if (variant === 'compact') {
    return <button onClick={handleClick} disabled={isProcessing} className={cn("p-2 rounded-full transition-all duration-200 hover:scale-110", isPlanned ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30", isProcessing && "opacity-50 cursor-not-allowed", className)} title={`${isPlanned ? removeLabel : addLabel}${itemName ? `: ${itemName}` : ''}`}>
        {isPlanned ? <HeartHandshake className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
      </button>;
  }
  return <button onClick={handleClick} disabled={isProcessing} className={cn("flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200", isPlanned ? "bg-red-500 text-white hover:bg-red-600" : "bg-emerald-500 text-white hover:bg-emerald-600", isProcessing && "opacity-50 cursor-not-allowed", className)}>
      {isPlanned ? <>
          <HeartHandshake className="h-4 w-4" />
          <span>{removeLabel}</span>
        </> : <>
          <Heart className="w-4/5 w-4" />
          <span className="text-xs">{addLabel}</span>
        </>}
    </button>;
};
export default PlanButton;