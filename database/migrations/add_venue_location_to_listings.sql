-- Add venue-specific location fields to listings table
-- These fields are used ONLY for venue category listings
-- Other categories use vendor profile location for search

-- Add venue location columns
ALTER TABLE listings ADD COLUMN IF NOT EXISTS venue_address TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS venue_city VARCHAR(100);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS venue_latitude DECIMAL(10, 8);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS venue_longitude DECIMAL(11, 8);

-- Add index for geo queries on venue listings
CREATE INDEX IF NOT EXISTS idx_listings_venue_geo 
ON listings(venue_latitude, venue_longitude) 
WHERE listing_category_id = 'venue' AND venue_latitude IS NOT NULL;

-- Add index for city-based filtering
CREATE INDEX IF NOT EXISTS idx_listings_venue_city 
ON listings(venue_city) 
WHERE listing_category_id = 'venue' AND venue_city IS NOT NULL;

COMMENT ON COLUMN listings.venue_address IS 'Full address of the venue (for display)';
COMMENT ON COLUMN listings.venue_city IS 'City where venue is located';
COMMENT ON COLUMN listings.venue_latitude IS 'Latitude for geo-search (venue category only)';
COMMENT ON COLUMN listings.venue_longitude IS 'Longitude for geo-search (venue category only)';
