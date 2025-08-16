import { useState } from 'react';
import { Location } from '@/types/database';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DestinationCard from './DestinationCard';

interface OverlayLocationDetailsProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
}

const OverlayLocationDetails = ({ location, isOpen, onClose }: OverlayLocationDetailsProps) => {
  if (!location || !isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl animate-scale-in">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-lg">{location.name}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Map
            </Button>
          </div>
          
          {/* Destination Card */}
          <div className="p-4">
            <DestinationCard location={location} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverlayLocationDetails;