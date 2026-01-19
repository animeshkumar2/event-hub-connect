-- =====================================================
-- Event Hub Connect - Performance Indexes V2
-- Run this in Supabase SQL Editor to speed up queries
-- =====================================================

-- =====================================================
-- LEADS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_leads_vendor_id ON leads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_vendor_created ON leads(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_vendor_status ON leads(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_order_id ON leads(order_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- =====================================================
-- LISTINGS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_listings_vendor_id ON listings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_listings_vendor_created ON listings(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(listing_category_id);
CREATE INDEX IF NOT EXISTS idx_listings_popular ON listings(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_listings_trending ON listings(is_trending) WHERE is_trending = true;

-- =====================================================
-- ORDERS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_status ON orders(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_event_date ON orders(vendor_id, event_date);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_created ON orders(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_event_date ON orders(event_date);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);
-- Composite index for upcoming bookings query
CREATE INDEX IF NOT EXISTS idx_orders_vendor_date_status ON orders(vendor_id, event_date, status);

-- =====================================================
-- REVIEWS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_created ON reviews(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- =====================================================
-- AVAILABILITY SLOTS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_availability_vendor_id ON availability_slots(vendor_id);
CREATE INDEX IF NOT EXISTS idx_availability_vendor_date ON availability_slots(vendor_id, date);
CREATE INDEX IF NOT EXISTS idx_availability_vendor_date_status ON availability_slots(vendor_id, date, status);
CREATE INDEX IF NOT EXISTS idx_availability_status ON availability_slots(status);

-- =====================================================
-- VENDOR FAQS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_vendor_faqs_vendor_id ON vendor_faqs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_faqs_vendor_order ON vendor_faqs(vendor_id, display_order);

-- =====================================================
-- CART ITEMS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_vendor_id ON cart_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_listing_id ON cart_items(listing_id);

-- =====================================================
-- CHAT THREADS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_chat_threads_vendor_id ON chat_threads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON chat_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_last_message ON chat_threads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_vendor_last_msg ON chat_threads(vendor_id, last_message_at DESC);

-- =====================================================
-- MESSAGES TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON messages(thread_id, created_at DESC);

-- =====================================================
-- ORDER TIMELINE TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_order_timeline_order_created ON order_timeline(order_id, created_at);

-- =====================================================
-- VENDORS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(vendor_category_id);
CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city_id);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating DESC);

-- =====================================================
-- VENDOR WALLETS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_vendor_wallets_vendor_id ON vendor_wallets(vendor_id);

-- =====================================================
-- PAYMENTS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_vendor_id ON payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =====================================================
-- ANALYZE TABLES (Update statistics for query planner)
-- =====================================================
ANALYZE leads;
ANALYZE listings;
ANALYZE orders;
ANALYZE reviews;
ANALYZE availability_slots;
ANALYZE vendor_faqs;
ANALYZE cart_items;
ANALYZE chat_threads;
ANALYZE messages;
ANALYZE order_timeline;
ANALYZE vendors;
ANALYZE vendor_wallets;
ANALYZE payments;

SELECT 'All performance indexes created and tables analyzed!' AS result;
