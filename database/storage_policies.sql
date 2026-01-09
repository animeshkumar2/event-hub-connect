-- =====================================================
-- Supabase Storage RLS Policies
-- Run this AFTER creating buckets
-- =====================================================

-- =====================================================
-- 1. VENDOR-IMAGES BUCKET POLICIES
-- =====================================================

-- Allow public read access (anyone can view images)
CREATE POLICY "Public can view vendor images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-images');

-- Allow authenticated users to upload (only logged-in users)
CREATE POLICY "Authenticated users can upload vendor images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files (optional - for replacing images)
CREATE POLICY "Users can update own vendor images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vendor-images'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own vendor images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-images'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- 2. LISTING-IMAGES BUCKET POLICIES
-- =====================================================

-- Allow public read access
CREATE POLICY "Public can view listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Users can update own listing images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listing-images'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own listing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-images'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- 3. USER-UPLOADS BUCKET POLICIES
-- =====================================================

-- Allow public read access
CREATE POLICY "Public can view user uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-uploads'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-uploads'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- END OF POLICIES
-- =====================================================











