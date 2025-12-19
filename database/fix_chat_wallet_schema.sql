-- =====================================================
-- Fix ChatThread and VendorWallet Schema Issues
-- =====================================================

-- 1. Add missing columns to chat_threads table
ALTER TABLE chat_threads 
ADD COLUMN IF NOT EXISTS is_read_by_vendor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_read_by_user BOOLEAN DEFAULT false;

-- 2. Migrate data from unread_count to boolean flags if needed
UPDATE chat_threads 
SET is_read_by_vendor = (unread_count = 0),
    is_read_by_user = true
WHERE is_read_by_vendor IS NULL;

-- 3. Verify vendor_wallets table structure
-- The table should already exist with the correct structure
-- Just ensure it has all required columns

-- Optional: View current table structure
-- \d chat_threads
-- \d vendor_wallets








