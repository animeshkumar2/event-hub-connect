-- Complete Seed Data for Event Hub Connect
-- This script populates the database with comprehensive dummy data for testing

-- =====================================================
-- 1. REFERENCE DATA (if not already populated)
-- =====================================================

-- Event Types
-- Note: Check schema_v2.sql for exact column names
-- If using SERIAL id, remove id from INSERT
INSERT INTO event_types (name, display_name) VALUES
('Wedding', 'Wedding'),
('Birthday', 'Birthday'),
('Corporate', 'Corporate Event'),
('Engagement', 'Engagement'),
('Anniversary', 'Anniversary')
ON CONFLICT (name) DO NOTHING;

-- Categories
INSERT INTO categories (id, name, display_name, icon) VALUES
('photographer', 'Photography', 'Photography', '📸'),
('videographer', 'Cinematography', 'Cinematography', '🎥'),
('decorator', 'Décor', 'Décor', '🎨'),
('caterer', 'Catering', 'Catering', '🍽️'),
('dj', 'DJ', 'DJ', '🎵'),
('makeup', 'Makeup / Stylist', 'Makeup / Stylist', '💄'),
('other', 'Other', 'Other', '📦')
ON CONFLICT (id) DO NOTHING;

-- Event Type → Category Mappings
-- Use subquery to get event type IDs by name
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id
FROM event_types et, categories c
WHERE (et.name = 'Wedding' AND c.id IN ('photographer', 'videographer', 'decorator', 'caterer', 'dj', 'makeup', 'other'))
   OR (et.name = 'Birthday' AND c.id IN ('photographer', 'videographer', 'decorator', 'caterer', 'dj', 'other'))
   OR (et.name = 'Corporate' AND c.id IN ('photographer', 'videographer', 'decorator', 'caterer', 'other'))
   OR (et.name = 'Engagement' AND c.id IN ('photographer', 'videographer', 'decorator', 'caterer', 'makeup', 'other'))
   OR (et.name = 'Anniversary' AND c.id IN ('photographer', 'videographer', 'decorator', 'caterer', 'dj', 'other'))
ON CONFLICT DO NOTHING;

-- Cities
INSERT INTO cities (name, state, country) VALUES
('Mumbai', 'Maharashtra', 'India'),
('Delhi', 'Delhi', 'India'),
('Bangalore', 'Karnataka', 'India'),
('Hyderabad', 'Telangana', 'India'),
('Chennai', 'Tamil Nadu', 'India'),
('Pune', 'Maharashtra', 'India'),
('Kolkata', 'West Bengal', 'India'),
('Jaipur', 'Rajasthan', 'India')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. USER PROFILES (SKIPPED - Requires Supabase Auth)
-- =====================================================

-- NOTE: user_profiles table references auth.users(id) which is managed by Supabase Auth.
-- You cannot insert directly into user_profiles without first creating users via Supabase Auth.
-- For testing, you can:
-- 1. Create users via Supabase Dashboard > Authentication > Users (or via API)
-- 2. Then insert corresponding user_profiles records with matching UUIDs
-- 3. Or skip user_profiles for now and vendors will work with NULL user_id

-- =====================================================
-- 3. VENDORS
-- =====================================================

-- Note: user_id is set to NULL since we can't create auth.users directly
-- In production, create users via Supabase Auth first, then update these user_ids
INSERT INTO vendors (id, user_id, business_name, vendor_category_id, city_id, city_name, bio, rating, review_count, starting_price, cover_image, portfolio_images, coverage_radius, is_verified, is_active) VALUES
-- Photographer
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, 'Moments Photography Studio', 'photographer', 1, 'Mumbai', 'Capturing your special moments with professional photography services. 10+ years of experience.', 4.8, 125, 25000.00, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', ARRAY['https://images.unsplash.com/photo-1492684223066-81342ee5ff30', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc'], 50, true, true),

-- Makeup Artist
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'Glamour Studio', 'makeup', 2, 'Delhi', 'Professional makeup and beauty services for all occasions. Expert artists with international experience.', 4.6, 89, 15000.00, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e', ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e'], 30, true, true),

-- Decorator
('cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, 'Royal Decorators', 'decorator', 3, 'Bangalore', 'Transform your event space with our exquisite decoration services. Premium quality materials.', 4.7, 156, 50000.00, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3'], 100, true, true),

-- DJ
('dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, 'DJ Music Hub', 'dj', 1, 'Mumbai', 'Best DJ services for weddings and parties. Latest sound systems and lighting.', 4.5, 98, 20000.00, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3', ARRAY['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'], 75, true, true),

-- Caterer
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, 'Delicious Caterers', 'caterer', 2, 'Delhi', 'Delicious food for all occasions. Vegetarian and non-vegetarian options available.', 4.9, 203, 30000.00, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d', ARRAY['https://images.unsplash.com/photo-1556910103-1c02745aae4d'], 60, true, true),

-- Videographer
('ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, 'Cinematic Films', 'videographer', 3, 'Bangalore', 'Professional videography and cinematography services. Cinematic wedding films.', 4.8, 142, 35000.00, 'https://images.unsplash.com/photo-1485846234645-a62644f84728', ARRAY['https://images.unsplash.com/photo-1485846234645-a62644f84728'], 80, true, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. LISTINGS (Packages and Items)
-- =====================================================

-- Packages for Moments Photography
INSERT INTO listings (id, vendor_id, type, name, description, price, listing_category_id, images, included_items_text, excluded_items_text, delivery_time, extra_charges, is_active, is_popular, is_trending) VALUES
('00000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'package', 'Classic Wedding Package', 'Complete wedding photography package with 8 hours coverage', 25000.00, 'photographer', 
 ARRAY['https://images.unsplash.com/photo-1492684223066-81342ee5ff30'],
 ARRAY['8 hours coverage', '2 photographers', '500+ edited photos', 'Online gallery', 'USB drive with all photos'],
 ARRAY['Video coverage', 'Drone shots'],
 '7-10 days', ARRAY['Extra hours: ₹2000/hour', 'Additional photographer: ₹5000'], true, true, true),

('00000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'package', 'Premium Wedding Package', 'Premium package with pre-wedding and wedding coverage', 45000.00, 'photographer',
 ARRAY['https://images.unsplash.com/photo-1511285560929-80b456fea0bc'],
 ARRAY['Pre-wedding shoot', 'Wedding day coverage (10 hours)', '2 photographers + 1 videographer', '1000+ edited photos', 'Cinematic video', 'Online gallery', 'USB drive'],
 ARRAY[]::text[],
 '10-15 days', ARRAY['Drone shots: ₹10000'], true, true, false),

-- Individual Items for Moments Photography
('10000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'item', 'Professional Camera Rental', 'High-end DSLR camera rental for events', 5000.00, 'photographer',
 ARRAY['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a'],
 NULL, NULL, 'Same day', ARRAY['Lens rental: ₹2000'], true, false, false),

-- Packages for Glamour Studio
('00000003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'package', 'Complete Bridal Makeup', 'Full bridal makeup package with trial', 15000.00, 'makeup',
 ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e'],
 ARRAY['Bridal makeup', 'Hair styling', 'Trial session', 'Touch-up kit', 'Draping assistance'],
 ARRAY[]::text[],
 'Same day', ARRAY['Additional person: ₹3000'], true, true, true),

-- Individual Items for Glamour Studio
('10000002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'item', 'Hair Styling Service', 'Professional hair styling for any occasion', 3000.00, 'makeup',
 ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e'],
 NULL, NULL, 'Same day', ARRAY['Hair extensions: ₹5000'], true, false, false),

-- Packages for Royal Decorators
('00000004-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'package', 'Luxury Wedding Decoration', 'Complete wedding decoration with premium materials', 50000.00, 'decorator',
 ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3'],
 ARRAY['Mandap decoration', 'Stage decoration', 'Entrance decoration', 'Seating arrangement', 'Lighting setup', 'Flower arrangements'],
 ARRAY[]::text[],
 '1 day before event', ARRAY['Additional lighting: ₹10000', 'Custom themes: ₹20000'], true, true, true),

-- Individual Items for Royal Decorators
('10000003-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'item', 'Premium Chairs (Gold)', 'Gold premium chairs for events', 200.00, 'decorator',
 ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7'],
 NULL, NULL, '1 day before', ARRAY['Minimum 50 chairs'], true, false, false),

('10000004-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'item', 'Floral Centerpiece', 'Beautiful floral centerpiece for tables', 500.00, 'decorator',
 ARRAY['https://images.unsplash.com/photo-1563241522-0-3e4e6e5e9b9a'],
 NULL, NULL, 'Same day', ARRAY['Minimum 10 pieces'], true, false, false),

-- Packages for DJ Music Hub
('00000005-dddd-dddd-dddd-dddddddddddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'package', 'Complete DJ Package', 'Full DJ service with sound and lighting', 20000.00, 'dj',
 ARRAY['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'],
 ARRAY['Professional DJ', 'Sound system', 'Lighting setup', '6 hours service', 'MC services'],
 ARRAY[]::text[],
 'Same day', ARRAY['Extra hours: ₹3000/hour'], true, true, false),

-- Packages for Delicious Caterers
('00000006-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'package', 'Complete Catering Package', 'Full catering service for 100 guests', 50000.00, 'caterer',
 ARRAY['https://images.unsplash.com/photo-1556910103-1c02745aae4d'],
 ARRAY['Vegetarian menu', 'Non-vegetarian menu', 'Appetizers', 'Main course', 'Desserts', 'Beverages', 'Serving staff', 'Table setup'],
 ARRAY[]::text[],
 'Same day', ARRAY['Per additional guest: ₹500'], true, true, true),

-- Packages for Cinematic Films
('00000007-ffff-ffff-ffff-ffffffffffff', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'package', 'Cinematic Wedding Film', 'Professional wedding videography with cinematic editing', 35000.00, 'videographer',
 ARRAY['https://images.unsplash.com/photo-1485846234645-a62644f84728'],
 ARRAY['10 hours coverage', '2 videographers', 'Cinematic highlights video', 'Full ceremony video', 'Drone shots', 'Same-day edit', 'USB drive'],
 ARRAY[]::text[],
 '15-20 days', ARRAY['Additional videographer: ₹10000'], true, true, true)
ON CONFLICT (id) DO NOTHING;

-- Link listings to event types
-- Use subquery to get event type IDs by name
INSERT INTO listing_event_types (listing_id, event_type_id)
SELECT listing_id::uuid, et.id
FROM event_types et,
(VALUES
  ('00000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Wedding'),
  ('00000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Engagement'),
  ('00000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Wedding'),
  ('00000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Engagement'),
  ('10000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Wedding'),
  ('10000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Corporate'),
  ('00000003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Wedding'),
  ('00000003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Engagement'),
  ('10000002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Wedding'),
  ('10000002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Birthday'),
  ('00000004-cccc-cccc-cccc-cccccccccccc', 'Wedding'),
  -- Removed Birthday and Corporate - "Luxury Wedding Decoration" is wedding-specific
  ('10000003-cccc-cccc-cccc-cccccccccccc', 'Wedding'),
  ('10000003-cccc-cccc-cccc-cccccccccccc', 'Corporate'),
  -- Removed Birthday - "Premium Chairs (Gold)" is for formal events (Wedding/Corporate)
  ('10000004-cccc-cccc-cccc-cccccccccccc', 'Wedding'),
  ('10000004-cccc-cccc-cccc-cccccccccccc', 'Corporate'),
  -- Removed Birthday - "Floral Centerpiece" is for formal events (Wedding/Corporate)
  ('00000005-dddd-dddd-dddd-dddddddddddd', 'Wedding'),
  ('00000005-dddd-dddd-dddd-dddddddddddd', 'Birthday'),
  ('00000005-dddd-dddd-dddd-dddddddddddd', 'Anniversary'),
  ('00000006-eeee-eeee-eeee-eeeeeeeeeeee', 'Wedding'),
  ('00000006-eeee-eeee-eeee-eeeeeeeeeeee', 'Birthday'),
  ('00000006-eeee-eeee-eeee-eeeeeeeeeeee', 'Corporate'),
  ('00000007-ffff-ffff-ffff-ffffffffffff', 'Wedding'),
  ('00000007-ffff-ffff-ffff-ffffffffffff', 'Engagement')
) AS listing_events(listing_id, event_name)
WHERE et.name = listing_events.event_name
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. ADD-ONS (for packages)
-- =====================================================

INSERT INTO add_ons (id, package_id, title, description, price, is_active) VALUES
('a0000001-0000-0000-0000-000000000001', '00000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Drone Photography', 'Aerial shots with drone', 10000.00, true),
('a0000002-0000-0000-0000-000000000002', '00000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Additional Photographer', 'Extra photographer for better coverage', 5000.00, true),
('a0000003-0000-0000-0000-000000000003', '00000003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bridal Hair Extensions', 'Premium hair extensions', 5000.00, true),
('a0000004-0000-0000-0000-000000000004', '00000004-cccc-cccc-cccc-cccccccccccc', 'Custom Theme Setup', 'Custom decoration theme', 20000.00, true),
('a0000005-0000-0000-0000-000000000005', '00000005-dddd-dddd-dddd-dddddddddddd', 'Extra Lighting Effects', 'Premium lighting effects', 10000.00, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. REVIEWS (SKIPPED - Requires auth.users)
-- =====================================================

-- NOTE: reviews.user_id references auth.users(id) which is NOT NULL.
-- You cannot insert reviews without valid auth.users.
-- For testing, skip reviews for now, or create users via Supabase Auth first.
-- 
-- To add reviews later:
-- 1. Create users via Supabase Auth
-- 2. Then insert reviews with valid user_id UUIDs
--
-- Example (uncomment after creating users):
-- INSERT INTO reviews (id, vendor_id, user_id, rating, comment, event_type, is_verified, is_visible) VALUES
-- ('rev-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '<user-uuid-from-auth>', 5.0, 'Amazing photography!', 'Wedding', true, true)
-- ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. VENDOR PAST EVENTS
-- =====================================================

INSERT INTO vendor_past_events (id, vendor_id, image, event_type, event_date) VALUES
('b0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', 'Wedding', '2024-01-15'),
('b0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc', 'Wedding', '2024-02-20'),
('b0000003-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e', 'Wedding', '2024-01-10'),
('b0000004-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'Wedding', '2024-02-25'),
('b0000005-0000-0000-0000-000000000005', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3', 'Birthday', '2024-03-05')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. BOOKABLE SETUPS
-- =====================================================

INSERT INTO bookable_setups (id, vendor_id, image, title, description, price, category_id, is_active) VALUES
('c0000001-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'Royal Mandap Setup', 'Beautiful royal mandap decoration', 30000.00, 'decorator', true),
('c0000002-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'Garden Theme Setup', 'Elegant garden theme decoration', 25000.00, 'decorator', true),
('c0000003-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3', 'Premium Sound System', 'High-end sound system setup', 15000.00, 'dj', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 9. VENDOR WALLETS
-- =====================================================

INSERT INTO vendor_wallets (vendor_id, balance, pending_payouts, total_earnings) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 125000.00, 50000.00, 500000.00),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 89000.00, 30000.00, 350000.00),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 200000.00, 75000.00, 800000.00),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 98000.00, 40000.00, 400000.00),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 150000.00, 60000.00, 600000.00),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 142000.00, 55000.00, 550000.00)
ON CONFLICT (vendor_id) DO NOTHING;

-- =====================================================
-- 10. VENDOR FAQs
-- =====================================================

INSERT INTO vendor_faqs (id, vendor_id, question, answer, display_order) VALUES
('e0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'How many photos do we get?', 'You will receive 500+ edited photos in the classic package and 1000+ in the premium package.', 1),
('e0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'How long does editing take?', 'Editing typically takes 7-10 days for classic package and 10-15 days for premium package.', 2),
('e0000003-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Do you provide trial sessions?', 'Yes, we provide a trial session before the main event to ensure you are happy with the look.', 1),
('e0000004-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Can we customize the decoration theme?', 'Yes, we offer custom themes. Please contact us to discuss your requirements.', 1)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 11. AVAILABILITY SLOTS (Sample for next 3 months)
-- =====================================================

-- Generate availability slots for vendors (sample data)
-- This is a simplified version - in production, you'd generate these programmatically

INSERT INTO availability_slots (id, vendor_id, date, time_slot, status) VALUES
-- Moments Photography - Available slots
('f0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE + INTERVAL '7 days', '09:00', 'AVAILABLE'),
('f0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE + INTERVAL '7 days', '14:00', 'AVAILABLE'),
('f0000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE + INTERVAL '14 days', '09:00', 'AVAILABLE'),
('f0000004-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE + INTERVAL '14 days', '14:00', 'AVAILABLE'),
-- Glamour Studio
('f0000005-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', CURRENT_DATE + INTERVAL '7 days', '08:00', 'AVAILABLE'),
('f0000006-0000-0000-0000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', CURRENT_DATE + INTERVAL '14 days', '08:00', 'AVAILABLE'),
-- Royal Decorators
('f0000007-0000-0000-0000-000000000007', 'cccccccc-cccc-cccc-cccc-cccccccccccc', CURRENT_DATE + INTERVAL '7 days', '06:00', 'AVAILABLE'),
('f0000008-0000-0000-0000-000000000008', 'cccccccc-cccc-cccc-cccc-cccccccccccc', CURRENT_DATE + INTERVAL '14 days', '06:00', 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMPLETE!
-- =====================================================

SELECT 'Seed data inserted successfully!' as status;

