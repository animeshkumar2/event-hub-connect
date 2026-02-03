-- Migration: Add custom_event_type_name to listings table
-- Purpose: Allow vendors to specify custom event types when selecting "Other"
-- This helps us:
-- 1. Not limit vendors to predefined event types
-- 2. Collect data on commonly requested event types
-- 3. Potentially promote popular custom types to official event types in the future

-- Add custom_event_type_name column to listings
-- Stores as JSON array string, e.g., '["Haldi", "Mehendi", "Sangeet"]'
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS custom_event_type_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN listings.custom_event_type_name IS 'Custom event type names (JSON array) when vendor selects "Other" event type. Used for analytics and future event type additions.';

-- Create index for analytics queries (find common custom event types)
CREATE INDEX IF NOT EXISTS idx_listings_custom_event_type 
ON listings (custom_event_type_name) 
WHERE custom_event_type_name IS NOT NULL;

-- Example query to find most common custom event types (for future reference):
-- SELECT custom_event_type_name, COUNT(*) as count 
-- FROM listings 
-- WHERE custom_event_type_name IS NOT NULL 
-- GROUP BY custom_event_type_name 
-- ORDER BY count DESC;
