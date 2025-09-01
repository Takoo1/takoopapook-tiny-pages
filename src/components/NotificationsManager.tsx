import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Trash2, Edit2, Upload, X, FileText, Image, Video } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  details: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationAttachment {
  id: string;
  notification_id: string;
  media_type: 'image' | 'video' | 'pdf';
  url: string;
  preview_url: string | null;
  display_order: number;
}

export function NotificationsManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    is_active: true
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentType, setAttachmentType] = useState<'image' | 'video' | 'pdf'>('image');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          notification_attachments (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (notificationId: string) => {
    const uploadedAttachments = [];

    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${notificationId}/${Date.now()}-${i}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notifications')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('notifications')
        .getPublicUrl(fileName);

      // Create attachment record
      const { error: attachmentError } = await supabase
        .from('notification_attachments')
        .insert({
          notification_id: notificationId,
          media_type: attachmentType,
          url: publicUrl,
          display_order: i + 1
        });

      if (attachmentError) throw attachmentError;
      uploadedAttachments.push(publicUrl);
    }

    return uploadedAttachments;
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);

      if (editingNotification) {
        // Update existing notification
        const { error } = await supabase
          .from('notifications')
          .update({
            title: formData.title,
            details: formData.details,
            is_active: formData.is_active
          })
          .eq('id', editingNotification.id);

        if (error) throw error;

        // Upload new attachments if any
        if (attachments.length > 0) {
          await uploadAttachments(editingNotification.id);
        }
      } else {
        // Create new notification
        const { data: notification, error } = await supabase
          .from('notifications')
          .insert({
            title: formData.title,
            details: formData.details,
            is_active: formData.is_active
          })
          .select()
          .single();

        if (error) throw error;

        // Upload attachments if any
        if (attachments.length > 0) {
          await uploadAttachments(notification.id);
        }
      }

      toast({
        title: "Success",
        description: `Notification ${editingNotification ? 'updated' : 'created'} successfully`,
      });

      // Reset form
      setFormData({ title: '', details: '', is_active: true });
      setAttachments([]);
      setCreateDialogOpen(false);
      setEditingNotification(null);
      fetchNotifications();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingNotification ? 'update' : 'create'} notification`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      details: notification.details,
      is_active: notification.is_active
    });
    setCreateDialogOpen(true);
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });

      fetchNotifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (notificationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_active: !currentStatus })
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Notification ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      fetchNotifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification status",
        variant: "destructive",
      });
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notifications Manager</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingNotification(null);
              setFormData({ title: '', details: '', is_active: true });
              setAttachments([]);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNotification ? 'Edit Notification' : 'Create New Notification'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>

              <div>
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Notification details"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div>
                <Label>Media Attachments (Optional)</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Select value={attachmentType} onValueChange={(value: 'image' | 'video' | 'pdf') => setAttachmentType(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept={
                        attachmentType === 'image' ? 'image/*' :
                        attachmentType === 'video' ? 'video/*' : 
                        '.pdf'
                      }
                      multiple
                    />
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files:</Label>
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <div className="flex items-center gap-2">
                            {getMediaIcon(attachmentType)}
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setEditingNotification(null);
                    setAttachments([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={uploading || !formData.title || !formData.details}
                >
                  {uploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      {editingNotification ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingNotification ? 'Update' : 'Create'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{notification.details}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={notification.is_active}
                          onCheckedChange={() => handleToggleActive(notification.id, notification.is_active)}
                        />
                        <span className="text-sm">
                          {notification.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(notification.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(notification)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this notification? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(notification.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}