-- =====================================================
-- Event Hub Connect - Complete Seed Data
-- Run this AFTER schema_standalone.sql
-- =====================================================

-- =====================================================
-- 1. EVENT TYPES
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
ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name;

-- =====================================================
-- 2. CATEGORIES (matching frontend categoryFieldConfigs)
-- =====================================================
INSERT INTO categories (id, name, display_name, icon) VALUES
('photo-video', 'Photography & Videography', 'Photography & Videography', '📸'),
('decorator', 'Décor', 'Décor', '🎨'),
('caterer', 'Catering', 'Catering', '🍽'),
('venue', 'Venue', 'Venue', '🏛'),
('mua', 'Makeup & Styling', 'Makeup & Styling', '💄'),
('dj-entertainment', 'DJ & Entertainment', 'DJ & Entertainment', '🎧'),
('sound-lights', 'Sound & Lights', 'Sound & Lights', '🔊'),
('artists', 'Artists & Performers', 'Artists & Performers', '🎭'),
('event-planner', 'Event Planner', 'Event Planner', '📋'),
('other', 'Other', 'Other Services', '✨')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  icon = EXCLUDED.icon;

-- =====================================================
-- 3. EVENT TYPE → CATEGORY MAPPINGS
-- =====================================================

-- Clear existing mappings first
DELETE FROM event_type_categories;

-- Wedding: All categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Wedding';

-- Birthday: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Birthday'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'dj-entertainment', 'sound-lights', 'artists', 'venue', 'other');

-- Anniversary: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Anniversary'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'dj-entertainment', 'artists', 'venue', 'sound-lights', 'other');

-- Corporate: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Corporate'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'sound-lights', 'artists', 'venue', 'dj-entertainment', 'event-planner', 'other');

-- Engagement: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Engagement'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'mua', 'dj-entertainment', 'venue', 'sound-lights', 'artists', 'other');

-- Baby Shower: Selected categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Baby Shower'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'venue', 'sound-lights', 'other');

-- Nightlife & Parties: Party-focused categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Nightlife'
AND c.id IN ('photo-video', 'decorator', 'caterer', 'dj-entertainment', 'sound-lights', 'artists', 'venue', 'other');

-- Concerts & Live Shows: Performance-focused categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Concert'
AND c.id IN ('photo-video', 'sound-lights', 'artists', 'venue', 'other');

-- Other: All categories
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE et.name = 'Other';

-- =====================================================
-- 4. CITIES
-- =====================================================
INSERT INTO cities (name, state, country) VALUES
('Bangalore', 'Karnataka', 'India'),
('Mumbai', 'Maharashtra', 'India'),
('Delhi', 'Delhi', 'India'),
('Hyderabad', 'Telangana', 'India'),
('Chennai', 'Tamil Nadu', 'India'),
('Kolkata', 'West Bengal', 'India'),
('Pune', 'Maharashtra', 'India'),
('Ahmedabad', 'Gujarat', 'India'),
('Jaipur', 'Rajasthan', 'India'),
('Lucknow', 'Uttar Pradesh', 'India'),
('Chandigarh', 'Punjab', 'India'),
('Goa', 'Goa', 'India'),
('Kochi', 'Kerala', 'India'),
('Indore', 'Madhya Pradesh', 'India'),
('Nagpur', 'Maharashtra', 'India'),
('Surat', 'Gujarat', 'India'),
('Vadodara', 'Gujarat', 'India'),
('Coimbatore', 'Tamil Nadu', 'India'),
('Visakhapatnam', 'Andhra Pradesh', 'India'),
('Bhopal', 'Madhya Pradesh', 'India')
ON CONFLICT (name) DO UPDATE SET 
  state = EXCLUDED.state,
  country = EXCLUDED.country;

-- =====================================================
-- 5. CREATE ADMIN USER (optional - for testing)
-- =====================================================
-- Password: admin123 (bcrypt hashed)
INSERT INTO user_profiles (id, email, password, full_name, phone, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@cartevent.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQlLBgXGlmPjPqQOqQOqQOqQOqQO',
  'Admin User',
  '9999999999',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify data was inserted:

-- SELECT COUNT(*) as event_types_count FROM event_types;
-- SELECT COUNT(*) as categories_count FROM categories;
-- SELECT COUNT(*) as mappings_count FROM event_type_categories;
-- SELECT COUNT(*) as cities_count FROM cities;

-- =====================================================
-- END OF SEED DATA
-- =====================================================
