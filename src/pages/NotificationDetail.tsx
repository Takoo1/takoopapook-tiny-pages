import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Clock } from "lucide-react";
import { format, isWithinInterval, subDays } from "date-fns";

interface NotificationDetail {
  id: string;
  title: string;
  details: string;
  created_at: string;
  updated_at: string;
  notification_attachments: {
    id: string;
    media_type: 'image' | 'video' | 'pdf';
    url: string;
    preview_url: string | null;
    display_order: number;
  }[];
}

export default function NotificationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<NotificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchNotification(id);
    }
  }, [id]);

  const fetchNotification = async (notificationId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          notification_attachments (*)
        `)
        .eq('id', notificationId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Notification not found or no longer available');
        } else {
          throw error;
        }
        return;
      }

      // Sort attachments by display_order
      if (data.notification_attachments) {
        data.notification_attachments.sort((a, b) => a.display_order - b.display_order);
      }

      setNotification(data);
    } catch (error) {
      console.error('Error fetching notification:', error);
      setError('Failed to load notification');
    } finally {
      setLoading(false);
    }
  };

  const isNewNotification = (createdAt: string) => {
    const threeDaysAgo = subDays(new Date(), 3);
    const notificationDate = new Date(createdAt);
    return isWithinInterval(notificationDate, { start: threeDaysAgo, end: new Date() });
  };

  const handleDownload = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notification...</p>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || 'Notification Not Found'}
          </h1>
          <p className="text-muted-foreground mb-6">
            The notification you're looking for might have been removed or doesn't exist.
          </p>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
      {/* Main Content Card */}
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg md:text-xl mb-2 leading-tight">
                {notification.title}
              </CardTitle>
              <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  {format(new Date(notification.created_at), 'MMMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  {format(new Date(notification.created_at), 'HH:mm')}
                </div>
              </div>
            </div>
            {isNewNotification(notification.created_at) && (
              <Badge className="bg-red-500 hover:bg-red-500 text-white shrink-0 text-xs">
                New
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 md:space-y-6">
          {/* Media Section */}
          {notification.notification_attachments.length > 0 && (
            <>
              <div>
                <h3 className="text-sm md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
                  Media & Attachments
                  <Badge variant="secondary" className="text-xs">
                    {notification.notification_attachments.length}
                  </Badge>
                </h3>
                
                <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                  {notification.notification_attachments.map((attachment, index) => (
                    <div
                      key={attachment.id}
                      className="border border-border rounded-lg overflow-hidden bg-background/50"
                    >
                      {/* Media Display */}
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        {attachment.media_type === 'image' ? (
                          <img
                            src={attachment.url}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : attachment.media_type === 'video' ? (
                          <video
                            src={attachment.url}
                            controls
                            className="w-full h-full"
                            preload="metadata"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <FileText className="w-12 h-12 md:w-16 md:h-16" />
                            <span className="text-xs md:text-sm font-medium">PDF Document</span>
                          </div>
                        )}
                      </div>

                      {/* Download Button */}
                      <div className="p-2 md:p-3 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(
                            attachment.url,
                            `attachment-${index + 1}.${attachment.media_type === 'pdf' ? 'pdf' : attachment.media_type}`
                          )}
                          className="w-full flex items-center justify-center gap-1 text-xs md:text-sm h-7 md:h-8"
                        >
                          <Download className="w-3 h-3 md:w-4 md:h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Content Section */}
          <div>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-xs md:text-sm"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {notification.details}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}