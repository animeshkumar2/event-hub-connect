-- =====================================================
-- Additional Performance Indexes for Admin Queries
-- These indexes specifically target admin dashboard queries
-- =====================================================

-- Composite indexes for common admin query patterns
CREATE INDEX IF NOT EXISTS idx_orders_vendor_status_created 
ON orders(vendor_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_leads_vendor_created 
ON leads(vendor_id, created_at);

CREATE INDEX IF NOT EXISTS idx_reviews_vendor_created 
ON reviews(vendor_id, created_at);

CREATE INDEX IF NOT EXISTS idx_listings_vendor_active_created 
ON listings(vendor_id, is_active, created_at);

-- Index for category distribution query
CREATE INDEX IF NOT EXISTS idx_listings_category_custom 
ON listings(listing_category_id, custom_category_name) 
WHERE listing_category_id IS NOT NULL;

-- Index for city distribution query
CREATE INDEX IF NOT EXISTS idx_vendors_city_active 
ON vendors(city_name, is_active) 
WHERE city_name IS NOT NULL;

-- Covering index for vendor stats (includes all commonly queried fields)
CREATE INDEX IF NOT EXISTS idx_vendors_stats_covering 
ON vendors(id, is_active, is_verified, rating, review_count, created_at, city_name);

-- Index for listing category aggregation
CREATE INDEX IF NOT EXISTS idx_listings_category_aggregation 
ON listings(listing_category_id, custom_category_name, is_active);

-- =====================================================
-- Analyze tables to update statistics for query planner
-- =====================================================
ANALYZE user_profiles;
ANALYZE vendors;
ANALYZE listings;
ANALYZE orders;
ANALYZE reviews;
ANALYZE leads;
ANALYZE analytics_events;

