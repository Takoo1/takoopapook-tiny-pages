import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "lucide-react";

interface ProfileImagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: {
    display_name?: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export const ProfileImagePopup: React.FC<ProfileImagePopupProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  if (!profile) return null;

  const displayName = profile.display_name || profile.full_name || 'Anonymous User';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md z-[70]">
        <DialogHeader>
          <DialogTitle className="text-center">Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-24 h-24 text-muted-foreground" />
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {displayName}
            </h3>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};