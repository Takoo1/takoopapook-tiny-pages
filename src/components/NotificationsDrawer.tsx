import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, ChevronUp, Image as ImageIcon, Video, FileText, Sparkles } from "lucide-react";
import { format, isWithinInterval, subDays, formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  details: string;
  created_at: string;
  notification_attachments: {
    id: string;
    media_type: "image" | "video" | "pdf";
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
    if (open) fetchNotifications();
  }, [open]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select(`*, notification_attachments (*)`)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (id: string) => {
    navigate(`/notifications/${id}`);
    onOpenChange(false);
    onNotificationRead?.();
  };

  const isNew = (createdAt: string) => {
    const threeDaysAgo = subDays(new Date(), 3);
    return isWithinInterval(new Date(createdAt), { start: threeDaysAgo, end: new Date() });
  };

  const getAttachmentIcon = (type: string) => {
    if (type === "video") return <Video className="w-5 h-5 text-primary" />;
    if (type === "pdf") return <FileText className="w-5 h-5 text-primary" />;
    return <ImageIcon className="w-5 h-5 text-primary" />;
  };

  if (!open) return null;

  const unreadCount = notifications.filter((n) => isNew(n.created_at)).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-safe-top animate-slide-down">
        <div className="mx-2 mt-2 rounded-3xl border border-primary/20 bg-card/95 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.5)]">
          {/* Header */}
          <div className="relative overflow-hidden px-5 py-4 border-b border-border/60">
            <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/25 to-accent/15 border border-primary/25 flex items-center justify-center">
                  <Bell className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">Notifications</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} new · ${notifications.length} total` : `${notifications.length} total`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-h-[62vh] flex flex-col">
            <ScrollArea className="flex-1 px-3">
              {loading ? (
                <div className="p-3 space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-muted/60 animate-pulse" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">You're all caught up</h4>
                  <p className="text-xs text-muted-foreground mt-1">No new notifications right now.</p>
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      navigate("/");
                    }}
                    className="mt-4 rounded-2xl h-10 px-5"
                  >
                    Browse Lotteries
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 py-3">
                  {notifications.map((n) => {
                    const fresh = isNew(n.created_at);
                    const first = n.notification_attachments?.[0];
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id)}
                        className={`relative w-full text-left flex gap-3 p-3 rounded-2xl border transition-all active:scale-[0.98] ${
                          fresh
                            ? "border-primary/30 bg-gradient-to-br from-primary/8 to-primary/3 shadow-[0_4px_16px_-8px_hsl(var(--primary)/0.4)]"
                            : "border-border/60 bg-card/60 hover:bg-muted/40"
                        }`}
                      >
                        {/* Unread dot */}
                        {fresh && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                        )}

                        {/* Thumbnail / Icon */}
                        <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
                          {first?.media_type === "image" && (first.preview_url || first.url) ? (
                            <img
                              src={first.preview_url || first.url}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : first ? (
                            getAttachmentIcon(first.media_type)
                          ) : (
                            <Sparkles className="w-5 h-5 text-primary" />
                          )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm leading-snug line-clamp-1 ${fresh ? "font-semibold" : "font-medium"}`}>
                              {n.title}
                            </h4>
                            {fresh && (
                              <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {n.details}
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 mt-1.5">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })} ·{" "}
                            {format(new Date(n.created_at), "MMM dd")}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <div className="px-3 py-2 border-t border-border/60">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 rounded-2xl h-10"
                onClick={() => onOpenChange(false)}
              >
                <ChevronUp className="w-4 h-4" /> Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-down { from { transform: translateY(-16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-down { animation: slide-down 260ms cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>
    </>
  );
}
