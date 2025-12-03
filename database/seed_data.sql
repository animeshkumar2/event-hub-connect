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
('Other', 'Other')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. INSERT CATEGORIES
-- =====================================================

INSERT INTO categories (id, name, display_name, icon) VALUES
('photographer', 'Photography', 'Photography', '📸'),
('cinematographer', 'Cinematography', 'Cinematography', '🎬'),
('decorator', 'Décor', 'Décor', '🎨'),
('dj', 'DJ', 'DJ', '🎵'),
('sound-lights', 'Sound & Lights', 'Sound & Lights', '💡'),
('mua', 'Makeup / Stylist', 'Makeup / Stylist', '💄'),
('caterer', 'Catering', 'Catering', '🍽️'),
('return-gifts', 'Return Gifts', 'Return Gifts', '🎁'),
('invitations', 'Invitations', 'Invitations', '✉️'),
('live-music', 'Live Music', 'Live Music', '🎤'),
('anchors', 'Anchors', 'Anchors', '🎙️'),
('event-coordinator', 'Event Coordinators', 'Event Coordinators', '📋'),
('other', 'Other', 'Other', '📦')
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
AND c.id IN ('photographer', 'decorator', 'caterer', 'dj', 'sound-lights', 'invitations', 'return-gifts')
ON CONFLICT DO NOTHING;

-- Anniversary: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Anniversary'
AND c.id IN ('photographer', 'decorator', 'caterer', 'dj', 'live-music', 'invitations')
ON CONFLICT DO NOTHING;

-- Corporate: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Corporate'
AND c.id IN ('photographer', 'decorator', 'caterer', 'sound-lights', 'anchors', 'event-coordinator')
ON CONFLICT DO NOTHING;

-- Engagement: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Engagement'
AND c.id IN ('photographer', 'decorator', 'caterer', 'mua', 'dj', 'cinematographer', 'invitations')
ON CONFLICT DO NOTHING;

-- Baby Shower: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Baby Shower'
AND c.id IN ('photographer', 'decorator', 'caterer', 'invitations', 'return-gifts')
ON CONFLICT DO NOTHING;

-- Other: All categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Other'
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

