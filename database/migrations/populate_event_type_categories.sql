-- Populate event_type_categories table with mappings
-- This defines which event types are suitable for which categories
-- Based on existing event types: 1-Wedding, 2-Birthday, 3-Anniversary, 4-Corporate, 5-Engagement, 6-Baby Shower, 7-Other

-- Clear existing data (if any)
TRUNCATE TABLE event_type_categories CASCADE;

-- Wedding (ID: 1) - All categories
INSERT INTO event_type_categories (event_type_id, category_id) VALUES
(1, 'caterer'),
(1, 'photographer'),
(1, 'decorator'),
(1, 'mua'),
(1, 'venue'),
(1, 'dj'),
(1, 'live-music'),
(1, 'sound-lights');

-- Birthday (ID: 2)
INSERT INTO event_type_categories (event_type_id, category_id) VALUES
(2, 'caterer'),
(2, 'photographer'),
(2, 'decorator'),
(2, 'venue'),
(2, 'dj'),
(2, 'live-music'),
(2, 'sound-lights');

-- Anniversary (ID: 3)
INSERT INTO event_type_categories (event_type_id, category_id) VALUES
(3, 'caterer'),
(3, 'photographer'),
(3, 'decorator'),
(3, 'venue'),
(3, 'dj'),
(3, 'live-music'),
(3, 'sound-lights');

-- Corporate (ID: 4)
INSERT INTO event_type_categories (event_type_id, category_id) VALUES
(4, 'caterer'),
(4, 'photographer'),
(4, 'decorator'),
(4, 'venue'),
(4, 'dj'),
(4, 'live-music'),
(4, 'sound-lights');

-- Engagement (ID: 5)
INSERT INTO event_type_categories (event_type_id, category_id) VALUES
(5, 'caterer'),
(5, 'photographer'),
(5, 'decorator'),
(5, 'mua'),
(5, 'venue'),
(5, 'dj'),
(5, 'live-music'),
(5, 'sound-lights');

-- Baby Shower (ID: 6)
INSERT INTO event_type_categories (event_type_id, category_id) VALUES
(6, 'caterer'),
(6, 'photographer'),
(6, 'decorator'),
(6, 'venue');

-- Other (ID: 7) - All categories
INSERT INTO event_type_categories (event_type_id, category_id) VALUES
(7, 'caterer'),
(7, 'photographer'),
(7, 'decorator'),
(7, 'mua'),
(7, 'venue'),
(7, 'dj'),
(7, 'live-music'),
(7, 'sound-lights');

-- Verify the data
SELECT 
    et.id as event_type_id,
    et.name as event_type_name,
    etc.category_id,
    c.display_name as category_name
FROM event_type_categories etc
JOIN event_types et ON etc.event_type_id = et.id
JOIN categories c ON etc.category_id = c.id
ORDER BY et.id, c.display_name;
