-- =====================================================
-- Add Indexes for Admin and Analytics Queries
-- These indexes optimize admin dashboard and analytics queries
-- =====================================================

-- User Profile indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role 
ON user_profiles(role);

CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at 
ON user_profiles(created_at);

-- Vendor indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_vendors_created_at 
ON vendors(created_at);

CREATE INDEX IF NOT EXISTS idx_vendors_city_name 
ON vendors(city_name) 
WHERE city_name IS NOT NULL;

-- Listing indexes
CREATE INDEX IF NOT EXISTS idx_listings_vendor_id 
ON listings(vendor_id);

CREATE INDEX IF NOT EXISTS idx_listings_is_active 
ON listings(is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_listings_created_at 
ON listings(created_at);

CREATE INDEX IF NOT EXISTS idx_listings_category_id 
ON listings(listing_category_id);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id 
ON orders(vendor_id);

CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at 
ON orders(status, created_at);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id 
ON reviews(vendor_id);

CREATE INDEX IF NOT EXISTS idx_reviews_rating 
ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
ON reviews(created_at);

-- Lead indexes
CREATE INDEX IF NOT EXISTS idx_leads_vendor_id 
ON leads(vendor_id);

CREATE INDEX IF NOT EXISTS idx_leads_created_at 
ON leads(created_at);

CREATE INDEX IF NOT EXISTS idx_leads_status 
ON leads(status);

-- Analytics event indexes (already created in create_analytics_table.sql, but ensuring they exist)
-- These are already in create_analytics_table.sql, but we'll verify they exist
CREATE INDEX IF NOT EXISTS idx_analytics_event_type 
ON analytics_events(event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at 
ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id 
ON analytics_events(user_id) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_session_id 
ON analytics_events(session_id) 
WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_event_type_date 
ON analytics_events(event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_type_date_user 
ON analytics_events(event_type, created_at, user_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_vendors_active_verified 
ON vendors(is_active, is_verified) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_listings_vendor_active 
ON listings(vendor_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_orders_vendor_status 
ON orders(vendor_id, status);

-- =====================================================
-- Verify indexes were created
-- =====================================================
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('user_profiles', 'vendors', 'listings', 'orders', 'reviews', 'leads', 'analytics_events')
-- ORDER BY tablename, indexname;
