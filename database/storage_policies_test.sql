-- =====================================================
-- Supabase Storage RLS Policies - TEST VERSION
-- Allows anonymous uploads for testing
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view vendor images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vendor images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own vendor images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own vendor images" ON storage.objects;

DROP POLICY IF EXISTS "Public can view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own listing images" ON storage.objects;

DROP POLICY IF EXISTS "Public can view user uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;

-- =====================================================
-- 1. VENDOR-IMAGES BUCKET POLICIES (TEST - Allows Anonymous)
-- =====================================================

-- Allow public read access (anyone can view images)
CREATE POLICY "Public can view vendor images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-images');

-- Allow ANYONE to upload (for testing - remove auth requirement)
CREATE POLICY "Anyone can upload vendor images (TEST)"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vendor-images');

-- Allow anyone to update (for testing)
CREATE POLICY "Anyone can update vendor images (TEST)"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vendor-images');

-- Allow anyone to delete (for testing)
CREATE POLICY "Anyone can delete vendor images (TEST)"
ON storage.objects FOR DELETE
USING (bucket_id = 'vendor-images');

-- =====================================================
-- 2. LISTING-IMAGES BUCKET POLICIES (TEST - Allows Anonymous)
-- =====================================================

-- Allow public read access
CREATE POLICY "Public can view listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Allow ANYONE to upload (for testing)
CREATE POLICY "Anyone can upload listing images (TEST)"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-images');

-- Allow anyone to update (for testing)
CREATE POLICY "Anyone can update listing images (TEST)"
ON storage.objects FOR UPDATE
USING (bucket_id = 'listing-images');

-- Allow anyone to delete (for testing)
CREATE POLICY "Anyone can delete listing images (TEST)"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing-images');

-- =====================================================
-- 3. USER-UPLOADS BUCKET POLICIES (TEST - Allows Anonymous)
-- =====================================================

-- Allow public read access
CREATE POLICY "Public can view user uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads');

-- Allow ANYONE to upload (for testing)
CREATE POLICY "Anyone can upload (TEST)"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-uploads');

-- Allow anyone to update (for testing)
CREATE POLICY "Anyone can update uploads (TEST)"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user-uploads');

-- Allow anyone to delete (for testing)
CREATE POLICY "Anyone can delete uploads (TEST)"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-uploads');

-- =====================================================
-- END OF TEST POLICIES
-- =====================================================
-- 
-- ⚠️ WARNING: These policies allow anonymous uploads!
-- For production, use storage_policies.sql instead
-- which requires authentication.











