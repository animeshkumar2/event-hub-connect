-- =====================================================
-- Event Hub Connect - Performance Test Seed Data
-- PostgreSQL (Supabase)
-- =====================================================
-- Target: 200 leads, 100 orders, 50 completed orders
-- Vendor ID: b750411e-10d2-4bd8-9484-4f250fe7d33b
-- Customer ID: 2860cf36-145c-442a-886b-29ec4571b2b8
-- =====================================================
-- IMPORTANT: Run this AFTER your vendor and customer exist in the database
-- =====================================================

-- =====================================================
-- 1. LISTINGS (3 packages + 2 items for the vendor)
-- =====================================================
INSERT INTO listings (id, vendor_id, type, name, description, price, listing_category_id, images, highlights, included_items_text, excluded_items_text, delivery_time, unit, minimum_quantity, is_active, is_popular, is_trending, open_for_negotiation, created_at, updated_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'b750411e-10d2-4bd8-9484-4f250fe7d33b', 'package', 'Basic Photography Package', 'Perfect for small events and intimate gatherings', 15000.00, 'photographer', 
     ARRAY['https://picsum.photos/800/600?random=1'], 
     ARRAY['4 hours coverage', '100 edited photos'],
     ARRAY['4 hours coverage', '100 edited photos', 'Online gallery', 'USB drive'],
     ARRAY['Video coverage', 'Drone shots'],
     '7 days', NULL, NULL, true, true, false, true, NOW(), NOW()),
    
    ('22222222-2222-2222-2222-222222222222', 'b750411e-10d2-4bd8-9484-4f250fe7d33b', 'package', 'Premium Photography Package', 'Full day coverage with album and pre-wedding shoot', 35000.00, 'photographer',
     ARRAY['https://picsum.photos/800/600?random=2'],
     ARRAY['8 hours coverage', '300 edited photos', 'Photo album'],
     ARRAY['8 hours coverage', '300 edited photos', 'Photo album', 'Online gallery', 'Pre-wedding shoot'],
     ARRAY['Drone shots'],
     '14 days', NULL, NULL, true, false, true, true, NOW(), NOW()),
    
    ('33333333-3333-3333-3333-333333333333', 'b750411e-10d2-4bd8-9484-4f250fe7d33b', 'package', 'Deluxe Photography Package', 'Complete wedding coverage with all premium features', 75000.00, 'photographer',
     ARRAY['https://picsum.photos/800/600?random=3'],
     ARRAY['Full day coverage', 'Drone shots', 'Same day edit'],
     ARRAY['Full day coverage', '500+ edited photos', 'Premium album', 'Drone shots', 'Same day edit', 'Cinematic video'],
     NULL,
     '21 days', NULL, NULL, true, true, true, true, NOW(), NOW()),
    
    ('aaaa1111-1111-1111-1111-111111111111', 'b750411e-10d2-4bd8-9484-4f250fe7d33b', 'item', 'Extra Photo Prints', 'High quality photo prints on premium paper', 500.00, 'photographer',
     ARRAY['https://picsum.photos/800/600?random=4'],
     NULL, NULL, NULL,
     '3 days', 'per piece', 10, true, false, false, true, NOW(), NOW()),
    
    ('bbbb2222-2222-2222-2222-222222222222', 'b750411e-10d2-4bd8-9484-4f250fe7d33b', 'item', 'Video Highlight Reel', '3-5 minute cinematic highlight video', 8000.00, 'photographer',
     ARRAY['https://picsum.photos/800/600?random=5'],
     NULL, NULL, NULL,
     '7 days', 'per video', 1, true, false, false, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. VENDOR WALLET
-- =====================================================
INSERT INTO vendor_wallets (vendor_id, balance, pending_payouts, total_earnings, updated_at)
VALUES ('b750411e-10d2-4bd8-9484-4f250fe7d33b', 125000.00, 25000.00, 450000.00, NOW())
ON CONFLICT (vendor_id) DO UPDATE SET 
    balance = 125000.00,
    pending_payouts = 25000.00,
    total_earnings = 450000.00,
    updated_at = NOW();

-- =====================================================
-- 3. VENDOR FAQs (10 FAQs)
-- =====================================================
DELETE FROM vendor_faqs WHERE vendor_id = 'b750411e-10d2-4bd8-9484-4f250fe7d33b';

INSERT INTO vendor_faqs (vendor_id, question, answer, display_order, created_at, updated_at)
VALUES 
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', 'What is your cancellation policy?', 'Full refund if cancelled 30 days before event. 50% refund if cancelled 15 days before.', 1, NOW(), NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', 'Do you travel for destination events?', 'Yes, we cover destination events. Travel and accommodation charges apply.', 2, NOW(), NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', 'How many photos will we receive?', 'Depends on package. Basic: 100+, Premium: 300+, Deluxe: 500+ edited photos.', 3, NOW(), NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', 'What is the delivery timeline?', 'Edited photos delivered within 7-21 days depending on package selected.', 4, NOW(), NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', 'Do you provide raw photos?', 'Raw photos available on request for an additional fee.', 5, NOW(), NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', 'What equipment do you use?', 'Professional Canon and Sony cameras with backup equipment.', 6, NOW(), NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', 'Can we select specific photos for editing?', 'Yes, you can select your favorites from the preview gallery.', 7, NOW(), NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', 'Do you offer videography services?', 'Yes, we offer combined photo and video packages.', 8, NOW(), NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', 'What is the advance payment required?', '30% advance to confirm booking, balance before event.', 9, NOW(), NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', 'Do you have a team or work solo?', 'We have a team of 5 photographers for large events.', 10, NOW(), NOW());

-- =====================================================
-- 4. AVAILABILITY SLOTS (Next 30 days, 6 slots per day)
-- =====================================================
INSERT INTO availability_slots (vendor_id, date, time_slot, status, created_at, updated_at)
SELECT 
    'b750411e-10d2-4bd8-9484-4f250fe7d33b'::uuid,
    (CURRENT_DATE + (day_offset || ' days')::interval)::date,
    time_slot,
    CASE 
        WHEN random() < 0.3 THEN 'BOOKED'
        WHEN random() < 0.1 THEN 'BLOCKED'
        ELSE 'AVAILABLE'
    END,
    NOW(),
    NOW()
FROM 
    generate_series(1, 30) AS day_offset,
    (VALUES ('09:00'), ('10:00'), ('11:00'), ('14:00'), ('15:00'), ('16:00')) AS times(time_slot)
ON CONFLICT (vendor_id, date, time_slot) DO NOTHING;

-- =====================================================
-- 5. REVIEWS (20 reviews)
-- =====================================================
INSERT INTO reviews (vendor_id, user_id, rating, comment, event_type, is_verified, is_visible, created_at, updated_at)
VALUES 
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 5.0, 'Amazing photography! Captured every moment perfectly.', 'Wedding', true, true, NOW() - INTERVAL '30 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 4.5, 'Great work, very professional team.', 'Birthday', true, true, NOW() - INTERVAL '28 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 5.0, 'Exceeded our expectations! Highly recommend.', 'Corporate', true, true, NOW() - INTERVAL '25 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 4.0, 'Good quality photos, timely delivery.', 'Wedding', true, true, NOW() - INTERVAL '22 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 5.0, 'Best photographer in the city!', 'Engagement', true, true, NOW() - INTERVAL '20 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 4.5, 'Very creative shots, loved the candid moments.', 'Wedding', true, true, NOW() - INTERVAL '18 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 4.0, 'Professional and punctual. Good experience.', 'Birthday', true, true, NOW() - INTERVAL '15 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 5.0, 'The album quality is outstanding!', 'Wedding', true, true, NOW() - INTERVAL '12 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 4.5, 'Great value for money. Will book again.', 'Corporate', true, true, NOW() - INTERVAL '10 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 5.0, 'Captured the essence of our special day perfectly.', 'Wedding', true, true, NOW() - INTERVAL '8 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 4.0, 'Good communication throughout the process.', 'Engagement', true, true, NOW() - INTERVAL '7 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 5.0, 'The drone shots were spectacular!', 'Wedding', true, true, NOW() - INTERVAL '6 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 4.5, 'Very patient with kids during the shoot.', 'Birthday', true, true, NOW() - INTERVAL '5 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 5.0, 'Delivered before the promised date!', 'Corporate', true, true, NOW() - INTERVAL '4 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 4.0, 'Nice editing style, modern look.', 'Wedding', true, true, NOW() - INTERVAL '3 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 5.0, 'Made us feel comfortable throughout.', 'Engagement', true, true, NOW() - INTERVAL '2 days', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 4.5, 'Great attention to detail.', 'Wedding', true, true, NOW() - INTERVAL '1 day', NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 5.0, 'The highlight reel was emotional and beautiful.', 'Wedding', true, true, NOW(), NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 4.0, 'Reasonable pricing for the quality delivered.', 'Birthday', true, true, NOW(), NOW()),
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', 5.0, 'Would definitely recommend to friends and family!', 'Wedding', true, true, NOW(), NOW());

-- =====================================================
-- 6. 200 LEADS (with valid statuses: NEW, OPEN, DECLINED, WITHDRAWN, CONVERTED)
-- =====================================================
INSERT INTO leads (vendor_id, user_id, name, email, phone, event_type, event_date, venue_address, guest_count, budget, message, status, source, created_at, updated_at)
SELECT 
    'b750411e-10d2-4bd8-9484-4f250fe7d33b'::uuid,
    CASE WHEN random() < 0.3 THEN '2860cf36-145c-442a-886b-29ec4571b2b8'::uuid ELSE NULL END,
    'Customer ' || i,
    'customer' || i || '@example.com',
    '+91' || (7000000000 + i)::text,
    (ARRAY['Wedding', 'Birthday', 'Corporate', 'Engagement', 'Anniversary'])[1 + (i % 5)],
    (CURRENT_DATE + ((i % 90) || ' days')::interval)::date,
    'Venue Address ' || i || ', ' || (ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'])[1 + (i % 5)],
    50 + (i % 450),
    (ARRAY['Under 25,000', '25,000 - 50,000', '50,000 - 1,00,000', '1,00,000 - 2,00,000', 'Above 2,00,000'])[1 + (i % 5)],
    'Looking for photography services for my ' || (ARRAY['wedding', 'birthday party', 'corporate event', 'engagement ceremony', 'anniversary celebration'])[1 + (i % 5)] || '. Please share your availability and packages.',
    (ARRAY['NEW', 'OPEN', 'DECLINED', 'WITHDRAWN', 'CONVERTED'])[1 + (i % 5)],
    (ARRAY['INQUIRY', 'DIRECT_ORDER', 'CHAT', 'OFFER'])[1 + (i % 4)],
    NOW() - ((i % 60) || ' days')::interval,
    NOW() - ((i % 60) || ' days')::interval
FROM generate_series(1, 200) AS i;

-- =====================================================
-- 7. 100 ORDERS (Bookings) - Mix of statuses
-- =====================================================
INSERT INTO orders (
    order_number, user_id, vendor_id, listing_id, item_type,
    event_type, event_date, event_time, venue_address, guest_count,
    base_amount, add_ons_amount, tax_amount, total_amount,
    token_amount, token_paid, balance_amount, awaiting_token_payment, payment_status, status,
    customer_name, customer_email, customer_phone, created_at, updated_at
)
SELECT 
    'EVT-2025-' || LPAD(i::text, 4, '0'),
    '2860cf36-145c-442a-886b-29ec4571b2b8'::uuid,
    'b750411e-10d2-4bd8-9484-4f250fe7d33b'::uuid,
    (ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333']::uuid[])[1 + (i % 3)],
    'package',
    (ARRAY['Wedding', 'Birthday', 'Corporate', 'Engagement', 'Anniversary'])[1 + (i % 5)],
    CASE 
        WHEN i <= 50 THEN (CURRENT_DATE - ((i % 30) || ' days')::interval)::date
        ELSE (CURRENT_DATE + ((i % 60) || ' days')::interval)::date
    END,
    (ARRAY['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'])[1 + (i % 6)],
    'Event Venue ' || i || ', ' || (ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'])[1 + (i % 5)],
    100 + (i % 400),
    (ARRAY[15000, 35000, 75000])[1 + (i % 3)]::decimal,
    (i % 10) * 500::decimal,
    ((ARRAY[15000, 35000, 75000])[1 + (i % 3)] * 0.18)::decimal,
    ((ARRAY[15000, 35000, 75000])[1 + (i % 3)] * 1.18 + (i % 10) * 500)::decimal,
    ((ARRAY[15000, 35000, 75000])[1 + (i % 3)] * 0.3)::decimal,
    CASE 
        WHEN i <= 50 THEN ((ARRAY[15000, 35000, 75000])[1 + (i % 3)] * 1.18 + (i % 10) * 500)::decimal
        ELSE ((ARRAY[15000, 35000, 75000])[1 + (i % 3)] * 0.3)::decimal
    END,
    CASE 
        WHEN i <= 50 THEN 0::decimal
        ELSE ((ARRAY[15000, 35000, 75000])[1 + (i % 3)] * 0.88 + (i % 10) * 500)::decimal
    END,
    CASE WHEN i > 95 THEN true ELSE false END,
    CASE 
        WHEN i <= 50 THEN 'paid'
        WHEN i <= 75 THEN 'partial'
        ELSE 'pending'
    END,
    CASE 
        WHEN i <= 50 THEN 'completed'
        WHEN i <= 60 THEN 'in-progress'
        WHEN i <= 80 THEN 'confirmed'
        WHEN i <= 95 THEN 'pending'
        ELSE 'cancelled'
    END,
    'Customer ' || i,
    'customer' || i || '@example.com',
    '+91' || (8000000000 + i)::text,
    NOW() - ((100 - i) || ' days')::interval,
    NOW() - ((100 - i) || ' days')::interval
FROM generate_series(1, 100) AS i
ON CONFLICT (order_number) DO NOTHING;

-- =====================================================
-- 8. ORDER TIMELINE for completed orders
-- =====================================================
INSERT INTO order_timeline (order_id, stage, status, notes, completed_at, created_at)
SELECT 
    o.id,
    stage.name,
    'completed',
    stage.note,
    o.created_at + (stage.days || ' days')::interval,
    o.created_at + (stage.days || ' days')::interval
FROM orders o
CROSS JOIN (
    VALUES 
        ('Lead Received', 'Initial inquiry received', 0),
        ('Quote Sent', 'Package details shared', 1),
        ('Token Paid', 'Advance payment received', 3),
        ('Booking Confirmed', 'Event date confirmed', 4),
        ('Event Completed', 'Photography completed', 30),
        ('Photos Delivered', 'Final photos delivered', 37)
) AS stage(name, note, days)
WHERE o.status = 'completed'
AND o.vendor_id = 'b750411e-10d2-4bd8-9484-4f250fe7d33b';

-- =====================================================
-- 9. CART ITEMS for customer
-- =====================================================
INSERT INTO cart_items (user_id, vendor_id, listing_id, item_type, quantity, base_price, final_price, event_date, event_time, created_at, updated_at)
VALUES 
    ('2860cf36-145c-442a-886b-29ec4571b2b8', 'b750411e-10d2-4bd8-9484-4f250fe7d33b', '22222222-2222-2222-2222-222222222222', 'package', 1, 35000.00, 35000.00, CURRENT_DATE + INTERVAL '30 days', '10:00', NOW(), NOW()),
    ('2860cf36-145c-442a-886b-29ec4571b2b8', 'b750411e-10d2-4bd8-9484-4f250fe7d33b', '11111111-1111-1111-1111-111111111111', 'package', 1, 15000.00, 15000.00, CURRENT_DATE + INTERVAL '45 days', '14:00', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- 10. CHAT THREADS
-- =====================================================
INSERT INTO chat_threads (vendor_id, user_id, last_message_at, is_read_by_vendor, is_read_by_user, created_at, updated_at)
VALUES 
    ('b750411e-10d2-4bd8-9484-4f250fe7d33b', '2860cf36-145c-442a-886b-29ec4571b2b8', NOW() - INTERVAL '1 hour', false, true, NOW() - INTERVAL '2 days', NOW())
ON CONFLICT (vendor_id, user_id) DO UPDATE SET 
    last_message_at = NOW() - INTERVAL '1 hour',
    updated_at = NOW();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
SELECT 'Seed data inserted successfully!' AS result;
SELECT 'Listings: ' || COUNT(*) FROM listings WHERE vendor_id = 'b750411e-10d2-4bd8-9484-4f250fe7d33b';
SELECT 'Leads: ' || COUNT(*) FROM leads WHERE vendor_id = 'b750411e-10d2-4bd8-9484-4f250fe7d33b';
SELECT 'Orders: ' || COUNT(*) FROM orders WHERE vendor_id = 'b750411e-10d2-4bd8-9484-4f250fe7d33b';
SELECT 'Reviews: ' || COUNT(*) FROM reviews WHERE vendor_id = 'b750411e-10d2-4bd8-9484-4f250fe7d33b';
SELECT 'FAQs: ' || COUNT(*) FROM vendor_faqs WHERE vendor_id = 'b750411e-10d2-4bd8-9484-4f250fe7d33b';
SELECT 'Availability Slots: ' || COUNT(*) FROM availability_slots WHERE vendor_id = 'b750411e-10d2-4bd8-9484-4f250fe7d33b';
SELECT 'Cart Items: ' || COUNT(*) FROM cart_items WHERE user_id = '2860cf36-145c-442a-886b-29ec4571b2b8';
