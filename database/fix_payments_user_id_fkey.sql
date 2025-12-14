-- Fix payments.user_id foreign key constraint
-- The payments table references auth.users.id, but we use user_profiles.id
-- Remove the foreign key constraint to allow standalone user_profiles

-- Drop the existing foreign key constraint
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_user_id_fkey;

-- Note: We're not adding a new foreign key constraint to user_profiles
-- because user_profiles.id is standalone (not a foreign key to auth.users)
-- This allows the application to manage user IDs independently




