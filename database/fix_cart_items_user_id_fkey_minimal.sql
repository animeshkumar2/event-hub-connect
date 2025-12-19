-- Minimal fix: Only fix cart_items table (the immediate issue)
-- This is safe to run even if other tables don't exist yet

-- Drop the existing foreign key constraint
ALTER TABLE cart_items 
DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;

-- Add new foreign key constraint pointing to user_profiles
ALTER TABLE cart_items 
ADD CONSTRAINT cart_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;








