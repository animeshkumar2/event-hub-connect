-- Fix cart_items foreign key constraint
-- Remove foreign key to auth.users since we manage users ourselves via user_profiles
-- Note: We're not adding a new foreign key constraint to user_profiles
-- because user_profiles.id is standalone (not a foreign key to auth.users)

-- Drop the existing foreign key constraint
ALTER TABLE cart_items 
DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;

-- Also fix other tables that might have the same issue
-- Orders table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
        -- Note: Not adding new foreign key - user_profiles.id is standalone
    END IF;
END $$;

-- Payments table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
        -- Note: We're not adding a new foreign key constraint to user_profiles
        -- because user_profiles.id is standalone (not a foreign key to auth.users)
        -- This allows the application to manage user IDs independently
    END IF;
END $$;

-- Leads table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_user_id_fkey;
        -- Note: Not adding new foreign key - user_profiles.id is standalone
    END IF;
END $$;

-- Reviews table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
        ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
        -- Note: Not adding new foreign key - user_profiles.id is standalone
    END IF;
END $$;

-- Chat messages table (only if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;
        -- Note: Not adding new foreign key - user_profiles.id is standalone
    END IF;
END $$;

