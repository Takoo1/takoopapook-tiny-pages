import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Image, Video, Eye, EyeOff } from "lucide-react";

interface MediaImage {
  id: string;
  name: string;
  public_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface MediaVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export function MediaManager() {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Video form state
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      // Fetch images from storage
      const { data: imageFiles } = await supabase.storage
        .from('media-images')
        .list('', { limit: 100 });

      if (imageFiles) {
        const imageData: MediaImage[] = imageFiles.map((file, index) => ({
          id: file.name,
          name: file.name,
          public_url: supabase.storage.from('media-images').getPublicUrl(file.name).data.publicUrl,
          is_active: true, // Default to active
          display_order: index + 1,
          created_at: file.created_at || new Date().toISOString()
        }));
        setImages(imageData);
      }

      // Fetch videos from database
      const { data: videoData, error: videoError } = await supabase
        .from('media_videos')
        .select('*')
        .order('display_order', { ascending: true });

      if (videoError) throw videoError;
      setVideos(videoData || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: "Error",
        description: "Failed to fetch media files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      fetchMedia();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !videoTitle.trim()) {
      toast({
        title: "Error",
        description: "Please select a video file and enter a title",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Error",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Upload video
      const { error: uploadError } = await supabase.storage
        .from('media-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const videoUrl = supabase.storage.from('media-videos').getPublicUrl(fileName).data.publicUrl;

      // Insert video record
      const { error: dbError } = await supabase
        .from('media_videos')
        .insert({
          title: videoTitle,
          description: videoDescription,
          video_url: videoUrl,
          display_order: videos.length + 1,
          created_by_user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });

      setVideoTitle("");
      setVideoDescription("");
      fetchMedia();
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleVideoVisibility = async (videoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('media_videos')
        .update({ is_active: !currentStatus })
        .eq('id', videoId);

      if (error) throw error;

      setVideos(videos.map(v => 
        v.id === videoId ? { ...v, is_active: !currentStatus } : v
      ));

      toast({
        title: "Success",
        description: `Video ${!currentStatus ? 'shown' : 'hidden'}`,
      });
    } catch (error) {
      console.error('Error updating video:', error);
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      });
    }
  };

  const deleteImage = async (imageName: string) => {
    try {
      const { error } = await supabase.storage
        .from('media-images')
        .remove([imageName]);

      if (error) throw error;

      setImages(images.filter(img => img.name !== imageName));
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const deleteVideo = async (videoId: string, videoUrl: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('media_videos')
        .delete()
        .eq('id', videoId);

      if (dbError) throw dbError;

      // Extract filename from URL and delete from storage
      const fileName = videoUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('media-videos')
          .remove([fileName]);
      }

      setVideos(videos.filter(v => v.id !== videoId));
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading media...</div>;
  }

  return (
    <div className="p-6">
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="mb-4"
              />
              <p className="text-sm text-muted-foreground">
                Images will be displayed in the homepage carousel
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={image.public_url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{image.name}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteImage(image.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Videos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Video title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
              <Textarea
                placeholder="Video description (optional)"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
              />
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={uploading || !videoTitle.trim()}
              />
              <p className="text-sm text-muted-foreground">
                Videos will be displayed in the homepage carousel and mobile video feed
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <video
                    src={video.video_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">{video.title}</h4>
                      {video.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {video.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={video.is_active}
                          onCheckedChange={() => toggleVideoVisibility(video.id, video.is_active)}
                        />
                        <span className="text-sm">
                          {video.is_active ? 'Visible' : 'Hidden'}
                        </span>
                        {video.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteVideo(video.id, video.video_url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}