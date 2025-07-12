import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image, Video, Link, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadInputProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  accept?: string;
  maxFiles?: number;
}

const FileUploadInput = ({ 
  label, 
  value, 
  onChange, 
  accept = "image/*,video/*", 
  maxFiles = 10 
}: FileUploadInputProps) => {
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('location-media')
          .upload(fileName, file);
          
        if (error) throw error;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('location-media')
          .getPublicUrl(fileName);
          
        return publicUrl;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      const updatedUrls = [...value, ...uploadedUrls].slice(0, maxFiles);
      onChange(updatedUrls);
      
      toast.success(`Successfully uploaded ${files.length} file(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlAdd = () => {
    if (urlInput.trim() && !value.includes(urlInput.trim())) {
      const updatedUrls = [...value, urlInput.trim()].slice(0, maxFiles);
      onChange(updatedUrls);
      setUrlInput('');
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const updatedUrls = value.filter((_, index) => index !== indexToRemove);
    onChange(updatedUrls);
  };

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || 
           url.includes('video') || url.startsWith('blob:');
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* File Upload */}
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={value.length >= maxFiles || isUploading}
          className="flex items-center space-x-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
        </Button>
        <span className="text-sm text-muted-foreground">
          {value.length}/{maxFiles} files
        </span>
      </div>

      {/* URL Input */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Or paste image/video URL..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
          disabled={value.length >= maxFiles}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleUrlAdd}
          disabled={!urlInput.trim() || value.length >= maxFiles}
          className="flex items-center space-x-2"
        >
          <Link className="h-4 w-4" />
          <span>Add URL</span>
        </Button>
      </div>

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-border">
              {isVideo(url) ? (
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  <Video className="h-8 w-8 text-muted-foreground" />
                  <video
                    src={url}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                  />
                </div>
              ) : (
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  <Image className="h-8 w-8 text-muted-foreground" />
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadInput;