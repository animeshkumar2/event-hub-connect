-- Vendor ID Debug Script
-- Run this in your PostgreSQL database to diagnose vendor_id issues

-- ============================================
-- STEP 1: Find your user account
-- ============================================
-- Replace 'your-email@example.com' with your actual email
SELECT 
    id as user_id,
    email,
    role,
    created_at
FROM users 
WHERE email = 'your-email@example.com';

-- Copy the user_id from the result above and use it in the next queries

-- ============================================
-- STEP 2: Check if vendor profile exists
-- ============================================
-- Replace '<user-id>' with the user_id from Step 1
SELECT 
    id as vendor_id,
    user_id,
    business_name,
    email,
    category_id,
    is_verified,
    created_at
FROM vendors 
WHERE user_id = '<user-id>';

-- ============================================
-- STEP 3: Check for orphaned vendor profiles
-- ============================================
-- This finds vendor profiles that don't have a matching user
SELECT 
    v.id as vendor_id,
    v.user_id,
    v.business_name,
    v.email,
    u.id as actual_user_id,
    u.email as actual_user_email
FROM vendors v
LEFT JOIN users u ON v.user_id = u.id
WHERE u.id IS NULL;

-- ============================================
-- STEP 4: Check for duplicate vendor profiles
-- ============================================
-- This finds users with multiple vendor profiles
SELECT 
    user_id,
    COUNT(*) as vendor_count,
    STRING_AGG(id::text, ', ') as vendor_ids
FROM vendors
GROUP BY user_id
HAVING COUNT(*) > 1;

-- ============================================
-- FIX 1: Create vendor profile if missing
-- ============================================
-- Only run this if Step 2 returned no results
-- Replace values with your actual data
/*
INSERT INTO vendors (
    id, 
    user_id, 
    business_name, 
    email, 
    category_id, 
    is_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '<user-id-from-step-1>',
    'Your Business Name',
    'your-email@example.com',
    'caterer',  -- Change to your category: caterer, photographer, venue, decorator, mua, dj-entertainment, sound-lights, other
    false,
    NOW(),
    NOW()
);
*/

-- After creating, get the vendor_id:
-- SELECT id FROM vendors WHERE user_id = '<user-id-from-step-1>';

-- ============================================
-- FIX 2: Update user_id if mismatch
-- ============================================
-- Only run this if the user_id in vendors table doesn't match your JWT token
/*
UPDATE vendors 
SET user_id = '<correct-user-id-from-jwt>',
    updated_at = NOW()
WHERE id = '<vendor-id>';
*/

-- ============================================
-- FIX 3: Delete duplicate vendor profiles
-- ============================================
-- Only run this if Step 4 found duplicates
-- Keep the most recent one, delete others
/*
DELETE FROM vendors 
WHERE id = '<vendor-id-to-delete>';
*/

-- ============================================
-- VERIFICATION: Check everything is correct
-- ============================================
-- Replace with your user_id
SELECT 
    u.id as user_id,
    u.email as user_email,
    u.role,
    v.id as vendor_id,
    v.business_name,
    v.category_id,
    v.is_verified
FROM users u
LEFT JOIN vendors v ON u.id = v.user_id
WHERE u.email = 'your-email@example.com';

-- Expected result:
-- - user_id should match what's in your JWT token
-- - vendor_id should match what's in localStorage
-- - role should be 'VENDOR'
-- - vendor_id should NOT be null
