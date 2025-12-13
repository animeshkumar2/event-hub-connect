-- Fix incorrect event type associations for listings
-- Some listings are incorrectly tagged with multiple event types when they should be specific

-- Fix wedding-specific listings that are incorrectly tagged with other event types
-- "Luxury Wedding Decoration" should ONLY be for Wedding (event_type_id = 1)
DELETE FROM listing_event_types 
WHERE listing_id = '00000004-cccc-cccc-cccc-cccccccccccc' 
  AND event_type_id IN (2, 4); -- Remove Birthday (2) and Corporate (4)

-- Ensure it only has Wedding
INSERT INTO listing_event_types (listing_id, event_type_id)
SELECT '00000004-cccc-cccc-cccc-cccccccccccc'::uuid, 1
WHERE NOT EXISTS (
  SELECT 1 FROM listing_event_types 
  WHERE listing_id = '00000004-cccc-cccc-cccc-cccccccccccc' 
    AND event_type_id = 1
);

-- Fix "Premium Chairs (Gold)" - chairs can be for multiple events, but if it's wedding-specific, remove Birthday
-- For now, keeping Wedding and Corporate, removing Birthday
DELETE FROM listing_event_types 
WHERE listing_id = '10000003-cccc-cccc-cccc-cccccccccccc' 
  AND event_type_id = 2; -- Remove Birthday

-- Fix "Floral Centerpiece" - flowers can be for multiple events, but if it's wedding-specific, remove Birthday
DELETE FROM listing_event_types 
WHERE listing_id = '10000004-cccc-cccc-cccc-cccccccccccc' 
  AND event_type_id = 2; -- Remove Birthday

-- Note: "Complete Catering Package" (00000006-eeee-eeee-eeee-eeeeeeeeeeee) can legitimately be for 
-- Wedding, Birthday, and Corporate - catering is universal. Keeping as-is.

-- Note: "Complete DJ Package" (00000005-dddd-dddd-dddd-dddddddddddd) can legitimately be for 
-- Wedding, Birthday, and Anniversary - DJ services are universal. Keeping as-is.

-- Note: "Hair Styling Service" (10000002-bbbb-bbbb-bbbb-bbbbbbbbbbbb) can be for Wedding and Birthday
-- Hair styling is universal. Keeping as-is.

-- Verify the fixes
SELECT 
  l.id,
  l.name,
  array_agg(et.id ORDER BY et.id) as event_type_ids,
  array_agg(et.name ORDER BY et.id) as event_type_names
FROM listings l
JOIN listing_event_types let ON l.id = let.listing_id
JOIN event_types et ON let.event_type_id = et.id
WHERE l.id IN (
  '00000004-cccc-cccc-cccc-cccccccccccc',
  '10000003-cccc-cccc-cccc-cccccccccccc',
  '10000004-cccc-cccc-cccc-cccccccccccc'
)
GROUP BY l.id, l.name
ORDER BY l.name;

