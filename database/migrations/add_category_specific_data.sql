-- Add category_specific_data column to listings table
-- This stores category-specific fields as JSON (e.g., serviceType, pricingType for photographers)

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS category_specific_data JSONB;

-- Add index for better query performance on category-specific data
CREATE INDEX IF NOT EXISTS idx_listings_category_specific_data 
ON listings USING GIN (category_specific_data);

-- Add comment
COMMENT ON COLUMN listings.category_specific_data IS 'Category-specific fields stored as JSON (e.g., serviceType, pricingType, durationHours for photographers)';
