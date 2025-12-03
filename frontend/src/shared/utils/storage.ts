import { supabase, STORAGE_BUCKETS } from '@/shared/lib/supabase'

// Check if Supabase is configured
if (!supabase) {
  console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file')
}

/**
 * Upload a single image to Supabase Storage
 * @param file - File object to upload
 * @param bucket - Storage bucket name
 * @param path - Path within bucket (e.g., 'covers/v1/cover.jpg')
 * @returns Public URL of uploaded image
 */
export const uploadImage = async (
  file: File,
  bucket: string,
  path: string
): Promise<string> => {
  if (!supabase) {
    const errorMsg = 'Supabase not configured. Please check: 1) Install @supabase/supabase-js, 2) Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file'
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  try {
    console.log('Starting upload...', { bucket, path, fileSize: file.size, fileName: file.name })
    
    // 1. Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      })

    if (error) {
      console.error('Supabase upload error:', error)
      
      // Provide more helpful error messages
      if (error.message.includes('Bucket not found')) {
        throw new Error(`Bucket "${bucket}" not found. Please create it in Supabase Dashboard → Storage.`)
      } else if (error.message.includes('new row violates row-level security')) {
        throw new Error(`Permission denied. Check RLS policies for bucket "${bucket}" in Supabase Dashboard.`)
      } else if (error.message.includes('JWT')) {
        throw new Error('Invalid Supabase credentials. Check your VITE_SUPABASE_ANON_KEY in .env file.')
      } else {
        throw new Error(`Upload failed: ${error.message}`)
      }
    }

    if (!data) {
      throw new Error('Upload succeeded but no data returned')
    }

    console.log('Upload successful:', data)

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    console.log('Public URL:', publicUrl)
    return publicUrl
  } catch (error: any) {
    console.error('Image upload failed:', error)
    
    // Handle network errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Network error. Check: 1) Internet connection, 2) Supabase URL is correct, 3) CORS is enabled in Supabase Dashboard')
    }
    
    // Re-throw with original message if it's already a helpful error
    if (error.message && !error.message.includes('Failed to fetch')) {
      throw error
    }
    
    throw new Error(error.message || 'Failed to upload image. Check browser console for details.')
  }
}

/**
 * Upload vendor cover image
 */
export const uploadVendorCover = async (
  vendorId: string,
  file: File
): Promise<string> => {
  const fileName = `cover-${Date.now()}.${file.name.split('.').pop()}`
  const path = `covers/${vendorId}/${fileName}`
  return uploadImage(file, STORAGE_BUCKETS.VENDOR_IMAGES, path)
}

/**
 * Upload vendor portfolio images
 */
export const uploadVendorPortfolio = async (
  vendorId: string,
  file: File,
  index: number
): Promise<string> => {
  const fileName = `portfolio-${index}-${Date.now()}.${file.name.split('.').pop()}`
  const path = `portfolios/${vendorId}/${fileName}`
  return uploadImage(file, STORAGE_BUCKETS.VENDOR_IMAGES, path)
}

/**
 * Upload package/listing images
 */
export const uploadListingImage = async (
  listingId: string,
  file: File,
  index: number,
  type: 'package' | 'item' = 'package'
): Promise<string> => {
  const fileName = `image-${index}-${Date.now()}.${file.name.split('.').pop()}`
  const folder = type === 'package' ? 'packages' : 'items'
  const path = `${folder}/${listingId}/${fileName}`
  return uploadImage(file, STORAGE_BUCKETS.LISTING_IMAGES, path)
}

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (
  files: File[],
  bucket: string,
  basePath: string
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const fileName = `${basePath}/image-${index}-${Date.now()}.${file.name.split('.').pop()}`
    return uploadImage(file, bucket, fileName)
  })

  return Promise.all(uploadPromises)
}

/**
 * Delete an image from Supabase Storage
 */
export const deleteImage = async (
  bucket: string,
  path: string
): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Delete error:', error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' }
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 5MB' }
  }

  return { valid: true }
}

