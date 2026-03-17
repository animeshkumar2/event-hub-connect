-- =====================================================
-- CARTEVENT - COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor
-- This creates ALL tables and seed data
-- =====================================================

-- Step 1: Setup schema
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
SET search_path TO public;

-- Step 2: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

-- =====================================================
-- REFERENCE TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS event_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    icon VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_type_categories (
    event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (event_type_id, category_id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- USER PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    phone VARCHAR(20) NOT NULL UNIQUE,
    avatar_url TEXT,
    google_id VARCHAR(255),
    password_hash TEXT,
    role VARCHAR(20) DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- VENDORS
-- =====================================================

CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    vendor_category_id VARCHAR(50) REFERENCES categories(id),
    custom_category_name VARCHAR(255),
    city_id INTEGER REFERENCES cities(id),
    city_name VARCHAR(100),
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    starting_price DECIMAL(10,2) DEFAULT 0,
    cover_image TEXT,
    profile_image TEXT,
    portfolio_images TEXT[],
    coverage_radius INTEGER DEFAULT 0,
    location_name VARCHAR(255),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    service_radius_km INTEGER DEFAULT 25,
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    email VARCHAR(255),
    instagram VARCHAR(100),
    website VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_past_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    image TEXT NOT NULL,
    event_type VARCHAR(50),
    event_date DATE,
    description TEXT,
    booking_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_wallets (
    vendor_id UUID PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0,
    pending_payouts DECIMAL(10,2) DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- LISTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'ITEM',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    listing_category_id VARCHAR(50) REFERENCES categories(id),
    custom_category_name VARCHAR(255),
    images TEXT[],
    highlights TEXT[],
    included_items_text TEXT[],
    excluded_items_text TEXT[],
    included_item_ids UUID[],
    delivery_time VARCHAR(255),
    extra_charges_json JSONB,
    extra_charges TEXT[],
    category_specific_data JSONB,
    unit VARCHAR(50),
    minimum_quantity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    is_draft BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    open_for_negotiation BOOLEAN DEFAULT TRUE,
    custom_notes TEXT,
    custom_event_type_name VARCHAR(100),
    service_mode VARCHAR(20) DEFAULT 'BOTH',
    venue_address TEXT,
    venue_city VARCHAR(100),
    venue_latitude DECIMAL(10,8),
    venue_longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_event_types (
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, event_type_id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS add_ons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(500),
    max_quantity INTEGER DEFAULT 10,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS package_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    item_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(package_id, item_id)
);

CREATE TABLE IF NOT EXISTS bookable_setups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    image TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ORDERS & CART
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    item_type VARCHAR(20) NOT NULL,
    event_type VARCHAR(50),
    event_date DATE,
    event_time VARCHAR(10),
    venue_address TEXT,
    guest_count INTEGER,
    base_amount DECIMAL(10,2) NOT NULL,
    add_ons_amount DECIMAL(10,2) DEFAULT 0,
    customizations_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    token_amount DECIMAL(10,2) DEFAULT 0,
    token_paid DECIMAL(10,2) DEFAULT 0,
    balance_amount DECIMAL(10,2),
    awaiting_token_payment BOOLEAN DEFAULT FALSE,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    status VARCHAR(20) DEFAULT 'PENDING',
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    notes TEXT,
    customizations JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL,
    quantity INTEGER DEFAULT 1,
    base_price DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2) NOT NULL,
    event_date DATE,
    event_time VARCHAR(10),
    customizations JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_item_add_ons (
    cart_item_id UUID REFERENCES cart_items(id) ON DELETE CASCADE,
    add_on_id UUID REFERENCES add_ons(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (cart_item_id, add_on_id)
);

CREATE TABLE IF NOT EXISTS order_add_ons (
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    add_on_id UUID REFERENCES add_ons(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, add_on_id)
);

-- =====================================================
-- PAYMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(20) DEFAULT 'token',
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50),
    transaction_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    payment_data JSONB,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    bank_name VARCHAR(255),
    account_holder_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    failure_reason TEXT
);

-- =====================================================
-- LEADS & OFFERS
-- =====================================================

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    event_type VARCHAR(50),
    event_date DATE,
    venue_address TEXT,
    guest_count INTEGER,
    budget VARCHAR(100),
    message TEXT,
    status VARCHAR(20) DEFAULT 'NEW',
    source VARCHAR(20) DEFAULT 'INQUIRY',
    token_amount DECIMAL(10,2),
    customer_location_name VARCHAR(255),
    customer_location_lat DECIMAL(10,8),
    customer_location_lng DECIMAL(11,8),
    distance_km DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    event_date DATE,
    event_type VARCHAR(100),
    guest_count INTEGER,
    venue_address TEXT,
    customizations TEXT,
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- REVIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    order_id UUID,
    rating DECIMAL(3,2) NOT NULL,
    comment TEXT,
    event_type VARCHAR(50),
    images TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    event_type VARCHAR(100),
    event_date DATE,
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending',
    review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CHAT
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP,
    is_read_by_vendor BOOLEAN DEFAULT FALSE,
    is_read_by_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vendor_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    attachment_type VARCHAR(20),
    attachment_url TEXT,
    attachment_name VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- AVAILABILITY
-- =====================================================

CREATE TABLE IF NOT EXISTS availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    time_slot_type VARCHAR(20) DEFAULT 'FULL_DAY',
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    category_id VARCHAR(50),
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    order_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vendor_id, date, time_slot)
);

-- =====================================================
-- MISC TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID,
    session_id VARCHAR(255),
    page_path VARCHAR(500),
    referrer VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geocoding_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query VARCHAR(500) NOT NULL UNIQUE,
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    formatted_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS callback_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    event_date DATE,
    event_date_not_decided BOOLEAN DEFAULT FALSE,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    phone VARCHAR(20),
    city VARCHAR(100),
    event_type VARCHAR(100),
    event_date DATE,
    source VARCHAR(50) DEFAULT 'website',
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_vendors_user ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(vendor_category_id);
CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city_id);
CREATE INDEX IF NOT EXISTS idx_listings_vendor ON listings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(listing_category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_leads_vendor ON leads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_vendor ON chat_threads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_user ON chat_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor ON reviews(vendor_id);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Event Types
INSERT INTO event_types (name, display_name) VALUES
('Wedding', 'Wedding'),
('Birthday', 'Birthday'),
('Anniversary', 'Anniversary'),
('Corporate', 'Corporate Event'),
('Engagement', 'Engagement'),
('Baby Shower', 'Baby Shower'),
('Nightlife', 'Nightlife & Parties'),
('Concert', 'Concerts & Live Shows'),
('Other', 'Other')
ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name;

-- Categories
INSERT INTO categories (id, name, display_name, icon) VALUES
('photo-video', 'Photography & Videography', 'Photography & Videography', '📸'),
('decorator', 'Décor', 'Décor', '🎨'),
('caterer', 'Catering', 'Catering', '🍽'),
('venue', 'Venue', 'Venue', '🏛'),
('mua', 'Makeup & Styling', 'Makeup & Styling', '💄'),
('dj-entertainment', 'DJ & Entertainment', 'DJ & Entertainment', '🎧'),
('sound-lights', 'Sound & Lights', 'Sound & Lights', '🔊'),
('artists', 'Artists & Performers', 'Artists & Performers', '🎭'),
('event-planner', 'Event Planner', 'Event Planner', '📋'),
('other', 'Other', 'Other Services', '✨')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  icon = EXCLUDED.icon;

-- Cities
INSERT INTO cities (name, state, country) VALUES
('Mumbai', 'Maharashtra', 'India'),
('Delhi', 'Delhi', 'India'),
('Bangalore', 'Karnataka', 'India'),
('Hyderabad', 'Telangana', 'India'),
('Chennai', 'Tamil Nadu', 'India'),
('Kolkata', 'West Bengal', 'India'),
('Pune', 'Maharashtra', 'India'),
('Ahmedabad', 'Gujarat', 'India'),
('Jaipur', 'Rajasthan', 'India'),
('Goa', 'Goa', 'India')
ON CONFLICT (name) DO UPDATE SET state = EXCLUDED.state;

-- Event Type Category Mappings (all categories for all event types)
INSERT INTO event_type_categories (event_type_id, category_id)
SELECT et.id, c.id FROM event_types et, categories c
ON CONFLICT DO NOTHING;

-- =====================================================
-- DONE!
-- =====================================================
SELECT 'Setup complete!' as status;
