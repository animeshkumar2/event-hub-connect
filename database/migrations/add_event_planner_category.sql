-- Migration: Add Event Planner vendor category
-- Date: 2026-02-03
-- Description: Adds 'event-planner' as a new vendor category
-- Note: This is a vendor category only, not a listing category.
--       Event Planners can create listings in any existing category.

-- Add the event-planner category
INSERT INTO categories (id, name, display_name, icon) 
VALUES ('event-planner', 'Event Planner', 'Event Planner', '📋')
ON CONFLICT (id) DO NOTHING;

-- Add event-planner to all event types (event planners can work on any event type)
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, 'event-planner'
FROM event_types et
ON CONFLICT DO NOTHING;
