import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, Image, Video, FileText, Clock } from "lucide-react";
import { format, isWithinInterval, subDays } from "date-fns";

interface Notification {
  id: string;
  title: string;
  details: string;
  created_at: string;
  notification_attachments: {
    id: string;
    media_type: 'image' | 'video' | 'pdf';
    url: string;
    preview_url: string | null;
  }[];
}

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificationRead?: () => void;
}

export function NotificationsDrawer({ open, onOpenChange, onNotificationRead }: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          notification_attachments (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    navigate(`/notifications/${notificationId}`);
    onOpenChange(false);
    onNotificationRead?.();
  };

  const isNewNotification = (createdAt: string) => {
    const threeDaysAgo = subDays(new Date(), 3);
    const notificationDate = new Date(createdAt);
    return isWithinInterval(notificationDate, { start: threeDaysAgo, end: new Date() });
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4 text-blue-500" />;
      case 'video': return <Video className="w-4 h-4 text-purple-500" />;
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-lg animate-in slide-in-from-top-0 duration-300">
        <div className="max-h-[60vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <Badge variant="secondary" className="text-xs">
                {notifications.length} total
              </Badge>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 px-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {notification.title}
                          </h4>
                          {isNewNotification(notification.created_at) && (
                            <Badge className="text-xs bg-red-500 hover:bg-red-500 text-white">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {truncateText(notification.details, 120)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {notification.notification_attachments.map((attachment, i) => (
                              <div key={attachment.id} className="flex items-center">
                                {getMediaIcon(attachment.media_type)}
                                {i < notification.notification_attachments.length - 1 && (
                                  <span className="mx-1 text-muted-foreground">•</span>
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      </div>

                      {/* Preview */}
                      {notification.notification_attachments.length > 0 && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          {notification.notification_attachments[0].media_type === 'image' ? (
                            <img
                              src={notification.notification_attachments[0].preview_url || notification.notification_attachments[0].url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : notification.notification_attachments[0].media_type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-6 h-6 text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {index < notifications.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => onOpenChange(false)}
            >
              <ChevronUp className="w-4 h-4" />
              Collapse
            </Button>
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes slide-in-from-top-0 {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .slide-in-from-top-0 {
          animation-name: slide-in-from-top-0;
        }
        .duration-300 {
          animation-duration: 300ms;
        }
        `}
      </style>
    </>
  );
}