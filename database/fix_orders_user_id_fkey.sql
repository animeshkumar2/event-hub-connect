-- Fix orders foreign key constraint to reference user_profiles instead of auth.users
-- This is needed because we're managing users ourselves, not using Supabase Auth

-- Drop the existing foreign key constraint
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Add new foreign key constraint pointing to user_profiles
ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;








