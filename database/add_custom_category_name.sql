-- Add custom category name support for vendors and listings
-- This allows vendors to specify custom category names when selecting "Other" category

-- Add custom category name to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS custom_category_name VARCHAR(255);

-- Add custom category name to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS custom_category_name VARCHAR(255);

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_vendors_custom_category ON vendors(custom_category_name) WHERE custom_category_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_custom_category ON listings(custom_category_name) WHERE custom_category_name IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN vendors.custom_category_name IS 'Custom category name when vendor_category_id is "other"';
COMMENT ON COLUMN listings.custom_category_name IS 'Custom category name when listing_category_id is "other"';

