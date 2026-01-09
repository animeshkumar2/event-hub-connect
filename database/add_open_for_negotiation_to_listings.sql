-- =====================================================
-- Add open_for_negotiation field to listings table
-- Allows vendors to enable/disable negotiation feature per listing
-- =====================================================

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS open_for_negotiation BOOLEAN DEFAULT TRUE;

-- Add comment
COMMENT ON COLUMN listings.open_for_negotiation IS 'If true, customers can make offers/negotiate on this listing';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_listings_open_for_negotiation ON listings(open_for_negotiation) WHERE open_for_negotiation = TRUE;

-- =====================================================
-- Update all existing listings to be open for negotiation
-- This ensures all listings allow offers by default
-- =====================================================

UPDATE listings 
SET open_for_negotiation = TRUE 
WHERE open_for_negotiation IS NULL OR open_for_negotiation = FALSE;

-- Verify the update
SELECT 
    COUNT(*) as total_listings,
    COUNT(*) FILTER (WHERE open_for_negotiation = TRUE) as open_for_negotiation_count,
    COUNT(*) FILTER (WHERE open_for_negotiation = FALSE) as closed_for_negotiation_count,
    COUNT(*) FILTER (WHERE open_for_negotiation IS NULL) as null_count
FROM listings;

