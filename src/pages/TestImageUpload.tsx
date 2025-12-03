import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadVendorCover } from '@/utils/storage'
import { useToast } from '@/hooks/use-toast'
import { Upload, CheckCircle, Copy } from 'lucide-react'

export default function TestImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select an image first',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)
    try {
      console.log('Starting upload...', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type
      })

      // Upload to Supabase Storage
      // Using a test vendor ID - replace with actual vendor ID later
      const url = await uploadVendorCover('test-vendor-id', selectedFile)
      
      // ✅ THIS IS WHERE YOU GET THE URL!
      setImageUrl(url)
      
      toast({
        title: 'Upload successful!',
        description: 'Image uploaded to Supabase Storage',
      })
      
      console.log('✅ Image URL:', url) // Also log to console
    } catch (error: any) {
      console.error('❌ Upload error:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image. Check browser console for details.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl)
      toast({
        title: 'Copied!',
        description: 'Image URL copied to clipboard',
      })
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Image Upload to Supabase Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Selection */}
            <div className="space-y-2">
              <Label>Select Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <p className="text-sm text-muted-foreground">
                Max size: 5MB | Formats: JPG, PNG, WebP
              </p>
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload to Supabase Storage
                </>
              )}
            </Button>

            {/* Image URL Display */}
            {imageUrl && (
              <div className="space-y-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Label className="text-green-800 dark:text-green-200">
                    Upload Successful!
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Image URL:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={imageUrl}
                      readOnly
                      className="font-mono text-xs bg-background"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    ✅ This URL is stored in Supabase Storage
                    <br />
                    ✅ You can use this URL in &lt;img src="..."&gt; tags
                    <br />
                    ✅ Copy this URL to save in your database
                  </p>
                </div>

                {/* Display Uploaded Image */}
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-semibold">Uploaded Image:</Label>
                  <div className="border-2 border-border rounded-lg p-4 bg-background">
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                      onError={() => {
                        toast({
                          title: 'Image load error',
                          description: 'Could not load image from URL',
                          variant: 'destructive',
                        })
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-semibold">How to test:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Select an image file (JPG, PNG, etc.)</li>
                <li>Click "Upload to Supabase Storage"</li>
                <li>Wait for upload to complete</li>
                <li>Copy the Image URL that appears</li>
                <li>Use this URL in your database or &lt;img&gt; tags</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

