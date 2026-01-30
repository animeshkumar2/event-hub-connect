import React, { useState, useRef, useCallback } from 'react';
import { Camera, Trash2, ZoomIn, Loader2, User, ImageIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { ImageCropModal } from './ImageCropModal';
import { ImageViewer } from './ImageViewer';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface ProfileImageUploadProps {
  imageUrl: string | null;
  onImageChange: (file: File | null) => void;
  onImageDelete?: () => void;
  type: 'profile' | 'cover';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  disabled?: boolean;
  className?: string;
  uploading?: boolean;
}

const sizeClasses = {
  profile: {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
    '2xl': 'w-48 h-48',
  },
  cover: {
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-48',
    xl: 'h-56',
    '2xl': 'h-64',
  },
};

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  imageUrl,
  onImageChange,
  onImageDelete,
  type,
  size = 'md',
  disabled = false,
  className,
  uploading = false,
}) => {
  const [showCropModal, setShowCropModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatio = type === 'profile' ? 1 : 16 / 9;
  const cropShape = type === 'profile' ? 'round' : 'rect';

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    // Create preview and open crop modal
    const reader = new FileReader();
    reader.onload = () => {
      setTempImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  }, []);

  const handleCropComplete = useCallback((blob: Blob) => {
    // Convert blob to file
    const file = new File([blob], `${type}-image.jpg`, { type: 'image/jpeg' });
    onImageChange(file);
    setTempImageSrc(null);
    // Don't show toast here - let the parent component handle it after upload completes
  }, [type, onImageChange]);

  const handleDelete = useCallback(() => {
    onImageChange(null);
    onImageDelete?.();
    setShowDeleteDialog(false);
    // Don't show toast here - let the parent component handle it
  }, [onImageChange, onImageDelete]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Profile Image Component
  if (type === 'profile') {
    return (
      <>
        <div className={cn('relative inline-block', className)}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled || uploading}>
              <button
                className={cn(
                  'relative rounded-full overflow-hidden border-4 border-background shadow-xl',
                  'ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300',
                  'focus:outline-none focus:ring-primary/60',
                  sizeClasses.profile[size],
                  disabled && 'opacity-50 cursor-not-allowed',
                  !disabled && 'cursor-pointer group'
                )}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <User className="w-1/2 h-1/2 text-primary/40" />
                  </div>
                )}

                {/* Hover Overlay */}
                {!disabled && !uploading && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}

                {/* Loading Overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="center" className="w-48">
              {imageUrl && (
                <>
                  <DropdownMenuItem onClick={() => setShowViewer(true)}>
                    <ZoomIn className="w-4 h-4 mr-2" />
                    View Photo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={triggerFileInput}>
                <Camera className="w-4 h-4 mr-2" />
                {imageUrl ? 'Change Photo' : 'Upload Photo'}
              </DropdownMenuItem>
              {imageUrl && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Photo
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Camera Badge */}
          {!disabled && !uploading && (
            <div
              className={cn(
                'absolute bottom-0 right-0 p-1.5 rounded-full',
                'bg-primary text-primary-foreground shadow-lg',
                'border-2 border-background',
                size === 'sm' && 'p-1',
                size === 'lg' && 'p-2'
              )}
            >
              <Camera className={cn('w-3 h-3', size === 'lg' && 'w-4 h-4')} />
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
        />

        {/* Crop Modal */}
        <ImageCropModal
          open={showCropModal}
          onClose={() => {
            setShowCropModal(false);
            setTempImageSrc(null);
          }}
          imageSrc={tempImageSrc || ''}
          onCropComplete={handleCropComplete}
          aspectRatio={aspectRatio}
          cropShape={cropShape as 'rect' | 'round'}
          title="Crop Profile Photo"
        />

        {/* Image Viewer */}
        {imageUrl && (
          <ImageViewer
            open={showViewer}
            onClose={() => setShowViewer(false)}
            images={[imageUrl]}
            title="Profile Photo"
            onDelete={() => {
              setShowViewer(false);
              setShowDeleteDialog(true);
            }}
            onEdit={() => {
              setShowViewer(false);
              triggerFileInput();
            }}
          />
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Profile Photo?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove your current profile photo. You can upload a new one anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Cover Image Component
  return (
    <>
      <div
        className={cn(
          'relative w-full rounded-xl overflow-hidden',
          sizeClasses.cover[size],
          className
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled || uploading}>
            <button
              className={cn(
                'w-full h-full',
                'focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2',
                disabled && 'opacity-50 cursor-not-allowed',
                !disabled && 'cursor-pointer group'
              )}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-primary/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Add a cover image</p>
                  </div>
                </div>
              )}

              {/* Hover Overlay */}
              {!disabled && !uploading && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white">
                    <Camera className="w-5 h-5" />
                    <span className="font-medium">
                      {imageUrl ? 'Change Cover' : 'Add Cover'}
                    </span>
                  </div>
                </div>
              )}

              {/* Loading Overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            {imageUrl && (
              <>
                <DropdownMenuItem onClick={() => setShowViewer(true)}>
                  <ZoomIn className="w-4 h-4 mr-2" />
                  View Cover
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={triggerFileInput}>
              <Camera className="w-4 h-4 mr-2" />
              {imageUrl ? 'Change Cover' : 'Upload Cover'}
            </DropdownMenuItem>
            {imageUrl && (
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Cover
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Button Badge */}
        {!disabled && !uploading && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-3 right-3 shadow-lg"
            onClick={triggerFileInput}
          >
            <Camera className="w-4 h-4 mr-2" />
            {imageUrl ? 'Edit' : 'Add Cover'}
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />

      {/* Crop Modal */}
      <ImageCropModal
        open={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setTempImageSrc(null);
        }}
        imageSrc={tempImageSrc || ''}
        onCropComplete={handleCropComplete}
        aspectRatio={aspectRatio}
        cropShape="rect"
        title="Crop Cover Image"
      />

      {/* Image Viewer */}
      {imageUrl && (
        <ImageViewer
          open={showViewer}
          onClose={() => setShowViewer(false)}
          images={[imageUrl]}
          title="Cover Image"
          onDelete={() => {
            setShowViewer(false);
            setShowDeleteDialog(true);
          }}
          onEdit={() => {
            setShowViewer(false);
            triggerFileInput();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Cover Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your current cover image. You can upload a new one anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfileImageUpload;
