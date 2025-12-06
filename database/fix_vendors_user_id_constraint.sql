-- Fix vendors table to work standalone without Supabase Auth
-- Remove foreign key constraint to auth.users since we're managing users ourselves

-- Step 1: Drop the foreign key constraint
ALTER TABLE vendors 
DROP CONSTRAINT IF EXISTS vendors_user_id_fkey;

-- Step 2: The user_id column will now be a standalone UUID column
-- No changes needed to the column definition, just removing the FK constraint

-- Note: This allows us to create vendors with any UUID for user_id
-- The user_id will come from our own user_profiles table

