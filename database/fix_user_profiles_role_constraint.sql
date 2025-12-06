-- Fix user_profiles role constraint to allow uppercase enum values
-- The Java enum uses CUSTOMER, VENDOR, ADMIN (uppercase)
-- but the database constraint only allows lowercase

-- Step 1: Drop the existing constraint
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Step 2: Add new constraint that allows both uppercase and lowercase
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('customer', 'vendor', 'admin', 'CUSTOMER', 'VENDOR', 'ADMIN'));

-- Alternative: If you want to only allow uppercase (matching Java enum)
-- ALTER TABLE user_profiles 
-- ADD CONSTRAINT user_profiles_role_check 
-- CHECK (role IN ('CUSTOMER', 'VENDOR', 'ADMIN'));

