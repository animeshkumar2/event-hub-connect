-- Migration: Update vendor_past_events table to support multiple images and description
-- This migration updates the vendor_past_events table to support:
-- 1. Multiple images (using a separate table)
-- 2. Description field for event details
-- 3. Order reference for linking completed events to orders

-- Step 1: Create new table for event images (many-to-many relationship)
CREATE TABLE IF NOT EXISTS vendor_past_event_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES vendor_past_events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Migrate existing single image to new images table
INSERT INTO vendor_past_event_images (event_id, image_url)
SELECT id, image
FROM vendor_past_events
WHERE image IS NOT NULL AND image != '';

-- Step 3: Add new columns to vendor_past_events
ALTER TABLE vendor_past_events 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Step 4: Drop the old single image column (optional - comment out if you want to keep it for backward compatibility)
-- ALTER TABLE vendor_past_events DROP COLUMN IF EXISTS image;

-- Step 5: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_vendor_past_event_images_event_id ON vendor_past_event_images(event_id);
CREATE INDEX IF NOT EXISTS idx_vendor_past_events_order_id ON vendor_past_events(order_id);
