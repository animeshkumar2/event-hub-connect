-- =====================================================
-- Add customization support to offers table
-- Allows customers to customize listings before making offers
-- =====================================================

-- Add customized_price column (price after customization, before negotiation)
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS customized_price DECIMAL(10,2);

-- Add customization JSONB column for flexible customization data
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS customization JSONB;

-- Add comments
COMMENT ON COLUMN offers.customized_price IS 'Price after customization but before negotiation (e.g., 200 plates instead of 100)';
COMMENT ON COLUMN offers.customization IS 'JSON object storing customization details: {quantity, unit, addOns, guestCount, etc.}';

-- Create index on customization for querying
CREATE INDEX IF NOT EXISTS idx_offers_customization ON offers USING GIN (customization);

-- Update existing offers to have customized_price = original_price (backward compatibility)
UPDATE offers 
SET customized_price = original_price 
WHERE customized_price IS NULL;

