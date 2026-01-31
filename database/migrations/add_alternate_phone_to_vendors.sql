-- Add alternate_phone column to vendors table
-- This is an optional field for vendors to add a secondary contact number
-- It is NOT used for login/authentication

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20);

-- Add comment to clarify the field's purpose
COMMENT ON COLUMN vendors.alternate_phone IS 'Optional alternate contact number - not used for authentication';
