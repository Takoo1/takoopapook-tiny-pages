import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Upload, X, Star, User } from 'lucide-react';
import { useAllPackages } from '@/hooks/usePackages';
import { useAllLocations } from '@/hooks/useLocations';
import { useCreateReview } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PackageCard from '@/components/PackageCard';
import DestinationCard from '@/components/DestinationCard';

const AddReview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('itemId');
  const itemType = searchParams.get('itemType') as 'package' | 'destination';
  
  const { data: packages = [] } = useAllPackages();
  const { data: locations = [] } = useAllLocations();
  const createReview = useCreateReview();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    experience_summary: '',
    detailed_review: '',
    reviewer_name: '',
    rating: 5
  });
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [uploadedVideoUrls, setUploadedVideoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [fileProgressKeys, setFileProgressKeys] = useState<{ [index: number]: string }>({});

  // Handle immediate file upload when files are selected
  const handleFileSelect = async (files: File[], type: 'images' | 'videos') => {
    const startIndex = type === 'images' ? images.length : videos.length;
    
    if (type === 'images') {
      setImages(prev => [...prev, ...files]);
    } else {
      setVideos(prev => [...prev, ...files]);
    }

    // Start uploading immediately
    for (let i = 0; i < files.length; i++) {
      const fileIndex = startIndex + i;
      const progressKey = `${type}-${Date.now()}-${i}`;
      
      // Store the progress key for this file
      setFileProgressKeys(prev => ({ ...prev, [fileIndex]: progressKey }));
      
      try {
        const url = await handleIndividualFileUpload(files[i], type, progressKey);
        
        if (type === 'images') {
          setUploadedImageUrls(prev => [...prev, url]);
        } else {
          setUploadedVideoUrls(prev => [...prev, url]);
        }
      } catch (error: any) {
        console.error(`Failed to upload ${type.slice(0, -1)}:`, error.message);
      }
    }
  };

  // Get user profile info
  const userProfileImage = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';

  // Auto-populate reviewer name if user is logged in
  useEffect(() => {
    if (userName && !formData.reviewer_name) {
      setFormData(prev => ({ ...prev, reviewer_name: userName }));
    }
  }, [userName, formData.reviewer_name]);

  const item = itemType === 'package' 
    ? packages.find(p => p.id === itemId)
    : locations.find(l => l.id === itemId);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIndividualFileUpload = async (file: File, type: 'images' | 'videos', fileKey: string) => {
    const fileName = `${Date.now()}-${file.name}`;
    const bucketName = type === 'videos' ? 'review-videos' : 'review-media';
    
    // Validate file size (10MB for images, 100MB for videos)
    const maxSize = type === 'videos' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large. ${type === 'videos' ? 'Videos' : 'Images'} must be less than ${type === 'videos' ? '100MB' : '10MB'}.`);
    }
    
    setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileKey] || 0;
          if (current < 90) {
            return { ...prev, [fileKey]: current + 10 };
          }
          return prev;
        });
      }, 200);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);
      
      clearInterval(progressInterval);
      
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
      
      // Clear progress after 2 seconds
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileKey];
          return newProgress;
        });
      }, 2000);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));
      throw error;
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setUploading(true);
    
    try {
      await createReview.mutateAsync({
        item_type: itemType,
        item_id: itemId!,
        experience_summary: formData.experience_summary,
        detailed_review: formData.detailed_review,
        reviewer_name: formData.reviewer_name,
        rating: formData.rating,
        images: uploadedImageUrls,
        videos: uploadedVideoUrls,
        is_published: false
      });

      navigate(-1);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number, fileType: 'images' | 'videos') => {
    if (fileType === 'images') {
      setImages(prev => prev.filter((_, i) => i !== index));
      setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      setVideos(prev => prev.filter((_, i) => i !== index));
      setUploadedVideoUrls(prev => prev.filter((_, i) => i !== index));
    }
    
    // Clear the progress key for this file
    setFileProgressKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[index];
      return newKeys;
    });
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Item not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-3xl font-bold text-center mb-2">Add Review</h1>
          <p className="text-muted-foreground text-center">
            Share your experience with this {itemType}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Item Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{itemType} Details</CardTitle>
              </CardHeader>
              <CardContent>
                {itemType === 'package' ? (
                  <PackageCard 
                    package={item as any} 
                  />
                ) : (
                  <DestinationCard 
                    location={item as any} 
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Write Your Review</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Rating */}
                  <div className="space-y-2">
                    <Label>Overall Rating</Label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleInputChange('rating', star)}
                          className={`p-1 ${
                            star <= formData.rating
                              ? 'text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {formData.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Experience Summary */}
                  <div className="space-y-2">
                    <Label htmlFor="experience">
                      Your Experience in One Beautiful Sentence
                    </Label>
                    <Input
                      id="experience"
                      value={formData.experience_summary}
                      onChange={(e) => handleInputChange('experience_summary', e.target.value)}
                      placeholder="Describe your experience in one captivating sentence..."
                      required
                    />
                  </div>

                  {/* Detailed Review */}
                  <div className="space-y-2">
                    <Label htmlFor="detailed">
                      Tell Us More - What Went Good and Your Opinion
                    </Label>
                    <Textarea
                      id="detailed"
                      value={formData.detailed_review}
                      onChange={(e) => handleInputChange('detailed_review', e.target.value)}
                      placeholder="Share your detailed experience, what you loved, and your honest opinion..."
                      rows={6}
                      required
                    />
                  </div>

                   {/* Reviewer Profile Section */}
                  <div className="space-y-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                    <Label className="text-base font-semibold">Your Profile</Label>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                        <AvatarImage src={userProfileImage} alt="Your profile" />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold text-lg">
                          {user ? (
                            formData.reviewer_name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          ) : (
                            <User className="h-6 w-6" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Label htmlFor="name">
                          Your Name (as you want it to appear)
                        </Label>
                        <Input
                          id="name"
                          value={formData.reviewer_name}
                          onChange={(e) => handleInputChange('reviewer_name', e.target.value)}
                          placeholder={user ? "Enter your display name" : "Enter your name"}
                          required
                          className="mt-1"
                        />
                        {user && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Profile image from your Google account
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Add Your Journey Images (Max 5)</Label>
                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (images.length + files.length <= 5) {
                            await handleFileSelect(files, 'images');
                          }
                        }}
                        className="hidden"
                        id="images"
                      />
                      <label
                        htmlFor="images"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary"
                      >
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Click to upload images ({images.length}/5)
                          </p>
                        </div>
                      </label>
                      
                      {images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {images.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(index, 'images')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Upload */}
                  <div className="space-y-2">
                    <Label>Add Videos (Max 2)</Label>
                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (videos.length + files.length <= 2) {
                            await handleFileSelect(files, 'videos');
                          }
                        }}
                        className="hidden"
                        id="videos"
                      />
                      <label
                        htmlFor="videos"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary"
                      >
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Click to upload videos ({videos.length}/2)
                          </p>
                        </div>
                      </label>
                      
                      {videos.length > 0 && (
                        <div className="space-y-2">
                           {videos.map((file, index) => {
                             const progressKey = fileProgressKeys[index];
                             const progress = progressKey ? uploadProgress[progressKey] || 0 : 0;
                            return (
                              <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                  <span className="text-sm truncate">{file.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(index, 'videos')}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                 {progress > 0 && progress < 100 && (
                                   <div className="space-y-1">
                                     <div className="flex justify-between text-xs text-gray-600">
                                       <span>Uploading... {Math.round(progress)}%</span>
                                     </div>
                                     <Progress value={progress} className="h-2" />
                                   </div>
                                 )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={uploading || createReview.isPending}
                  >
                    {uploading || createReview.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReview;