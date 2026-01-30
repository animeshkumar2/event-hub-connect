import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Slider } from '@/shared/components/ui/slider';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Maximize2,
  Square,
  RectangleHorizontal,
  Circle,
} from 'lucide-react';

interface ImageCropModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio?: number; // e.g., 1 for square, 16/9 for cover
  cropShape?: 'rect' | 'round';
  title?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  open,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  cropShape = 'rect',
  title = 'Crop Image',
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(aspectRatio);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal opens with new image
  useEffect(() => {
    if (open) {
      setScale(1);
      setRotate(0);
      setAspect(aspectRatio);
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  }, [open, imageSrc, aspectRatio]);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const initialCrop = centerAspectCrop(width, height, aspect || 1);
      setCrop(initialCrop);
    },
    [aspect]
  );

  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    const image = imgRef.current;
    if (!image || !completedCrop) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Calculate the actual crop dimensions
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Set canvas size to crop size
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Apply transformations
    ctx.save();
    
    // Move to center, rotate, then move back
    if (rotate !== 0) {
      const centerX = cropWidth / 2;
      const centerY = cropHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    // Draw the cropped portion
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    ctx.restore();

    // If round crop, apply circular mask
    if (cropShape === 'round') {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCanvas.width = cropWidth;
        tempCanvas.height = cropHeight;
        
        tempCtx.beginPath();
        tempCtx.arc(cropWidth / 2, cropHeight / 2, Math.min(cropWidth, cropHeight) / 2, 0, Math.PI * 2);
        tempCtx.closePath();
        tempCtx.clip();
        tempCtx.drawImage(canvas, 0, 0);
        
        return new Promise((resolve) => {
          tempCanvas.toBlob(resolve, 'image/jpeg', 0.92);
        });
      }
    }

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92);
    });
  }, [completedCrop, rotate, cropShape]);

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      const blob = await getCroppedImg();
      if (blob) {
        onCropComplete(blob);
        onClose();
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const aspectOptions = [
    { label: 'Free', value: undefined, icon: Maximize2 },
    { label: '1:1', value: 1, icon: Square },
    { label: '16:9', value: 16 / 9, icon: RectangleHorizontal },
    { label: '4:3', value: 4 / 3, icon: RectangleHorizontal },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        {/* Crop Area */}
        <div className="flex-1 overflow-auto p-4 bg-black/95 min-h-[300px] max-h-[60vh] flex items-center justify-center">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              circularCrop={cropShape === 'round'}
              className="max-h-full"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  maxHeight: '55vh',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
                className="transition-transform duration-200"
              />
            </ReactCrop>
          )}
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-t bg-muted/30 space-y-4">
          {/* Zoom Control */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[60px]">
              <ZoomOut className="h-4 w-4" />
              <span>Zoom</span>
            </div>
            <Slider
              value={[scale]}
              onValueChange={([value]) => setScale(value)}
              min={0.5}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[60px]">
              <ZoomIn className="h-4 w-4" />
              <span>{Math.round(scale * 100)}%</span>
            </div>
          </div>

          {/* Rotate Control */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[60px]">
              <RotateCcw className="h-4 w-4" />
              <span>Rotate</span>
            </div>
            <Slider
              value={[rotate]}
              onValueChange={([value]) => setRotate(value)}
              min={-180}
              max={180}
              step={1}
              className="flex-1"
            />
            <div className="text-sm text-muted-foreground min-w-[60px] text-right">
              {rotate}°
            </div>
          </div>

          {/* Aspect Ratio Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground mr-2">Aspect:</span>
            {aspectOptions.map((option) => (
              <Button
                key={option.label}
                variant={aspect === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setAspect(option.value);
                  if (imgRef.current && option.value) {
                    const { width, height } = imgRef.current;
                    setCrop(centerAspectCrop(width, height, option.value));
                  }
                }}
                className="gap-1.5"
              >
                <option.icon className="h-3.5 w-3.5" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-background">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isProcessing || !completedCrop}>
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Apply Crop
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropModal;
