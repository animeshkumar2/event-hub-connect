import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { validateImageFile, compressImage } from '@/shared/utils/storage';

// Represents either an already-uploaded URL or a pending file
export interface ImageItem {
  type: 'url' | 'file';
  url?: string;      // For already uploaded images
  file?: File;       // For pending uploads
  preview?: string;  // Object URL for preview
}

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  onPendingChanges?: (changes: PendingImageChanges) => void;
  maxImages?: number;
  disabled?: boolean;
  className?: string;
}

// Track what needs to happen on save
export interface PendingImageChanges {
  filesToUpload: File[];           // New files to upload
  urlsToDelete: string[];          // Existing URLs to delete
  finalOrder: (string | File)[];   // Final order (mix of URLs and Files)
}

export const ImageUpload = ({
  images,
  onChange,
  onPendingChanges,
  maxImages = 20,
  disabled = false,
  className,
}: ImageUploadProps) => {
  // Internal state: mix of URLs (existing) and Files (pending)
  const [items, setItems] = useState<ImageItem[]>(() => {
    console.log('🖼️ ImageUpload initializing with images:', images);
    return images.map(url => ({ type: 'url' as const, url }));
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track original images to detect when editing a different listing
  const originalImagesRef = useRef<string | null>(null);
  const currentImagesKey = JSON.stringify(images);
  
  // Reset state only when we get a completely different set of images (new listing)
  // NOT when images change due to our own onChange calls
  if (originalImagesRef.current === null) {
    originalImagesRef.current = currentImagesKey;
  } else if (originalImagesRef.current !== currentImagesKey) {
    // Check if this change came from outside (new listing) vs from our own updates
    // If pendingDeletes is empty and no pending files, it's safe to reset
    const hasPendingFiles = items.some(i => i.type === 'file');
    if (!hasPendingFiles && pendingDeletes.length === 0) {
      originalImagesRef.current = currentImagesKey;
      setItems(images.map(url => ({ type: 'url' as const, url })));
    }
  }

  // Notify parent of pending changes
  const notifyPendingChanges = useCallback((
    currentItems: ImageItem[], 
    deletedUrls: string[],
    broken: Set<string> = new Set()
  ) => {
    if (!onPendingChanges) return;

    const filesToUpload = currentItems
      .filter(item => item.type === 'file' && item.file)
      .map(item => item.file!);
    
    // Filter out broken URLs from finalOrder
    const finalOrder = currentItems
      .filter(item => {
        if (item.type === 'url' && item.url && broken.has(item.url)) {
          return false; // Skip broken URLs
        }
        return true;
      })
      .map(item => item.type === 'url' ? item.url! : item.file!);

    onPendingChanges({
      filesToUpload,
      urlsToDelete: deletedUrls,
      finalOrder,
    });
  }, [onPendingChanges]);

  // Handle image load error - mark URL as broken
  const handleImageError = useCallback((url: string) => {
    console.log('🖼️ Image failed to load:', url);
    setBrokenUrls(prev => {
      const newSet = new Set(prev);
      newSet.add(url);
      return newSet;
    });
    // Also add to pending deletes since it's broken
    setPendingDeletes(prev => {
      if (prev.includes(url)) return prev;
      const updated = [...prev, url];
      // Notify parent with updated state
      setTimeout(() => notifyPendingChanges(items, updated, new Set([...brokenUrls, url])), 0);
      return updated;
    });
  }, [items, brokenUrls, notifyPendingChanges]);

  // Handle successful image load
  const handleImageLoad = useCallback((url: string) => {
    console.log('✅ Image loaded successfully:', url);
  }, []);

  // Notify parent on mount so pendingImageChanges is initialized
  useEffect(() => {
    if (onPendingChanges) {
      notifyPendingChanges(items, pendingDeletes, brokenUrls);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // State for compression loading
  const [isCompressing, setIsCompressing] = useState(false);

  // Handle file selection - validate, compress, then store locally
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    console.log('📁 handleFileSelect called with files:', files?.length);
    
    if (!files || files.length === 0) {
      console.log('📁 No files selected');
      return;
    }

    // Convert FileList to array BEFORE any async operations
    const filesArray = Array.from(files);
    console.log('📁 Files to process:', filesArray.map(f => ({ name: f.name, size: f.size, type: f.type })));

    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const remainingSlots = maxImages - items.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`, {
        id: `max-images-${Date.now()}`,
      });
      return;
    }

    const filesToProcess = filesArray.slice(0, remainingSlots);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // First pass: validate all files
    for (const file of filesToProcess) {
      console.log(`📁 Validating file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      const validation = validateImageFile(file);
      
      if (!validation.valid) {
        console.log(`❌ Validation failed for ${file.name}: ${validation.error}`);
        errors.push(validation.error || 'Invalid file');
        continue;
      }

      console.log(`✅ Validation passed for ${file.name}`);
      validFiles.push(file);
    }

    // Show validation errors immediately
    if (errors.length > 0) {
      console.log('📁 Showing error toasts:', errors);
      errors.forEach((err, idx) => {
        toast.error(err, {
          id: `upload-error-${Date.now()}-${idx}`,
          duration: 5000,
        });
      });
    }

    // Process valid files - compress if needed
    if (validFiles.length > 0) {
      setIsCompressing(true);
      const compressToastId = `compress-${Date.now()}`;
      
      // Show compressing toast for large files (>2MB)
      const hasLargeFiles = validFiles.some(f => f.size > 2 * 1024 * 1024);
      if (hasLargeFiles) {
        toast.loading('Compressing images...', { id: compressToastId });
      }

      try {
        const newItems: ImageItem[] = [];
        
        for (const file of validFiles) {
          // Compress the file if needed
          const compressedFile = await compressImage(file);
          
          // Create preview URL for display
          const preview = URL.createObjectURL(compressedFile);
          newItems.push({ type: 'file', file: compressedFile, preview });
        }

        // Dismiss compressing toast
        if (hasLargeFiles) {
          toast.dismiss(compressToastId);
        }

        console.log(`📁 Adding ${newItems.length} images to queue`);
        const updatedItems = [...items, ...newItems];
        setItems(updatedItems);
        
        // Update parent with current URLs (pending files not included in images yet)
        const currentUrls = updatedItems
          .filter(item => item.type === 'url')
          .map(item => item.url!);
        onChange(currentUrls);
        
        // Notify about pending changes
        notifyPendingChanges(updatedItems, pendingDeletes);
        
        toast.success(`Added ${newItems.length} image${newItems.length > 1 ? 's' : ''} (will upload on save)`, {
          id: `upload-success-${Date.now()}`,
        });
      } catch (error) {
        console.error('❌ Compression failed:', error);
        toast.dismiss(compressToastId);
        toast.error('Failed to process images. Please try again.');
      } finally {
        setIsCompressing(false);
      }
    }
  }, [items, maxImages, onChange, notifyPendingChanges, pendingDeletes]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isCompressing) return;
    handleFileSelect(e.dataTransfer.files);
  }, [disabled, isCompressing, handleFileSelect]);

  // Remove image
  const handleRemove = useCallback((index: number) => {
    const itemToRemove = items[index];
    const updatedItems = items.filter((_, i) => i !== index);
    
    // Clean up preview URL if it's a file
    if (itemToRemove.type === 'file' && itemToRemove.preview) {
      URL.revokeObjectURL(itemToRemove.preview);
    }
    
    // If it's an existing URL, queue for deletion
    let updatedDeletes = pendingDeletes;
    if (itemToRemove.type === 'url' && itemToRemove.url) {
      updatedDeletes = [...pendingDeletes, itemToRemove.url];
      setPendingDeletes(updatedDeletes);
    }
    
    setItems(updatedItems);
    
    // Update parent with current URLs
    const currentUrls = updatedItems
      .filter(item => item.type === 'url')
      .map(item => item.url!);
    onChange(currentUrls);
    
    // Notify about pending changes
    notifyPendingChanges(updatedItems, updatedDeletes);
  }, [items, pendingDeletes, onChange, notifyPendingChanges]);

  // Reorder images
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setItems(newItems);
    setDraggedIndex(index);
    
    // Update parent and notify changes
    const currentUrls = newItems
      .filter(item => item.type === 'url')
      .map(item => item.url!);
    onChange(currentUrls);
    notifyPendingChanges(newItems, pendingDeletes);
  };

  // Get display URL for an item
  const getDisplayUrl = (item: ImageItem): string => {
    if (item.type === 'url') return item.url!;
    return item.preview || '';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-all',
          (disabled || isCompressing)
            ? 'border-muted bg-muted/50 cursor-not-allowed'
            : 'border-primary/30 hover:border-primary/50 bg-muted/20 hover:bg-muted/30 cursor-pointer'
        )}
        onClick={() => !disabled && !isCompressing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          disabled={disabled || isCompressing}
          onChange={(e) => {
            console.log('📁 Input onChange triggered, files:', e.target.files?.length);
            handleFileSelect(e.target.files);
          }}
        />
        <div className="flex flex-col items-center justify-center gap-3">
          {isCompressing ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isCompressing ? 'Compressing images...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WEBP, GIF up to 25MB (auto-compressed)
            </p>
            <p className="text-xs text-muted-foreground">
              {items.filter(item => !(item.type === 'url' && item.url && brokenUrls.has(item.url))).length} / {maxImages} images
            </p>
          </div>
        </div>
      </div>

      {/* Pending uploads indicator */}
      {items.some(item => item.type === 'file') && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
          <Loader2 className="h-3 w-3" />
          <span>
            {items.filter(item => item.type === 'file').length} image(s) pending upload - will be uploaded when you save
          </span>
        </div>
      )}

      {/* Image Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items
            .filter(item => !(item.type === 'url' && item.url && brokenUrls.has(item.url)))
            .map((item, index) => (
            <div
              key={`${item.type}-${item.url || index}-${index}`}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOverItem(e, index)}
              className={cn(
                'relative group aspect-square rounded-lg overflow-hidden border-2 bg-muted',
                draggedIndex === index && 'opacity-50 scale-95',
                item.type === 'file' ? 'border-amber-400 border-dashed' : 'border-border',
                !disabled && 'cursor-move'
              )}
            >
              <img
                src={getDisplayUrl(item)}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onLoad={() => {
                  if (item.type === 'url' && item.url) {
                    handleImageLoad(item.url);
                  }
                }}
                onError={() => {
                  if (item.type === 'url' && item.url) {
                    handleImageError(item.url);
                  }
                }}
              />
              
              {/* Pending badge */}
              {item.type === 'file' && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-amber-500 text-white text-[10px] font-medium">
                  Pending
                </div>
              )}
              
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
              
              {/* First image indicator */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-primary/90 backdrop-blur-sm text-white text-xs font-medium">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Add at least one image to showcase your listing
        </p>
      )}
    </div>
  );
};

// Helper to process pending changes on save
export const processPendingImageChanges = async (
  changes: PendingImageChanges,
  uploadFn: (file: File) => Promise<string>,
  deleteFn: (url: string) => Promise<void>
): Promise<string[]> => {
  // Upload new files
  const uploadedUrls: Map<File, string> = new Map();
  for (const file of changes.filesToUpload) {
    try {
      const url = await uploadFn(file);
      uploadedUrls.set(file, url);
    } catch (error) {
      console.error('Failed to upload:', file.name, error);
      throw error;
    }
  }

  // Delete removed images (don't fail if delete fails)
  for (const url of changes.urlsToDelete) {
    try {
      await deleteFn(url);
    } catch (error) {
      console.warn('Failed to delete:', url, error);
    }
  }

  // Build final URLs array in correct order
  const finalUrls = changes.finalOrder.map(item => {
    if (typeof item === 'string') return item;
    return uploadedUrls.get(item) || '';
  }).filter(url => url !== '');

  return finalUrls;
};
