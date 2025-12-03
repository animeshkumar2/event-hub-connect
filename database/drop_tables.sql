-- =====================================================
-- Event Hub Connect - Drop Tables Script
-- Run this BEFORE creating new schema
-- =====================================================

-- Drop tables in reverse dependency order (child tables first)
-- Using CASCADE to automatically drop dependent objects

-- Drop junction tables first
DROP TABLE IF EXISTS order_add_ons CASCADE;
DROP TABLE IF EXISTS cart_item_add_ons CASCADE;
DROP TABLE IF EXISTS package_items CASCADE;
DROP TABLE IF EXISTS listing_event_types CASCADE;
DROP TABLE IF EXISTS package_event_types CASCADE;
DROP TABLE IF EXISTS order_timeline CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_threads CASCADE;
DROP TABLE IF EXISTS payouts CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS vendor_wallets CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS vendor_faqs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS bookable_setups CASCADE;
DROP TABLE IF EXISTS add_ons CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS vendor_past_events CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS event_type_categories CASCADE;

-- All tables dropped above with CASCADE
-- This ensures all dependencies are handled automatically

-- Drop reference data tables (keep these if you want to preserve data)
-- Uncomment if you want to drop reference data too
-- DROP TABLE IF EXISTS cities CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS event_types CASCADE;

-- Note: Triggers and functions are automatically dropped when tables are dropped with CASCADE
-- No need to drop them explicitly

-- =====================================================
-- END OF DROP SCRIPT
-- =====================================================

