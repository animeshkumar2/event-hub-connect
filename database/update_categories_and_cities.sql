-- =====================================================
-- Update Categories and Cities
-- 1. Merge cinematographer into photographer
-- 2. Remove return-gifts category
-- 3. Keep only Bangalore as city
-- =====================================================

BEGIN;

-- Step 1: Update all listings with cinematographer category to photographer
UPDATE listings 
SET listing_category_id = 'photographer'
WHERE listing_category_id = 'cinematographer';

-- Step 2: Update all vendors with cinematographer category to photographer
UPDATE vendors 
SET vendor_category_id = 'photographer'
WHERE vendor_category_id = 'cinematographer';

-- Step 3: Update event_type_categories mappings (remove cinematographer, add photographer if not exists)
-- First, remove cinematographer mappings
DELETE FROM event_type_categories 
WHERE category_id = 'cinematographer';

-- Ensure photographer exists in all event types that had cinematographer
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT DISTINCT etc.event_type_id, 'photographer'
FROM event_type_categories etc
WHERE etc.event_type_id IN (
    SELECT DISTINCT event_type_id 
    FROM event_type_categories 
    WHERE category_id = 'cinematographer'
)
AND NOT EXISTS (
    SELECT 1 
    FROM event_type_categories 
    WHERE event_type_id = etc.event_type_id 
    AND category_id = 'photographer'
)
ON CONFLICT DO NOTHING;

-- Step 4: Remove return-gifts category from listings
-- Update listings with return-gifts to 'other'
UPDATE listings 
SET listing_category_id = 'other'
WHERE listing_category_id = 'return-gifts';

-- Step 5: Update vendors with return-gifts category to 'other'
UPDATE vendors 
SET vendor_category_id = 'other'
WHERE vendor_category_id = 'return-gifts';

-- Step 6: Remove return-gifts from event_type_categories
DELETE FROM event_type_categories 
WHERE category_id = 'return-gifts';

-- Step 7: Delete the cinematographer and return-gifts categories
DELETE FROM categories 
WHERE id IN ('cinematographer', 'return-gifts');

-- Step 8: Update photographer category display name to include both
UPDATE categories 
SET display_name = 'Photography & Cinematography',
    name = 'Photography & Cinematography'
WHERE id = 'photographer';

-- Step 9: Update cities - Keep only Bangalore, remove others
-- First, update all vendors to Bangalore
UPDATE vendors 
SET city_name = 'Bangalore',
    city_id = (SELECT id FROM cities WHERE name = 'Bangalore' LIMIT 1)
WHERE city_name != 'Bangalore' OR city_name IS NULL;

-- Step 10: Delete other cities (optional - comment out if you want to keep them in DB but not show)
-- DELETE FROM cities WHERE name != 'Bangalore';

COMMIT;

-- Verification queries (run these to check results)
-- SELECT id, name, display_name FROM categories ORDER BY id;
-- SELECT DISTINCT city_name FROM vendors;
-- SELECT COUNT(*) as photographer_listings FROM listings WHERE listing_category_id = 'photographer';
-- SELECT COUNT(*) as photographer_vendors FROM vendors WHERE vendor_category_id = 'photographer';






