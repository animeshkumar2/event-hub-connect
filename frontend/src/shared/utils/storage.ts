import { API_BASE_URL } from '@/shared/services/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Upload a single image to R2 via backend
 * @param file - File object to upload
 * @param folder - Folder path (e.g., 'vendors/profiles', 'listings/items')
 * @returns Public URL of uploaded image
 */
export const uploadImage = async (
  file: File,
  folder: string = 'uploads'
): Promise<string> => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to upload image');
  }

  console.log('Image uploaded:', data.url);
  return data.url;
};

/**
 * Upload multiple images to R2 via backend
 * @param files - Array of File objects
 * @param folder - Folder path
 * @returns Array of public URLs
 */
export const uploadMultipleImages = async (
  files: File[],
  folder: string = 'uploads'
): Promise<string[]> => {
  // Validate all files first
  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(`${file.name}: ${validation.error}`);
    }
  }

  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('folder', folder);

  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/images`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload images');
  }

  if (data.errors && data.errors.length > 0) {
    console.warn('Some images failed to upload:', data.errors);
  }

  console.log(`Uploaded ${data.uploadedCount}/${data.totalCount} images`);
  return data.urls;
};

/**
 * Upload vendor profile image
 */
export const uploadVendorProfileImage = async (
  vendorId: string,
  file: File
): Promise<string> => {
  return uploadImage(file, `vendors/${vendorId}/profile`);
};

/**
 * Upload vendor cover image
 */
export const uploadVendorCover = async (
  vendorId: string,
  file: File
): Promise<string> => {
  return uploadImage(file, `vendors/${vendorId}/cover`);
};

/**
 * Upload vendor portfolio images
 */
export const uploadVendorPortfolio = async (
  vendorId: string,
  file: File,
  index: number
): Promise<string> => {
  return uploadImage(file, `vendors/${vendorId}/portfolio`);
};

/**
 * Upload vendor portfolio images (multiple)
 */
export const uploadVendorPortfolioImages = async (
  vendorId: string,
  files: File[]
): Promise<string[]> => {
  return uploadMultipleImages(files, `vendors/${vendorId}/portfolio`);
};

/**
 * Upload listing images
 */
export const uploadListingImage = async (
  listingId: string,
  file: File,
  index: number,
  type: 'package' | 'item' = 'item'
): Promise<string> => {
  return uploadImage(file, `listings/${type}/${listingId}`);
};

/**
 * Upload listing images (multiple)
 */
export const uploadListingImages = async (
  listingId: string,
  files: File[],
  type: 'package' | 'item' = 'item'
): Promise<string[]> => {
  return uploadMultipleImages(files, `listings/${type}/${listingId}`);
};

/**
 * Delete an image via backend
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  console.log('🗑️ deleteImage called with:', imageUrl);
  
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/image?url=${encodeURIComponent(imageUrl)}`, {
    method: 'DELETE',
    headers,
  });

  const data = await response.json();
  console.log('🗑️ deleteImage response:', data);

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete image');
  }
};

/**
 * Delete multiple images (for cleanup on save)
 * Silently fails for individual images - doesn't throw
 */
export const deleteImages = async (imageUrls: string[]): Promise<{ deleted: string[]; failed: string[] }> => {
  const deleted: string[] = [];
  const failed: string[] = [];
  
  for (const url of imageUrls) {
    try {
      await deleteImage(url);
      deleted.push(url);
    } catch (error) {
      console.warn('Failed to delete image:', url, error);
      failed.push(url);
    }
  }
  
  return { deleted, failed };
};

/**
 * Allowed image types (SVG blocked for security)
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
];

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Block SVG (security risk - can contain scripts)
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return { valid: false, error: 'SVG files are not allowed. Please use JPG, PNG, WebP, or GIF.' };
  }

  // Check if it's an allowed type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported image format. Use JPG, PNG, WebP, or GIF.' };
  }

  // Check file size (5MB limit - backend will compress)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 5MB' };
  }

  return { valid: true };
};

// Legacy exports for backward compatibility
export const STORAGE_BUCKETS = {
  VENDOR_IMAGES: 'vendor-images',
  LISTING_IMAGES: 'listing-images',
};
