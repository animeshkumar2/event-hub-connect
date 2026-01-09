-- Add password_hash column to user_profiles table
-- This allows the application to store hashed passwords for authentication

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.password_hash IS 'BCrypt hashed password for user authentication';










