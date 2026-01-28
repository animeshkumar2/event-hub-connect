-- =====================================================
-- Event Hub Connect - Seed Data
-- Reference data and initial data for development
-- =====================================================

-- =====================================================
-- 1. INSERT EVENT TYPES
-- =====================================================

INSERT INTO event_types (name, display_name) VALUES
('Wedding', 'Wedding'),
('Birthday', 'Birthday'),
('Anniversary', 'Anniversary'),
('Corporate', 'Corporate Event'),
('Engagement', 'Engagement'),
('Baby Shower', 'Baby Shower'),
('Nightlife', 'Nightlife & Parties'),
('Concert', 'Concerts & Live Shows'),
('Other', 'Other')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. INSERT CATEGORIES
-- =====================================================
INSERT INTO categories (id, name, display_name, icon) VALUES
('photo-video', 'Photography & Videography', 'Photography & Videography', '📸'),
('decorator', 'Décor', 'Décor', '🎨'),
('caterer', 'Catering', 'Catering', '🍽️'),
('venue', 'Venue', 'Venue', '🏛️'),
('mua', 'Makeup & Styling', 'Makeup & Styling', '💄'),
('dj-entertainment', 'DJ & Entertainment', 'DJ & Entertainment', '🎵'),
('sound-lights', 'Sound & Lights', 'Sound & Lights', '💡'),
('artists', 'Artists & Performers', 'Artists & Performers', '🎭')
ON CONFLICT (id) DO NOTHING;



-- =====================================================
-- 3. INSERT EVENT TYPE → CATEGORY MAPPINGS
-- =====================================================

-- Wedding: All categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Wedding'
ON CONFLICT DO NOTHING;

-- Birthday: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Birthday'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'dj-entertainment', 'sound-lights', 'artists', 'venue')
ON CONFLICT DO NOTHING;

-- Engagement: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Engagement'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'mua', 'dj-entertainment', 'venue')
ON CONFLICT DO NOTHING;

-- Baby Shower: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Baby Shower'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'venue')
ON CONFLICT DO NOTHING;

-- Nightlife & Parties: Party-focused categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Nightlife'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'dj-entertainment', 'sound-lights', 'artists', 'venue')
ON CONFLICT DO NOTHING;

-- Concerts & Live Shows: Performance-focused categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Concert'
AND c.id IN ('photo-video', 'sound-lights', 'artists', 'venue')
ON CONFLICT DO NOTHING;

-- Other: All categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Other'
ON CONFLICT DO NOTHING;

-- Venue: All event types (venues can host any event)
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, 'venue'
FROM event_types et
ON CONFLICT DO NOTHING;

-- Corporate: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Corporate'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'sound-lights', 'artists', 'venue', 'dj-entertainment')
ON CONFLICT DO NOTHING;

-- Anniversary: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Anniversary'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'dj-entertainment', 'artists', 'venue', 'sound-lights')
ON CONFLICT DO NOTHING;


-- =====================================================
-- 4. INSERT CITIES
-- =====================================================

INSERT INTO cities (name, state, country) VALUES
('Mumbai', 'Maharashtra', 'India'),
('Delhi', 'Delhi', 'India'),
('Bangalore', 'Karnataka', 'India'),
('Hyderabad', 'Telangana', 'India'),
('Chennai', 'Tamil Nadu', 'India'),
('Kolkata', 'West Bengal', 'India'),
('Pune', 'Maharashtra', 'India'),
('Ahmedabad', 'Gujarat', 'India')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- END OF SEED DATA
-- =====================================================