-- Add DJ category to Corporate events
-- This allows DJ services to be listed for Corporate events

INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, 'dj'
FROM event_types et
WHERE et.name = 'Corporate'
AND NOT EXISTS (
  SELECT 1 FROM event_type_categories etc
  WHERE etc.event_type_id = et.id AND etc.category_id = 'dj'
)
ON CONFLICT DO NOTHING;




