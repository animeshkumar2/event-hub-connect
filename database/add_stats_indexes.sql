-- =====================================================
-- Add Indexes for Stats Queries Optimization
-- These indexes will make COUNT and AVG queries much faster
-- =====================================================

-- Index for verified vendors count
CREATE INDEX IF NOT EXISTS idx_vendors_is_verified 
ON vendors(is_verified) 
WHERE is_verified = true;

-- Index for vendor count (already has primary key, but this helps with COUNT(*))
-- PostgreSQL automatically uses primary key for COUNT(*), but explicit index helps

-- Index for completed orders count
CREATE INDEX IF NOT EXISTS idx_orders_status_completed 
ON orders(status) 
WHERE status = 'COMPLETED';

-- Index for reviews with rating >= 4 (satisfaction rate calculation)
CREATE INDEX IF NOT EXISTS idx_reviews_rating_satisfied 
ON reviews(rating) 
WHERE rating >= 4.0;

-- Index for vendors with rating (for average rating calculation)
CREATE INDEX IF NOT EXISTS idx_vendors_rating_review_count 
ON vendors(rating, review_count) 
WHERE rating IS NOT NULL AND review_count > 0;

-- Composite index for faster vendor stats queries
CREATE INDEX IF NOT EXISTS idx_vendors_stats 
ON vendors(is_verified, rating, review_count);

-- =====================================================
-- Verify indexes were created
-- =====================================================
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('vendors', 'orders', 'reviews')
-- AND indexname LIKE 'idx_%stats%' OR indexname LIKE 'idx_%verified%' OR indexname LIKE 'idx_%completed%' OR indexname LIKE 'idx_%rating%';






