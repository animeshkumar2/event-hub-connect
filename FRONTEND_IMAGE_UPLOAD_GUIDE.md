# Frontend Image Upload Setup Guide

## ✅ Step 1: Install Supabase Client

Run in your terminal:
```bash
npm install @supabase/supabase-js
```

---

## ✅ Step 2: Set Up Supabase Storage Buckets

### In Supabase Dashboard:

1. **Go to Storage** (left sidebar)
2. **Click "New bucket"**

**Create 3 buckets:**

#### Bucket 1: `vendor-images`
- **Public**: ✅ Yes (check this box)
- **File size limit**: 5 MB (or leave blank for default)
- **Allowed MIME types**: `image/*` (or leave blank for all)
- Click **Create bucket**

#### Bucket 2: `listing-images`
- **Public**: ✅ Yes
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/*`
- Click **Create bucket**

#### Bucket 3: `user-uploads`
- **Public**: ✅ Yes
- **File size limit**: 2 MB
- **Allowed MIME types**: `image/*`
- Click **Create bucket**

---

## ✅ Step 3: Get Supabase Credentials

1. **Go to Settings** → **API** (in Supabase Dashboard)
2. **Copy these values:**
   - **Project URL**: `https://xxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ✅ Step 4: Create Environment File

Create `.env` file in project root:

```bash
# .env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** 
- Replace `your-project-id` with your actual Supabase project ID
- Replace `your-anon-key-here` with your actual anon key
- Don't commit `.env` to git (already in `.gitignore`)

---

## ✅ Step 5: Files Created (Already Done!)

I've created these files for you:

1. ✅ `src/lib/supabase.ts` - Supabase client configuration
2. ✅ `src/utils/storage.ts` - Upload utility functions
3. ✅ `src/components/ImageUpload.tsx` - Reusable upload components

---

## ✅ Step 6: Use Image Upload Component

### Example 1: Upload Vendor Cover Image

```typescript
import { useState } from 'react'
import { ImageUpload } from '@/components/ImageUpload'
import { uploadVendorCover } from '@/utils/storage'
import { Button } from '@/components/ui/button'

const VendorCoverUpload = ({ vendorId }: { vendorId: string }) => {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Upload to Supabase Storage
      const url = await uploadVendorCover(vendorId, selectedFile)
      
      // Save URL to database (you'll do this via API later)
      console.log('Image uploaded:', url)
      setImageUrl(url)
      
      // TODO: Call your backend API to save URL
      // await fetch(`/api/vendors/${vendorId}`, {
      //   method: 'PUT',
      //   body: JSON.stringify({ cover_image: url })
      // })
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <ImageUpload
        label="Vendor Cover Image"
        existingImageUrl={imageUrl}
        onUploadComplete={(url) => {
          setImageUrl(url)
          // Auto-upload when file selected
          handleUpload()
        }}
      />
      
      {selectedFile && (
        <Button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      )}
    </div>
  )
}
```

### Example 2: Upload Package Images (Multiple)

```typescript
import { MultipleImageUpload } from '@/components/ImageUpload'
import { uploadMultipleImages, STORAGE_BUCKETS } from '@/utils/storage'

const PackageImageUpload = ({ packageId }: { packageId: string }) => {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (files: File[]) => {
    setUploading(true)
    try {
      // Upload all images
      const urls = await uploadMultipleImages(
        files,
        STORAGE_BUCKETS.LISTING_IMAGES,
        `packages/${packageId}`
      )
      
      setImageUrls(urls)
      
      // TODO: Save URLs to database
      console.log('Images uploaded:', urls)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <MultipleImageUpload
      existingImages={imageUrls}
      maxFiles={10}
      onUploadComplete={handleUpload}
    />
  )
}
```

---

## ✅ Step 7: Test Upload

### Quick Test Component

Add this to any page to test:

```typescript
// TestUpload.tsx
import { useState } from 'react'
import { ImageUpload } from '@/components/ImageUpload'
import { uploadVendorCover } from '@/utils/storage'
import { Button } from '@/components/ui/button'

export const TestUpload = () => {
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleUpload = async () => {
    if (!file) return
    
    try {
      const uploadedUrl = await uploadVendorCover('test-vendor-id', file)
      setUrl(uploadedUrl)
      alert('Upload successful! URL: ' + uploadedUrl)
    } catch (error) {
      alert('Upload failed: ' + error)
    }
  }

  return (
    <div className="p-8">
      <h2>Test Image Upload</h2>
      <ImageUpload
        onUploadComplete={(url) => {
          setUrl(url)
          // Get file from input
          const input = document.querySelector('input[type="file"]') as HTMLInputElement
          if (input?.files?.[0]) {
            setFile(input.files[0])
          }
        }}
      />
      <Button onClick={handleUpload} className="mt-4">
        Upload Test Image
      </Button>
      {url && (
        <div className="mt-4">
          <p>Uploaded URL:</p>
          <img src={url} alt="Uploaded" className="max-w-md" />
        </div>
      )}
    </div>
  )
}
```

---

## 🎯 Complete Flow Example

### Full Example: Vendor Profile Image Upload

```typescript
import { useState } from 'react'
import { ImageUpload } from '@/components/ImageUpload'
import { uploadVendorCover } from '@/utils/storage'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const VendorProfileForm = ({ vendorId }: { vendorId: string }) => {
  const [coverImage, setCoverImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
  }

  const handleSave = async () => {
    if (!selectedFile) {
      toast({
        title: 'No image selected',
        description: 'Please select an image first',
      })
      return
    }

    setUploading(true)
    try {
      // Step 1: Upload to Supabase Storage
      const imageUrl = await uploadVendorCover(vendorId, selectedFile)
      
      // Step 2: Save URL to database (via API - you'll implement this)
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_image: imageUrl }),
      })

      if (!response.ok) throw new Error('Failed to save')

      setCoverImage(imageUrl)
      toast({
        title: 'Success!',
        description: 'Cover image uploaded successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <ImageUpload
        label="Vendor Cover Image"
        existingImageUrl={coverImage}
        onUploadComplete={(url) => {
          // This fires when file is selected
          const input = document.querySelector('input[type="file"]') as HTMLInputElement
          if (input?.files?.[0]) {
            handleFileSelected(input.files[0])
          }
        }}
      />
      
      <Button onClick={handleSave} disabled={uploading || !selectedFile}>
        {uploading ? 'Uploading...' : 'Save Cover Image'}
      </Button>
    </div>
  )
}
```

---

## 📋 Checklist

- [ ] Install `@supabase/supabase-js`
- [ ] Create storage buckets in Supabase Dashboard
- [ ] Get Supabase credentials (URL + anon key)
- [ ] Create `.env` file with credentials
- [ ] Test upload with test component
- [ ] Integrate into vendor profile page
- [ ] Integrate into package/listing forms

---

## 🐛 Troubleshooting

### Error: "Failed to upload image"
- Check Supabase URL and key in `.env`
- Verify bucket exists and is public
- Check file size (max 5MB for free tier)

### Error: "Bucket not found"
- Make sure bucket name matches exactly: `vendor-images`, `listing-images`
- Check bucket is created in Supabase Dashboard

### Images not displaying
- Verify bucket is set to **Public**
- Check URL format: `https://xxx.supabase.co/storage/v1/object/public/bucket-name/path`

---

## 🎉 Next Steps

1. Test upload with test component
2. Integrate into `VendorProfile.tsx`
3. Integrate into `VendorListings.tsx` for package images
4. Later: Connect to backend API to save URLs to database





