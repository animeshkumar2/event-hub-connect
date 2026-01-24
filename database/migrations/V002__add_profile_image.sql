-- Add profile_image column to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add comment
COMMENT ON COLUMN vendors.profile_image IS 'Profile picture/avatar for the vendor';
