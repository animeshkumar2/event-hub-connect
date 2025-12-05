-- Remove foreign key constraint to auth.users since we're not using Supabase Auth
-- The user_profiles table should be standalone for this application

-- Drop the foreign key constraint
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Note: The id column will remain as UUID PRIMARY KEY, but won't reference auth.users anymore
-- This allows us to create user profiles independently without needing Supabase Auth

