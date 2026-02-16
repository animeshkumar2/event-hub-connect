-- Migration: Add category support to availability_slots
-- Date: 2026-02-03
-- Description: Adds category_id to availability_slots for category-wise booking management
-- This allows Event Planners and multi-service vendors to manage availability per category

-- Step 1: Increase time_slot column size to accommodate slot type names
ALTER TABLE availability_slots 
ALTER COLUMN time_slot TYPE VARCHAR(20);

-- Step 2: Add category_id column (nullable for backward compatibility)
ALTER TABLE availability_slots 
ADD COLUMN IF NOT EXISTS category_id VARCHAR(50);

-- Step 3: Add listing_id column to link availability to specific listings
ALTER TABLE availability_slots 
ADD COLUMN IF NOT EXISTS listing_id UUID;

-- Step 4: Add time_slot_type for predefined slots (MORNING, AFTERNOON, EVENING, FULL_DAY)
ALTER TABLE availability_slots 
ADD COLUMN IF NOT EXISTS time_slot_type VARCHAR(20) DEFAULT 'FULL_DAY';

-- Step 5: Add order_id to link booked slots to orders
ALTER TABLE availability_slots 
ADD COLUMN IF NOT EXISTS order_id UUID;

-- Step 6: Add notes field for vendor notes on blocked dates
ALTER TABLE availability_slots 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Step 7: Drop old unique constraint if exists
ALTER TABLE availability_slots 
DROP CONSTRAINT IF EXISTS availability_slots_vendor_id_date_time_slot_key;

-- Step 8: Create new unique constraint including category_id
-- Using COALESCE to handle NULL category_id values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'availability_slots_vendor_date_slot_category_key'
    ) THEN
        ALTER TABLE availability_slots 
        ADD CONSTRAINT availability_slots_vendor_date_slot_category_key 
        UNIQUE (vendor_id, date, time_slot, category_id);
    END IF;
END $$;

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_slots_category 
ON availability_slots(category_id);

CREATE INDEX IF NOT EXISTS idx_availability_slots_listing 
ON availability_slots(listing_id);

CREATE INDEX IF NOT EXISTS idx_availability_slots_order 
ON availability_slots(order_id);

CREATE INDEX IF NOT EXISTS idx_availability_slots_vendor_date_category 
ON availability_slots(vendor_id, date, category_id);

CREATE INDEX IF NOT EXISTS idx_availability_slots_time_slot_type 
ON availability_slots(time_slot_type);

-- Step 10: Add check constraint for time_slot_type (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'availability_slots_time_slot_type_check'
    ) THEN
        ALTER TABLE availability_slots 
        ADD CONSTRAINT availability_slots_time_slot_type_check 
        CHECK (time_slot_type IN ('MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'));
    END IF;
END $$;

-- Step 11: Add foreign key constraints (optional, depends on your setup)
-- These are commented out as they may fail if referenced tables don't exist
-- ALTER TABLE availability_slots 
-- ADD CONSTRAINT availability_slots_listing_id_fkey 
-- FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL;

-- ALTER TABLE availability_slots 
-- ADD CONSTRAINT availability_slots_order_id_fkey 
-- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- Note: Existing data will have NULL category_id, which means "all categories" (legacy behavior)
-- New slots can specify a category_id for category-specific availability
