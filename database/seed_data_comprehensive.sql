-- =====================================================
-- Event Hub Connect - Comprehensive Seed Data
-- Dummy data for testing frontend-backend integration
-- =====================================================

-- First, ensure reference data exists (from seed_data_v2.sql)
-- This script assumes seed_data_v2.sql has been run

-- =====================================================
-- 1. INSERT USER PROFILES (Dummy users for testing)
-- =====================================================

-- Note: In production, these would be created via Supabase Auth
-- For testing, we'll insert directly (you may need to create auth.users first)
-- For now, we'll use placeholder UUIDs

INSERT INTO user_profiles (id, email, full_name, phone, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'customer1@test.com', 'John Customer', '9876543210', 'customer'),
('550e8400-e29b-41d4-a716-446655440002', 'customer2@test.com', 'Jane Customer', '9876543211', 'customer'),
('550e8400-e29b-41d4-a716-446655440010', 'vendor1@test.com', 'Moments Photography', '9876543220', 'vendor'),
('550e8400-e29b-41d4-a716-446655440011', 'vendor2@test.com', 'Glamour Studio', '9876543221', 'vendor'),
('550e8400-e29b-41d4-a716-446655440012', 'vendor3@test.com', 'Royal Décor', '9876543222', 'vendor'),
('550e8400-e29b-41d4-a716-446655440013', 'vendor4@test.com', 'DJ Sound Waves', '9876543223', 'vendor'),
('550e8400-e29b-41d4-a716-446655440014', 'vendor5@test.com', 'Delicious Catering', '9876543224', 'vendor'),
('550e8400-e29b-41d4-a716-446655440015', 'vendor6@test.com', 'Cinematic Dreams', '9876543225', 'vendor'),
('550e8400-e29b-41d4-a716-446655440016', 'vendor7@test.com', 'Elegant Makeup', '9876543226', 'vendor')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. INSERT VENDORS
-- =====================================================

INSERT INTO vendors (
    id, user_id, business_name, vendor_category_id, city_id, city_name, bio,
    rating, review_count, starting_price, cover_image, portfolio_images,
    coverage_radius, is_verified, is_active
) VALUES
-- Photographer
('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440010',
 'Moments Photography Studio', 'photographer', 1, 'Mumbai',
 'Capturing your special moments with artistic excellence. 10+ years of experience in wedding and event photography.',
 4.8, 125, 25000.00,
 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800',
 ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=400', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400'],
 50, true, true),

-- Makeup Artist
('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440011',
 'Glamour Studio', 'mua', 1, 'Mumbai',
 'Professional makeup and hair styling services for all occasions. Specializing in bridal and party makeup.',
 4.7, 89, 15000.00,
 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
 ARRAY['https://images.unsplash.com/photo-1512496015851-a90fb38c796f?w=400', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'],
 30, true, true),

-- Decorator
('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440012',
 'Royal Décor & Events', 'decorator', 1, 'Mumbai',
 'Transforming spaces into magical venues. Specializing in wedding and corporate event decoration.',
 4.9, 156, 50000.00,
 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
 ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400'],
 100, true, true),

-- DJ
('44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440013',
 'DJ Sound Waves', 'dj', 1, 'Mumbai',
 'Creating the perfect party atmosphere with premium sound systems and professional DJ services.',
 4.6, 98, 20000.00,
 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
 ARRAY['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'],
 75, true, true),

-- Caterer
('55555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440014',
 'Delicious Catering Services', 'caterer', 1, 'Mumbai',
 'Serving delicious food for all occasions. From intimate gatherings to grand celebrations.',
 4.8, 142, 30000.00,
 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
 ARRAY['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'],
 60, true, true),

-- Cinematographer
('66666666-6666-6666-6666-666666666666', '550e8400-e29b-41d4-a716-446655440015',
 'Cinematic Dreams', 'cinematographer', 1, 'Mumbai',
 'Creating cinematic wedding films and event videos that tell your story beautifully.',
 4.9, 112, 35000.00,
 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
 ARRAY['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400'],
 80, true, true),

-- Makeup Artist 2
('77777777-7777-7777-7777-777777777777', '550e8400-e29b-41d4-a716-446655440016',
 'Elegant Makeup & Styling', 'mua', 1, 'Mumbai',
 'Bridal and party makeup with a touch of elegance. Professional hair styling included.',
 4.7, 76, 18000.00,
 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
 ARRAY['https://images.unsplash.com/photo-1512496015851-a90fb38c796f?w=400'],
 40, true, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. INSERT LISTINGS (Packages and Items)
-- =====================================================

-- Get event type IDs
DO $$
DECLARE
    wedding_id INTEGER;
    birthday_id INTEGER;
    corporate_id INTEGER;
    engagement_id INTEGER;
BEGIN
    SELECT id INTO wedding_id FROM event_types WHERE name = 'Wedding';
    SELECT id INTO birthday_id FROM event_types WHERE name = 'Birthday';
    SELECT id INTO corporate_id FROM event_types WHERE name = 'Corporate';
    SELECT id INTO engagement_id FROM event_types WHERE name = 'Engagement';

    -- Moments Photography - Packages
    INSERT INTO listings (id, vendor_id, type, name, description, price, listing_category_id, 
                         included_items_text, excluded_items_text, delivery_time, images, is_active, is_popular, is_trending)
    VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'package',
     'Classic Wedding Package', 'Complete wedding photography coverage with professional editing',
     45000.00, 'photographer',
     ARRAY['8 hours coverage', '2 photographers', '500+ edited photos', 'Online gallery', 'USB drive with all photos'],
     ARRAY['Drone shots', 'Video coverage'],
     '2-3 weeks', 
     ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600'],
     true, true, false),
    
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '11111111-1111-1111-1111-111111111111', 'package',
     'Premium Wedding Package', 'Luxury wedding photography with premium editing and album',
     75000.00, 'photographer',
     ARRAY['12 hours coverage', '3 photographers', '1000+ edited photos', 'Premium online gallery', 'USB drive', 'Hardcover photo album'],
     ARRAY[],
     '3-4 weeks',
     ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=600'],
     true, false, true),
    
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', '11111111-1111-1111-1111-111111111111', 'item',
     'Professional Camera Rental', 'High-end DSLR camera rental for events',
     5000.00, 'photographer',
     NULL, NULL,
     'Same day',
     ARRAY['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600'],
     true, false, false);

    -- Link event types to listings
    INSERT INTO listing_event_types (listing_id, event_type_id)
    VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', wedding_id),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', engagement_id),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', wedding_id),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', wedding_id),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', corporate_id);

    -- Glamour Studio - Packages
    INSERT INTO listings (id, vendor_id, type, name, description, price, listing_category_id,
                         included_items_text, excluded_items_text, delivery_time, images, is_active, is_popular, is_trending)
    VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'package',
     'Bridal Makeup Package', 'Complete bridal makeup and hair styling',
     25000.00, 'mua',
     ARRAY['Bridal makeup', 'Hair styling', 'Draping assistance', 'Touch-up kit'],
     ARRAY['Trial session'],
     'On event day',
     ARRAY['https://images.unsplash.com/photo-1512496015851-a90fb38c796f?w=600'],
     true, true, false),
    
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', '22222222-2222-2222-2222-222222222222', 'item',
     'Hair Styling Service', 'Professional hair styling for any occasion',
     8000.00, 'mua',
     NULL, NULL,
     'On event day',
     ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'],
     true, false, false);

    INSERT INTO listing_event_types (listing_id, event_type_id)
    VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', wedding_id),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', engagement_id),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', birthday_id),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', wedding_id),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', birthday_id);

    -- Royal Décor - Packages
    INSERT INTO listings (id, vendor_id, type, name, description, price, listing_category_id,
                         included_items_text, excluded_items_text, delivery_time, images, is_active, is_popular, is_trending)
    VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'package',
     'Luxury Wedding Décor', 'Complete wedding decoration with premium flowers and lighting',
     150000.00, 'decorator',
     ARRAY['Mandap decoration', 'Stage decoration', 'Entrance decoration', 'Table centerpieces', 'Lighting setup'],
     ARRAY['Flower petals', 'Special effects'],
     'Setup on event day',
     ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600'],
     true, true, true),
    
    ('cccccccc-cccc-cccc-cccc-cccccccccccd', '33333333-3333-3333-3333-333333333333', 'item',
     'Premium Chairs (Gold)', 'Elegant gold-colored premium chairs for events',
     500.00, 'decorator',
     NULL, NULL,
     'Setup on event day',
     ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600'],
     true, false, false),
    
    ('cccccccc-cccc-cccc-cccc-ccccccccccce', '33333333-3333-3333-3333-333333333333', 'item',
     'Floral Centerpiece', 'Beautiful floral centerpiece for tables',
     2000.00, 'decorator',
     NULL, NULL,
     'Setup on event day',
     ARRAY['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600'],
     true, false, false);

    INSERT INTO listing_event_types (listing_id, event_type_id)
    VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', wedding_id),
    ('cccccccc-cccc-cccc-cccc-cccccccccccd', wedding_id),
    ('cccccccc-cccc-cccc-cccc-cccccccccccd', corporate_id),
    ('cccccccc-cccc-cccc-cccc-ccccccccccce', wedding_id),
    ('cccccccc-cccc-cccc-cccc-ccccccccccce', birthday_id);

    -- DJ Sound Waves - Packages
    INSERT INTO listings (id, vendor_id, type, name, description, price, listing_category_id,
                         included_items_text, excluded_items_text, delivery_time, images, is_active, is_popular, is_trending)
    VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'package',
     'Premium DJ Package', 'Complete DJ service with sound system and lighting',
     35000.00, 'dj',
     ARRAY['6 hours DJ service', 'Premium sound system', 'Basic lighting', 'MC services'],
     ARRAY['Laser lights', 'Fog machine'],
     'Setup 2 hours before event',
     ARRAY['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600'],
     true, true, false);

    INSERT INTO listing_event_types (listing_id, event_type_id)
    VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', wedding_id),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', birthday_id),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', corporate_id);

    -- Delicious Catering - Packages
    INSERT INTO listings (id, vendor_id, type, name, description, price, listing_category_id,
                         included_items_text, excluded_items_text, delivery_time, images, is_active, is_popular, is_trending)
    VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'package',
     'Wedding Catering Package', 'Complete wedding catering for 200 guests',
     200000.00, 'caterer',
     ARRAY['North Indian buffet', 'South Indian options', 'Live counters', 'Desserts', 'Beverages', 'Serving staff'],
     ARRAY['Alcohol', 'Special dietary requirements'],
     'Service on event day',
     ARRAY['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600'],
     true, true, false);

    INSERT INTO listing_event_types (listing_id, event_type_id)
    VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', wedding_id),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', corporate_id);

    -- Cinematic Dreams - Packages
    INSERT INTO listings (id, vendor_id, type, name, description, price, listing_category_id,
                         included_items_text, excluded_items_text, delivery_time, images, is_active, is_popular, is_trending)
    VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666', 'package',
     'Cinematic Wedding Film', 'Professional wedding cinematography with cinematic editing',
     85000.00, 'cinematographer',
     ARRAY['Full day coverage', '2 cinematographers', 'Drone shots', 'Cinematic trailer', 'Full wedding film', 'Highlights video'],
     ARRAY['Same-day edit'],
     '4-6 weeks',
     ARRAY['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600'],
     true, false, true);

    INSERT INTO listing_event_types (listing_id, event_type_id)
    VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', wedding_id),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', engagement_id);

    -- Elegant Makeup - Packages
    INSERT INTO listings (id, vendor_id, type, name, description, price, listing_category_id,
                         included_items_text, excluded_items_text, delivery_time, images, is_active, is_popular, is_trending)
    VALUES
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', '77777777-7777-7777-7777-777777777777', 'package',
     'Complete Bridal Package', 'Bridal makeup, hair styling, and draping',
     30000.00, 'mua',
     ARRAY['Bridal makeup', 'Hair styling', 'Draping', 'Trial session', 'Touch-up kit'],
     ARRAY[],
     'Trial 1 week before, service on event day',
     ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'],
     true, true, false);

    INSERT INTO listing_event_types (listing_id, event_type_id)
    VALUES
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', wedding_id),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', engagement_id);

END $$;

-- =====================================================
-- 4. INSERT ADD-ONS
-- =====================================================

INSERT INTO add_ons (id, package_id, title, description, price, is_active)
VALUES
('addon-0001-0001-0001-0001-0001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Drone Photography', 'Aerial shots of your event', 15000.00, true),
('addon-0002-0002-0002-0002-0002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Same-Day Highlights', 'Quick highlights video on the same day', 10000.00, true),
('addon-0003-0003-0003-0003-0003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Trial Session', 'Makeup trial before the event', 5000.00, true),
('addon-0004-0004-0004-0004-0004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Flower Petals', 'Rose petals for decoration', 5000.00, true),
('addon-0005-0005-0005-0005-0005', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Laser Lights', 'Premium laser light effects', 8000.00, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. INSERT REVIEWS
-- =====================================================

INSERT INTO reviews (id, vendor_id, user_id, rating, comment, event_type, is_verified, is_visible)
VALUES
('review-0001-0001-0001-0001-0001', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001',
 5.0, 'Amazing photography! Captured all our special moments beautifully.', 'Wedding', true, true),
('review-0002-0002-0002-0002-0002', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440002',
 4.5, 'Great service and professional team. Highly recommended!', 'Wedding', true, true),
('review-0003-0003-0003-0003-0003', '22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001',
 4.8, 'Beautiful makeup! Made me look stunning on my wedding day.', 'Wedding', true, true),
('review-0004-0004-0004-0004-0004', '33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440001',
 5.0, 'Stunning decoration! Exceeded our expectations.', 'Wedding', true, true),
('review-0005-0005-0005-0005-0005', '44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440002',
 4.6, 'Great DJ! Kept the party going all night.', 'Birthday', true, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. INSERT VENDOR PAST EVENTS
-- =====================================================

INSERT INTO vendor_past_events (id, vendor_id, image, event_type, event_date)
VALUES
('event-0001-0001-0001-0001-0001', '11111111-1111-1111-1111-111111111111',
 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 'Wedding', '2024-01-15'),
('event-0002-0002-0002-0002-0002', '11111111-1111-1111-1111-111111111111',
 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800', 'Wedding', '2024-02-20'),
('event-0003-0003-0003-0003-0003', '33333333-3333-3333-3333-333333333333',
 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', 'Wedding', '2024-01-10'),
('event-0004-0004-0004-0004-0004', '33333333-3333-3333-3333-333333333333',
 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', 'Corporate', '2024-03-05')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. INSERT BOOKABLE SETUPS
-- =====================================================

INSERT INTO bookable_setups (id, vendor_id, image, title, description, price, category_id, is_active)
VALUES
('setup-0001-0001-0001-0001-0001', '33333333-3333-3333-3333-333333333333',
 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
 'Royal Mandap Setup', 'Elegant mandap decoration with premium flowers', 80000.00, 'decorator', true),
('setup-0002-0002-0002-0002-0002', '33333333-3333-3333-3333-333333333333',
 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
 'Modern Stage Setup', 'Contemporary stage decoration with LED lighting', 60000.00, 'decorator', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. INSERT VENDOR FAQs
-- =====================================================

INSERT INTO vendor_faqs (id, vendor_id, question, answer, display_order)
VALUES
('faq-0001-0001-0001-0001-0001', '11111111-1111-1111-1111-111111111111',
 'How many photographers will be assigned?', 'We provide 2 photographers for our Classic Package and 3 for Premium Package.', 1),
('faq-0002-0002-0002-0002-0002', '11111111-1111-1111-1111-111111111111',
 'When will we receive the photos?', 'Edited photos are delivered within 2-3 weeks for Classic Package and 3-4 weeks for Premium Package.', 2),
('faq-0003-0003-0003-0003-0003', '22222222-2222-2222-2222-222222222222',
 'Do you provide trial sessions?', 'Yes, trial sessions are available as an add-on service.', 1),
('faq-0004-0004-0004-0004-0004', '33333333-3333-3333-3333-333333333333',
 'What is included in the decoration package?', 'Our package includes mandap, stage, entrance, table centerpieces, and basic lighting setup.', 1)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 9. UPDATE VENDOR RATINGS (based on reviews)
-- =====================================================

-- This would normally be done by triggers, but for seed data we'll update manually
UPDATE vendors SET rating = 4.75, review_count = 2 WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE vendors SET rating = 4.80, review_count = 1 WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE vendors SET rating = 5.00, review_count = 1 WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE vendors SET rating = 4.60, review_count = 1 WHERE id = '44444444-4444-4444-4444-444444444444';

-- =====================================================
-- COMPLETE!
-- =====================================================

SELECT 'Seed data inserted successfully!' AS status;

