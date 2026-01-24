import { Label } from '@/shared/components/ui/label';
import { ImageUpload } from '@/shared/components/ImageUpload';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Camera, CheckCircle2 } from 'lucide-react';

interface Step3Props {
  formData: any;
  handleImagesChange: (images: string[]) => void;
}

export function ListingFormStep3({ formData, handleImagesChange }: Step3Props) {
  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Camera className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Upload Your Listing Images
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          High-quality images help customers understand your offering better. Upload multiple photos to showcase different aspects.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Images *</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Upload multiple photos to showcase your listing. Drag to reorder. First image will be the cover photo.
        </p>
        <ImageUpload
          images={formData.images}
          onChange={handleImagesChange}
          maxImages={20}
        />
      </div>

      {formData.images.length === 0 ? (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-400">
            ⚠️ At least one image is required to publish your listing
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-500/50 bg-green-500/10">
          <AlertDescription className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {formData.images.length} image{formData.images.length > 1 ? 's' : ''} uploaded. Ready to publish!
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-semibold text-foreground">📸 Image Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Use high-resolution images (at least 1200x800 pixels)</li>
          <li>Show your work from different angles</li>
          <li>Include close-up shots of important details</li>
          <li>Use good lighting - natural light works best</li>
          <li>First image will be used as the cover photo</li>
        </ul>
      </div>
    </div>
  );
}
