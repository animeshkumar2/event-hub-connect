-- =====================================================
-- Phase 1 Location System - Database Migration
-- =====================================================

-- =====================================================
-- 1. VENDOR LOCATION FIELDS
-- =====================================================

-- Add location fields to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS service_radius_km INTEGER DEFAULT 25;

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors(location_lat, location_lng) 
    WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

-- =====================================================
-- 2. LISTING SERVICE MODE FIELD
-- =====================================================

-- Add service_mode to listings table
-- Values: CUSTOMER_VISITS, VENDOR_TRAVELS, BOTH
ALTER TABLE listings ADD COLUMN IF NOT EXISTS service_mode VARCHAR(20) DEFAULT 'BOTH';

-- Add check constraint for valid service modes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'listings_service_mode_check'
    ) THEN
        ALTER TABLE listings ADD CONSTRAINT listings_service_mode_check 
            CHECK (service_mode IN ('CUSTOMER_VISITS', 'VENDOR_TRAVELS', 'BOTH'));
    END IF;
END $$;

-- =====================================================
-- 3. LEAD LOCATION FIELDS
-- =====================================================

-- Add customer location fields to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS customer_location_name VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS customer_location_lat DECIMAL(10, 8);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS customer_location_lng DECIMAL(11, 8);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS distance_km DECIMAL(6, 2);

-- =====================================================
-- 4. GEOCODING CACHE TABLE
-- =====================================================

-- Create geocoding cache table for storing API responses
CREATE TABLE IF NOT EXISTS geocoding_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text VARCHAR(500) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
    CONSTRAINT geocoding_cache_query_unique UNIQUE(query_text)
);

-- Add indexes for geocoding cache
CREATE INDEX IF NOT EXISTS idx_geocoding_cache_query ON geocoding_cache(query_text);
CREATE INDEX IF NOT EXISTS idx_geocoding_cache_expires ON geocoding_cache(expires_at);

-- =====================================================
-- 5. UPDATE EXISTING DATA
-- =====================================================

-- Set default service_mode for existing listings that have NULL
UPDATE listings SET service_mode = 'BOTH' WHERE service_mode IS NULL;

-- Set default service_radius_km for existing vendors that have NULL or 0
UPDATE vendors SET service_radius_km = 25 WHERE service_radius_km IS NULL OR service_radius_km = 0;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
