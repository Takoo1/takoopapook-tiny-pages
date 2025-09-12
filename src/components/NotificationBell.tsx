import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsDrawer } from "./NotificationsDrawer";

export function NotificationBell() {
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    checkNewNotifications();
    
    // Check for new notifications every 30 seconds
    const interval = setInterval(checkNewNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkNewNotifications = async () => {
    try {
      // Check for notifications created in the last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('is_active', true)
        .gte('created_at', threeDaysAgo.toISOString())
        .limit(1);

      if (error) throw error;

      setHasNewNotifications((data || []).length > 0);
    } catch (error) {
      console.error('Error checking new notifications:', error);
    }
  };

  const handleBellClick = () => {
    setDrawerOpen(true);
    // Reset new notification indicator when drawer is opened
    if (hasNewNotifications) {
      setHasNewNotifications(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm"
        className="relative p-2 h-9 w-9 flex items-center justify-center"
        onClick={handleBellClick}
      >
        <Bell 
          className={`h-5 w-5 text-blue-900 dark:text-blue-400 transition-transform ${
            hasNewNotifications ? 'animate-pulse' : ''
          }`}
          style={{
            animation: hasNewNotifications 
              ? 'bellShake 2s infinite' 
              : undefined
          }}
        />
        {hasNewNotifications && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-8 text-xs bg-red-500 hover:bg-red-500 text-white px-1 py-0 flex items-center justify-center"
          >
            New
          </Badge>
        )}
      </Button>

      <NotificationsDrawer 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen}
        onNotificationRead={checkNewNotifications}
      />

      <style>
        {`
        @keyframes bellShake {
          0%, 50%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-10deg); }
          20%, 40% { transform: rotate(10deg); }
        }
        `}
      </style>
    </>
  );
}