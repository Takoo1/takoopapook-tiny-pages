import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp, ArrowDown, Upload, Trash2, Image, Video, Eye, EyeOff, Home, Film, PlayCircle } from "lucide-react";

interface MediaImage {
  id: string;
  name: string;
  public_url: string;
  is_active: boolean;
  section_type: 'hero' | 'carousel' | 'general';
  display_order: number;
  created_at: string;
  link_url?: string;
}

interface MediaVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  preview_image_url?: string;
  is_active: boolean;
  is_hero_section: boolean;
  display_order: number;
  created_at: string;
  category: 'from_fortune_bridge' | 'about_games';
  game_tags: string[];
  link_url?: string;
}

export function MediaManager() {
  const [heroImages, setHeroImages] = useState<MediaImage[]>([]);
  const [carouselImages, setCarouselImages] = useState<MediaImage[]>([]);
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Hero media form state
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
  const [heroThumbnailFile, setHeroThumbnailFile] = useState<File | null>(null);
  const [heroVideoTitle, setHeroVideoTitle] = useState("");
  const [heroLinkUrl, setHeroLinkUrl] = useState("");

  // Carousel images form state
  const [carouselImageFile, setCarouselImageFile] = useState<File | null>(null);
  const [carouselLinkUrl, setCarouselLinkUrl] = useState("");

  // Video page form state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewFile, setVideoPreviewFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoCategory, setVideoCategory] = useState<'from_fortune_bridge' | 'about_games'>('from_fortune_bridge');
  const [gameTagsInput, setGameTagsInput] = useState("");

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      // Fetch hero images
      const { data: heroImagesData, error: heroError } = await supabase
        .from('media_images')
        .select('*')
        .eq('section_type', 'hero')
        .order('display_order', { ascending: true });

      if (heroError) throw heroError;
      setHeroImages(heroImagesData || []);

      // Fetch carousel images
      const { data: carouselImagesData, error: carouselError } = await supabase
        .from('media_images')
        .select('*')
        .eq('section_type', 'carousel')
        .order('display_order', { ascending: true });

      if (carouselError) throw carouselError;
      setCarouselImages(carouselImagesData || []);

      // Fetch videos
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

  const handleHeroImageUpload = async () => {
    if (!heroImageFile) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = heroImageFile.name.split('.').pop();
      const fileName = `hero_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media-images')
        .upload(fileName, heroImageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media-images')
        .getPublicUrl(fileName);

      const nextOrder = Math.max(...heroImages.map(img => img.display_order), 0) + 1;
      const { error: dbError } = await supabase
        .from('media_images')
        .insert({
          name: fileName,
          public_url: publicUrl,
          display_order: nextOrder,
          is_active: true,
          section_type: 'hero',
          link_url: heroLinkUrl || null
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Hero image uploaded successfully",
      });

      setHeroImageFile(null);
      setHeroLinkUrl("");
      fetchMedia();
    } catch (error) {
      console.error('Error uploading hero image:', error);
      toast({
        title: "Error",
        description: "Failed to upload hero image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCarouselImageUpload = async () => {
    if (!carouselImageFile) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = carouselImageFile.name.split('.').pop();
      const fileName = `carousel_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media-images')
        .upload(fileName, carouselImageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media-images')
        .getPublicUrl(fileName);

      const nextOrder = Math.max(...carouselImages.map(img => img.display_order), 0) + 1;
      const { error: dbError } = await supabase
        .from('media_images')
        .insert({
          name: fileName,
          public_url: publicUrl,
          display_order: nextOrder,
          is_active: true,
          section_type: 'carousel',
          link_url: carouselLinkUrl || null
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Carousel image uploaded successfully",
      });

      setCarouselImageFile(null);
      setCarouselLinkUrl("");
      fetchMedia();
    } catch (error) {
      console.error('Error uploading carousel image:', error);
      toast({
        title: "Error",
        description: "Failed to upload carousel image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile || !videoPreviewFile || !videoTitle.trim()) {
      toast({
        title: "Error",
        description: "Please select video, preview image files, and enter a title",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      
      // Upload video
      const videoExt = videoFile.name.split('.').pop();
      const videoFileName = `video_${timestamp}.${videoExt}`;
      
      const { error: videoUploadError } = await supabase.storage
        .from('media-videos')
        .upload(videoFileName, videoFile);

      if (videoUploadError) throw videoUploadError;

      // Upload preview image (used as both thumbnail and preview)
      const previewExt = videoPreviewFile.name.split('.').pop();
      const previewFileName = `preview_${timestamp}.${previewExt}`;
      
      const { error: previewUploadError } = await supabase.storage
        .from('media-videos')
        .upload(previewFileName, videoPreviewFile);

      if (previewUploadError) throw previewUploadError;

      const videoUrl = supabase.storage.from('media-videos').getPublicUrl(videoFileName).data.publicUrl;
      const previewUrl = supabase.storage.from('media-videos').getPublicUrl(previewFileName).data.publicUrl;

      // Parse game tags
      const gameTags = gameTagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { error: dbError } = await supabase
        .from('media_videos')
        .insert({
          title: videoTitle,
          description: videoDescription,
          video_url: videoUrl,
          thumbnail_url: previewUrl,
          preview_image_url: previewUrl,
          display_order: videos.length + 1,
          is_hero_section: false,
          category: videoCategory,
          game_tags: gameTags,
          created_by_user_id: (await supabase.auth.getSession()).data.session?.user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });

      // Reset form
      setVideoFile(null);
      setVideoPreviewFile(null);
      setVideoTitle("");
      setVideoDescription("");
      setVideoCategory('from_fortune_bridge');
      setGameTagsInput("");
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

  const toggleImageVisibility = async (imageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('media_images')
        .update({ is_active: !currentStatus })
        .eq('id', imageId);

      if (error) throw error;
      
      fetchMedia();
      toast({
        title: "Success",
        description: `Image ${!currentStatus ? 'shown' : 'hidden'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      });
    }
  };

  const toggleVideoVisibility = async (videoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('media_videos')
        .update({ is_active: !currentStatus })
        .eq('id', videoId);

      if (error) throw error;
      
      fetchMedia();
      toast({
        title: "Success",
        description: `Video ${!currentStatus ? 'shown' : 'hidden'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      });
    }
  };

  const moveImage = async (imageId: string, direction: 'up' | 'down', images: MediaImage[], setImages: (images: MediaImage[]) => void) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    const targetOrder = direction === 'up' ? image.display_order - 1 : image.display_order + 1;
    const swapImage = images.find(img => img.display_order === targetOrder);

    if (!swapImage) return;

    try {
      await Promise.all([
        supabase
          .from('media_images')
          .update({ display_order: targetOrder })
          .eq('id', imageId),
        supabase
          .from('media_images')
          .update({ display_order: image.display_order })
          .eq('id', swapImage.id)
      ]);

      fetchMedia();
      toast({
        title: "Success",
        description: "Image order updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update image order",
        variant: "destructive",
      });
    }
  };

  const moveVideo = async (videoId: string, direction: 'up' | 'down') => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    const targetOrder = direction === 'up' ? video.display_order - 1 : video.display_order + 1;
    const swapVideo = videos.find(v => v.display_order === targetOrder);

    if (!swapVideo) return;

    try {
      await Promise.all([
        supabase
          .from('media_videos')
          .update({ display_order: targetOrder })
          .eq('id', videoId),
        supabase
          .from('media_videos')
          .update({ display_order: video.display_order })
          .eq('id', swapVideo.id)
      ]);

      fetchMedia();
      toast({
        title: "Success",
        description: "Video order updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update video order",
        variant: "destructive",
      });
    }
  };

  const deleteImage = async (imageId: string, imageName: string) => {
    try {
      const { error: dbError } = await supabase
        .from('media_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      const { error: storageError } = await supabase.storage
        .from('media-images')
        .remove([imageName]);

      if (storageError) console.warn('Storage deletion failed:', storageError);

      fetchMedia();
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      // Get video details first
      const { data: video } = await supabase
        .from('media_videos')
        .select('video_url, thumbnail_url, preview_image_url')
        .eq('id', videoId)
        .single();

      const { error: dbError } = await supabase
        .from('media_videos')
        .delete()
        .eq('id', videoId);

      if (dbError) throw dbError;

      // Extract filenames from URLs and delete from storage
      if (video) {
        const filesToDelete = [];
        if (video.video_url) {
          const videoFileName = video.video_url.split('/').pop();
          if (videoFileName) filesToDelete.push(videoFileName);
        }
        if (video.thumbnail_url) {
          const thumbnailFileName = video.thumbnail_url.split('/').pop();
          if (thumbnailFileName) filesToDelete.push(thumbnailFileName);
        }
        if (video.preview_image_url) {
          const previewFileName = video.preview_image_url.split('/').pop();
          if (previewFileName) filesToDelete.push(previewFileName);
        }

        if (filesToDelete.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('media-videos')
            .remove(filesToDelete);

          if (storageError) console.warn('Storage deletion failed:', storageError);
        }
      }

      fetchMedia();
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="carousel" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Image Carousel
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Page
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Hero Section Media Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Upload Hero Image</h3>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
                  />
                  <Input
                    placeholder="Click URL (optional)"
                    value={heroLinkUrl}
                    onChange={(e) => setHeroLinkUrl(e.target.value)}
                  />
                  <Button onClick={handleHeroImageUpload} disabled={uploading || !heroImageFile}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Hero Image
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Upload Hero Video</h3>
                  <Input
                    placeholder="Video Title"
                    value={heroVideoTitle}
                    onChange={(e) => setHeroVideoTitle(e.target.value)}
                  />
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setHeroVideoFile(e.target.files?.[0] || null)}
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    placeholder="Thumbnail"
                    onChange={(e) => setHeroThumbnailFile(e.target.files?.[0] || null)}
                  />
                  <Input
                    placeholder="Click URL (optional)"
                    value={heroLinkUrl}
                    onChange={(e) => setHeroLinkUrl(e.target.value)}
                  />
                  <Button 
                    onClick={async () => {
                      if (!heroVideoFile || !heroThumbnailFile || !heroVideoTitle.trim()) {
                        toast({
                          title: "Error",
                          description: "Please fill all required fields",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      setUploading(true);
                      try {
                        const timestamp = Date.now();
                        
                        // Upload video and thumbnail
                        const videoExt = heroVideoFile.name.split('.').pop();
                        const videoFileName = `hero_video_${timestamp}.${videoExt}`;
                        const thumbnailExt = heroThumbnailFile.name.split('.').pop();
                        const thumbnailFileName = `hero_thumbnail_${timestamp}.${thumbnailExt}`;

                        await Promise.all([
                          supabase.storage.from('media-videos').upload(videoFileName, heroVideoFile),
                          supabase.storage.from('media-videos').upload(thumbnailFileName, heroThumbnailFile)
                        ]);

                        const videoUrl = supabase.storage.from('media-videos').getPublicUrl(videoFileName).data.publicUrl;
                        const thumbnailUrl = supabase.storage.from('media-videos').getPublicUrl(thumbnailFileName).data.publicUrl;

                        const { error } = await supabase
                          .from('media_videos')
                          .insert({
                            title: heroVideoTitle,
                            description: '',
                            video_url: videoUrl,
                            thumbnail_url: thumbnailUrl,
                            display_order: videos.length + 1,
                            is_hero_section: true,
                            category: 'from_fortune_bridge',
                            game_tags: [],
                            link_url: heroLinkUrl || null,
                            created_by_user_id: (await supabase.auth.getSession()).data.session?.user?.id
                          });

                        if (error) throw error;

                        toast({
                          title: "Success",
                          description: "Hero video uploaded successfully",
                        });

                        setHeroVideoFile(null);
                        setHeroThumbnailFile(null);
                        setHeroVideoTitle("");
                        setHeroLinkUrl("");
                        fetchMedia();
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to upload hero video",
                          variant: "destructive",
                        });
                      } finally {
                        setUploading(false);
                      }
                    }}
                    disabled={uploading || !heroVideoFile || !heroThumbnailFile || !heroVideoTitle}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Hero Video
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Current Hero Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroImages.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img src={image.public_url} alt={image.name} className="w-full h-full object-cover" />
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleImageVisibility(image.id, image.is_active)}
                            >
                              {image.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveImage(image.id, 'up', heroImages, setHeroImages)}
                              disabled={image.display_order === 1}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveImage(image.id, 'down', heroImages, setHeroImages)}
                              disabled={image.display_order === heroImages.length}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteImage(image.id, image.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {videos.filter(v => v.is_hero_section).map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                        <PlayCircle className="absolute inset-0 m-auto h-12 w-12 text-white opacity-80" />
                      </div>
                      <CardContent className="p-3">
                        <p className="font-semibold truncate">{video.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleVideoVisibility(video.id, video.is_active)}
                            >
                              {video.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveVideo(video.id, 'up')}
                              disabled={video.display_order === 1}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveVideo(video.id, 'down')}
                              disabled={video.display_order === videos.length}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteVideo(video.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carousel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Image Carousel Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCarouselImageFile(e.target.files?.[0] || null)}
                />
                <Input
                  placeholder="Click URL (optional)"
                  value={carouselLinkUrl}
                  onChange={(e) => setCarouselLinkUrl(e.target.value)}
                />
                <Button onClick={handleCarouselImageUpload} disabled={uploading || !carouselImageFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Carousel Image
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Current Carousel Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {carouselImages.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img src={image.public_url} alt={image.name} className="w-full h-full object-cover" />
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleImageVisibility(image.id, image.is_active)}
                            >
                              {image.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveImage(image.id, 'up', carouselImages, setCarouselImages)}
                              disabled={image.display_order === 1}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveImage(image.id, 'down', carouselImages, setCarouselImages)}
                              disabled={image.display_order === carouselImages.length}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteImage(image.id, image.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Page Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Input
                    placeholder="Video Title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Video Description"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                  />
                  <Select value={videoCategory} onValueChange={(value: 'from_fortune_bridge' | 'about_games') => setVideoCategory(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="from_fortune_bridge">From Fortune Bridge</SelectItem>
                      <SelectItem value="about_games">About Games</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Game IDs (comma-separated, optional)"
                    value={gameTagsInput}
                    onChange={(e) => setGameTagsInput(e.target.value)}
                  />
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Upload Video</h4>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                  <h4 className="font-medium text-sm text-muted-foreground">Upload Video Preview</h4>
                  <Input
                    type="file"
                    accept="image/*"
                    placeholder="Preview image for grid view"
                    onChange={(e) => setVideoPreviewFile(e.target.files?.[0] || null)}
                  />
                  <Button onClick={handleVideoUpload} disabled={uploading || !videoFile || !videoPreviewFile || !videoTitle}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Current Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.filter(v => !v.is_hero_section).map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img src={video.preview_image_url || video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                        <PlayCircle className="absolute inset-0 m-auto h-12 w-12 text-white opacity-80" />
                      </div>
                      <CardContent className="p-3">
                        <p className="font-semibold truncate">{video.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {video.category.replace('_', ' ')}
                        </p>
                        {video.game_tags.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Games: {video.game_tags.join(', ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleVideoVisibility(video.id, video.is_active)}
                            >
                              {video.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveVideo(video.id, 'up')}
                              disabled={video.display_order === 1}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveVideo(video.id, 'down')}
                              disabled={video.display_order === videos.length}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteVideo(video.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}