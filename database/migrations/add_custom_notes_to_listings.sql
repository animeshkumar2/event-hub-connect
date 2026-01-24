-- Add custom_notes column to listings table
-- This field stores additional notes, terms, customization options, etc.

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS custom_notes TEXT;

COMMENT ON COLUMN listings.custom_notes IS 'Additional notes, terms, customization options, or any other details vendors want to share with customers';
