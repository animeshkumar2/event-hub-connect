-- Add new columns to listings table for enhanced package features

-- Highlights - key features shown at top of listing
ALTER TABLE listings ADD COLUMN IF NOT EXISTS highlights TEXT[];

-- Included item IDs - references to actual item listings in this package
ALTER TABLE listings ADD COLUMN IF NOT EXISTS included_item_ids UUID[];

-- Extra charges in JSON format for detailed pricing
ALTER TABLE listings ADD COLUMN IF NOT EXISTS extra_charges_json JSONB;

-- Add index for faster lookup of packages containing specific items
CREATE INDEX IF NOT EXISTS idx_listings_included_item_ids ON listings USING GIN (included_item_ids);

-- Comment on new columns
COMMENT ON COLUMN listings.highlights IS 'Key features/highlights shown at top of listing page';
COMMENT ON COLUMN listings.included_item_ids IS 'UUIDs of item listings included in this package';
COMMENT ON COLUMN listings.extra_charges_json IS 'JSON array of extra charges: [{"name": "...", "price": 10000}]';



