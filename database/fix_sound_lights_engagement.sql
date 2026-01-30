-- Fix: Add sound-lights category to Engagement event type if missing
-- Run this in Supabase SQL Editor

-- First, check what exists
SELECT et.id, et.name, c.id as category_id, c.name as category_name
FROM event_types et 
JOIN event_type_categories etc ON et.id = etc.event_type_id 
JOIN categories c ON etc.category_id = c.id 
WHERE et.name = 'Engagement'
ORDER BY c.name;

-- Add sound-lights to Engagement if not exists
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, 'sound-lights'
FROM event_types et
WHERE et.name = 'Engagement'
AND NOT EXISTS (
    SELECT 1 FROM event_type_categories etc 
    WHERE etc.event_type_id = et.id AND etc.category_id = 'sound-lights'
);

-- Verify the fix
SELECT et.id, et.name, c.id as category_id, c.name as category_name
FROM event_types et 
JOIN event_type_categories etc ON et.id = etc.event_type_id 
JOIN categories c ON etc.category_id = c.id 
WHERE et.name = 'Engagement' AND c.id = 'sound-lights';
