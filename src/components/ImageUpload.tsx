import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { validateImageFile } from '@/utils/storage'
import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  onUploadError?: (error: string) => void
  maxSize?: number // in MB
  accept?: string
  label?: string
  existingImageUrl?: string
  onRemove?: () => void
}

export const ImageUpload = ({
  onUploadComplete,
  onUploadError,
  maxSize = 5,
  accept = 'image/*',
  label = 'Upload Image',
  existingImageUrl,
  onRemove,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast({
        title: 'Invalid file',
        description: validation.error,
        variant: 'destructive',
      })
      onUploadError?.(validation.error || 'Invalid file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Note: Actual upload will be handled by parent component
    // This component just handles file selection and preview
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onRemove?.()
  }

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <Label htmlFor="image-upload" className="cursor-pointer">
            <Button type="button" variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </span>
            </Button>
          </Label>
          <p className="text-sm text-gray-500 mt-2">
            Max size: {maxSize}MB
          </p>
        </div>
      )}

      <Input
        id="image-upload"
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  )
}

interface MultipleImageUploadProps {
  onUploadComplete: (urls: string[]) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  existingImages?: string[]
  onRemove?: (index: number) => void
}

export const MultipleImageUpload = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  existingImages = [],
  onRemove,
}: MultipleImageUploadProps) => {
  const [previews, setPreviews] = useState<string[]>(existingImages)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length + previews.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} images allowed`,
        variant: 'destructive',
      })
      return
    }

    // Validate all files
    const invalidFiles = files.filter(file => !validateImageFile(file).valid)
    if (invalidFiles.length > 0) {
      toast({
        title: 'Invalid files',
        description: 'Some files are invalid. Please check file size and type.',
        variant: 'destructive',
      })
      return
    }

    // Create previews
    const newPreviews: string[] = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === files.length) {
          setPreviews([...previews, ...newPreviews])
          setSelectedFiles([...selectedFiles, ...files])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    const newFiles = selectedFiles.filter((_, i) => i !== (index - existingImages.length))
    setPreviews(newPreviews)
    setSelectedFiles(newFiles)
    onRemove?.(index)
  }

  return (
    <div className="space-y-4">
      <Label>Images ({previews.length}/{maxFiles})</Label>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative aspect-square border-2 border-gray-300 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => handleRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {previews.length < maxFiles && (
          <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
            <Label htmlFor="multiple-image-upload" className="cursor-pointer w-full h-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </Label>
          </div>
        )}
      </div>

      <Input
        id="multiple-image-upload"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

