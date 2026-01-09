-- Fix offers.user_id foreign key to point to user_profiles.id
-- Run this in your PostgreSQL database

-- Drop the existing FK constraint (currently points to users table)
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_user_id_fkey;

-- Recreate FK to user_profiles(id) which is the actual user table in the app
ALTER TABLE offers
ADD CONSTRAINT offers_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Optional: verify constraint
SELECT conname, confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conname = 'offers_user_id_fkey';

