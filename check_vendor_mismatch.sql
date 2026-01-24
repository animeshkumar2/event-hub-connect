-- Check for user_id mismatch between JWT and database
-- JWT user_id: 8b9e71f7-acea-4bf7-a8c7-db3cd98974a2
-- Vendor ID: f55faea7-d629-4a1d-9786-2923c5b7ca7f

-- Check if vendor exists with this ID
SELECT 
    id as vendor_id,
    user_id,
    business_name,
    email
FROM vendors 
WHERE id = 'f55faea7-d629-4a1d-9786-2923c5b7ca7f';

-- Check if vendor exists with this user_id
SELECT 
    id as vendor_id,
    user_id,
    business_name,
    email
FROM vendors 
WHERE user_id = '8b9e71f7-acea-4bf7-a8c7-db3cd98974a2';

-- If the above two queries return different results, there's a mismatch!
-- The fix is to update the vendor's user_id:
-- UPDATE vendors 
-- SET user_id = '8b9e71f7-acea-4bf7-a8c7-db3cd98974a2'
-- WHERE id = 'f55faea7-d629-4a1d-9786-2923c5b7ca7f';
