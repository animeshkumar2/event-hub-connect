-- Add 'artists' category to ALL event types
-- Artists/Performers can be booked for any type of event

-- First, check if 'artists' category exists
SELECT id, name FROM categories WHERE id = 'artists';

-- Add artists to all event types (if not already exists)
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, 'artists'
FROM event_types et
WHERE NOT EXISTS (
    SELECT 1 FROM event_type_categories etc 
    WHERE etc.event_type_id = et.id AND etc.category_id = 'artists'
);

-- Verify the mappings
SELECT et.id, et.name as event_type, c.name as category
FROM event_types et 
JOIN event_type_categories etc ON et.id = etc.event_type_id 
JOIN categories c ON etc.category_id = c.id 
WHERE c.id = 'artists'
ORDER BY et.id;
