-- Add 'event-planner' category for vendors who want to create listings across all categories
-- Event Planners are full-service vendors who can offer any type of event service

-- First, check if 'event-planner' category already exists
SELECT id, name FROM categories WHERE id = 'event-planner';

-- Add event-planner category if it doesn't exist
-- Note: categories table only has id and name columns
INSERT INTO categories (id, name)
VALUES (
    'event-planner',
    'Event Planner'
)
ON CONFLICT (id) DO NOTHING;

-- Add event-planner to ALL event types (event planners can work on any event)
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, 'event-planner'
FROM event_types et
WHERE NOT EXISTS (
    SELECT 1 FROM event_type_categories etc 
    WHERE etc.event_type_id = et.id AND etc.category_id = 'event-planner'
);

-- Verify the category was added
SELECT id, name FROM categories WHERE id = 'event-planner';

-- Verify event type mappings
SELECT et.name as event_type
FROM event_types et 
JOIN event_type_categories etc ON et.id = etc.event_type_id 
WHERE etc.category_id = 'event-planner'
ORDER BY et.id;
