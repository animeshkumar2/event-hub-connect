import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload = ({
  images,
  onChange,
  maxImages = 20,
  disabled = false,
  className,
}: ImageUploadProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesArray = Array.from(files).slice(0, remainingSlots);
    const newImages: string[] = [];

    setIsUploading(true);

    try {
      // For now, we'll convert to data URLs
      // In production, you'd upload to a cloud storage service (S3, Cloudinary, etc.)
      for (const file of filesArray) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        // Convert to data URL for preview
        // In production, upload to your backend/cloud storage and get URLs
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newImages.push(dataUrl);
      }

      onChange([...images, ...newImages]);
      toast.success(`Added ${newImages.length} image${newImages.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process images');
    } finally {
      setIsUploading(false);
    }
  }, [images, maxImages, onChange]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    handleFileSelect(e.dataTransfer.files);
  }, [disabled, handleFileSelect]);

  // Handle URL input
  const handleAddUrl = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      // Basic URL validation
      try {
        new URL(url);
        if (images.length >= maxImages) {
          toast.error(`Maximum ${maxImages} images allowed`);
          return;
        }
        onChange([...images, url.trim()]);
        toast.success('Image URL added');
      } catch {
        toast.error('Please enter a valid URL');
      }
    }
  }, [images, maxImages, onChange]);

  // Remove image
  const handleRemove = useCallback((index: number) => {
    onChange(images.filter((_, i) => i !== index));
  }, [images, onChange]);

  // Reorder images (drag and drop)
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    onChange(newImages);
    setDraggedIndex(index);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-all',
          disabled
            ? 'border-muted bg-muted/50 cursor-not-allowed'
            : 'border-primary/30 hover:border-primary/50 bg-muted/20 hover:bg-muted/30 cursor-pointer'
        )}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center gap-3">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading images...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF up to 5MB each
                </p>
                <p className="text-xs text-muted-foreground">
                  {images.length} / {maxImages} images
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOverItem(e, index)}
              className={cn(
                'relative group aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted',
                draggedIndex === index && 'opacity-50 scale-95',
                !disabled && 'cursor-move'
              )}
            >
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                {!disabled && (
                  <>
                    {/* Drag Handle */}
                    <div className="absolute top-2 left-2 p-1.5 rounded bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-4 w-4 text-foreground" />
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Image Number Badge */}
              <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add URL Button */}
      {!disabled && images.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddUrl}
          className="w-full"
          disabled={isUploading}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Add Image URL
        </Button>
      )}

      {/* Helper Text */}
      {images.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Add at least one image to showcase your listing
        </p>
      )}
    </div>
  );
};



