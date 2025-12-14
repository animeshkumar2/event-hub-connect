# Supabase Storage Setup - Images & Videos

## Storage Overview

Supabase Storage is built on top of **S3-compatible object storage** and provides:
- File uploads (images, videos, documents)
- CDN delivery (fast global access)
- Public/private buckets
- Image transformations (resize, crop, etc.)

## Pricing

### Free Tier (Hobby Plan)
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **File size limit**: 50 MB per file
- **Good for**: Development, MVP, small projects

### Pro Tier ($25/month)
- **Storage**: 100 GB
- **Bandwidth**: 200 GB/month
- **File size limit**: 5 GB per file
- **Good for**: Production apps

## Storage Structure for Event Hub

### Recommended Bucket Structure

```
buckets/
├── vendor-images/          (Public)
│   ├── covers/            (Vendor cover images)
│   ├── portfolios/        (Portfolio images)
│   └── past-events/       (Past event gallery)
│
├── listing-images/        (Public)
│   ├── packages/          (Package images)
│   └── items/             (Individual item images)
│
├── user-uploads/          (Public)
│   ├── avatars/           (User profile pictures)
│   └── reviews/           (Review images)
│
└── documents/             (Private - optional)
    └── contracts/         (Order contracts, invoices)
```

## Setup Steps

### Step 1: Create Storage Buckets

In Supabase Dashboard:
1. Go to **Storage** (left sidebar)
2. Click **New bucket**
3. Create buckets:

**Bucket 1: `vendor-images`**
- Public: ✅ Yes
- File size limit: 5 MB (or 50 MB for free tier)
- Allowed MIME types: `image/*`

**Bucket 2: `listing-images`**
- Public: ✅ Yes
- File size limit: 5 MB
- Allowed MIME types: `image/*`

**Bucket 3: `user-uploads`**
- Public: ✅ Yes
- File size limit: 2 MB
- Allowed MIME types: `image/*`

### Step 2: Set Up Storage Policies (RLS)

Go to **Storage** → **Policies** for each bucket:

**Public Buckets (vendor-images, listing-images, user-uploads):**
```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'vendor-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'vendor-images' 
    AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'vendor-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 3: Upload Files via API

**JavaScript/TypeScript Example:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// Upload vendor cover image
const uploadVendorCover = async (vendorId: string, file: File) => {
  const { data, error } = await supabase.storage
    .from('vendor-images')
    .upload(`covers/${vendorId}/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('vendor-images')
    .getPublicUrl(data.path)
  
  return publicUrl
}

// Upload package image
const uploadPackageImage = async (packageId: string, file: File) => {
  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(`packages/${packageId}/${file.name}`, file)
  
  if (error) throw error
  
  return supabase.storage
    .from('listing-images')
    .getPublicUrl(data.path)
}
```

**Java/Spring Boot Example:**
```java
// Using Supabase Java client
@Service
public class StorageService {
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.key}")
    private String supabaseKey;
    
    public String uploadVendorImage(String vendorId, MultipartFile file) {
        // Use Supabase Java SDK or REST API
        // See: https://github.com/supabase/supabase-java
    }
}
```

## Database Schema Updates

### Update Listings Table

The `listings` table already has `images TEXT[]` field, which stores URLs:

```sql
-- Example: Store Supabase Storage URLs
UPDATE listings 
SET images = ARRAY[
  'https://xxx.supabase.co/storage/v1/object/public/listing-images/packages/p1/image1.jpg',
  'https://xxx.supabase.co/storage/v1/object/public/listing-images/packages/p1/image2.jpg'
]
WHERE id = 'p1';
```

### Update Vendors Table

```sql
-- Store cover image URL
UPDATE vendors
SET cover_image = 'https://xxx.supabase.co/storage/v1/object/public/vendor-images/covers/v1/cover.jpg'
WHERE id = 'v1';

-- Store portfolio images
UPDATE vendors
SET portfolio_images = ARRAY[
  'https://xxx.supabase.co/storage/v1/object/public/vendor-images/portfolios/v1/img1.jpg',
  'https://xxx.supabase.co/storage/v1/object/public/vendor-images/portfolios/v1/img2.jpg'
]
WHERE id = 'v1';
```

## Image Optimization

### Supabase Image Transformations

Supabase supports image transformations via URL parameters:

```typescript
// Resize image
const resizedUrl = `${publicUrl}?width=800&height=600&quality=80`

// Crop image
const croppedUrl = `${publicUrl}?width=400&height=400&resize=cover`

// Format conversion
const webpUrl = `${publicUrl}?format=webp`
```

### Client-Side Optimization (Before Upload)

```typescript
// Compress image before upload
const compressImage = async (file: File, maxWidth: number = 1920) => {
  return new Promise<File>((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: 'image/jpeg' }))
        }, 'image/jpeg', 0.8)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
```

## Best Practices

1. **Organize by ID**: Use vendor/listing IDs in folder structure
   ```
   vendor-images/covers/v1/cover.jpg
   listing-images/packages/p1/image1.jpg
   ```

2. **Compress Before Upload**: Reduce file size on client side

3. **Use CDN**: Supabase Storage includes CDN (automatic)

4. **Set Cache Headers**: Use `cacheControl` parameter

5. **Handle Errors**: Implement retry logic for failed uploads

6. **Validate File Types**: Only allow images/videos

7. **Limit File Size**: Enforce limits on client and server

## Cost Estimation

### MVP (Free Tier)
- 1 GB storage ≈ 500-1000 images (assuming 1-2 MB each)
- 2 GB bandwidth ≈ 2000-4000 image views/month
- **Cost**: $0/month ✅

### Growth (Pro Tier)
- 100 GB storage ≈ 50,000-100,000 images
- 200 GB bandwidth ≈ 200,000 image views/month
- **Cost**: $25/month

## Next Steps

1. ✅ Create storage buckets in Supabase Dashboard
2. ✅ Set up RLS policies
3. ✅ Update Java backend to handle file uploads
4. ✅ Update frontend to upload images
5. ✅ Store URLs in database (already have `images TEXT[]` fields)




