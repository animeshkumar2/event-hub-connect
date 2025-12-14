-- Add Google OAuth support to user_profiles table
-- Run this migration to enable Google Sign-In

-- Add google_id column to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- Create index for faster lookups by google_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_id ON user_profiles(google_id) WHERE google_id IS NOT NULL;

-- Make password_hash optional (for Google-only users)
-- The password_hash is already nullable, but ensuring it here
ALTER TABLE user_profiles ALTER COLUMN password_hash DROP NOT NULL;




