-- =====================================================
-- Event Hub Connect - Database Schema V2
-- PostgreSQL (Supabase)
-- Unified Listings Table (Packages + Items)
-- Supports both text descriptions AND item references
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. REFERENCE DATA TABLES
-- =====================================================

-- Event Types (Reference Data)
CREATE TABLE IF NOT EXISTS event_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories (Reference Data)
-- Used for BOTH vendor.category and listing.category
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'photographer', 'decorator'
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    icon VARCHAR(10), -- Emoji icon
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Event Type → Category Mapping (Junction Table)
-- Defines which categories are valid for each event type
CREATE TABLE IF NOT EXISTS event_type_categories (
    event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (event_type_id, category_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cities (Reference Data)
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. USER MANAGEMENT (Using Supabase Auth)
-- =====================================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. VENDOR TABLES
-- =====================================================

-- Vendors
-- vendor_category_id = Vendor's PRIMARY business category
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    vendor_category_id VARCHAR(50) NOT NULL REFERENCES categories(id), -- Vendor's primary category
    city_id INTEGER REFERENCES cities(id),
    city_name VARCHAR(100), -- Denormalized for quick access
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    starting_price DECIMAL(10,2) DEFAULT 0,
    cover_image TEXT,
    portfolio_images TEXT[], -- Array of image URLs
    coverage_radius INTEGER DEFAULT 0, -- in km
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendor Past Events (Gallery)
CREATE TABLE IF NOT EXISTS vendor_past_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    image TEXT NOT NULL,
    event_type VARCHAR(50),
    event_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. LISTINGS TABLE (Unified: Packages + Items)
-- =====================================================

-- Listings (Unified table for both Packages and Individual Items)
-- type: 'package' = Package listing
-- type: 'item' = Individual item listing
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('package', 'item')),
    
    -- Common fields
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    listing_category_id VARCHAR(50) NOT NULL REFERENCES categories(id), -- Listing's category
    images TEXT[], -- Array of image URLs
    
    -- Package-specific fields (NULL for items)
    included_items_text TEXT[], -- Text descriptions (for display/marketing)
    excluded_items_text TEXT[], -- Text descriptions of what's NOT included
    delivery_time VARCHAR(255),
    extra_charges TEXT[], -- Array of extra charges
    bookable_setup_id UUID, -- Reference to bookable_setups table
    
    -- Item-specific fields (NULL for packages)
    unit VARCHAR(50), -- e.g., "per piece", "per set", "per hour", "per day"
    minimum_quantity INTEGER DEFAULT 1 CHECK (minimum_quantity > 0),
    
    -- Common fields
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Package Items (Junction Table)
-- Links packages to actual items (for custom packages, tracking, analytics)
-- This enables packages to reference actual items, not just text descriptions
-- Note: PostgreSQL doesn't allow subqueries in CHECK constraints.
-- Validation that package_id is 'package' and item_id is 'item' is enforced at application level.
CREATE TABLE IF NOT EXISTS package_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10,2), -- Snapshot price at time of linking
    display_order INTEGER DEFAULT 0, -- Order in which items appear in package
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Prevent duplicate item in same package
    UNIQUE(package_id, item_id)
    -- Business Rule: package_id must be type='package', item_id must be type='item'
    -- This is enforced at the application level (Java backend)
);

-- Listing Event Types (Junction Table)
-- Many-to-Many: Listings ↔ Event Types
-- Works for both packages and items
CREATE TABLE IF NOT EXISTS listing_event_types (
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, event_type_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add-Ons (for Packages only)
-- Note: PostgreSQL doesn't allow subqueries in CHECK constraints.
-- Validation that package_id is type='package' is enforced at application level.
CREATE TABLE IF NOT EXISTS add_ons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    -- Business Rule: package_id must be type='package'
    -- This is enforced at the application level (Java backend)
);

-- Bookable Setups
CREATE TABLE IF NOT EXISTS bookable_setups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    package_id UUID REFERENCES listings(id) ON DELETE SET NULL, -- Optional link to package
    image TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category_id VARCHAR(50) NOT NULL REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. REVIEWS & FAQs
-- =====================================================

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID, -- Reference to orders table (optional)
    rating DECIMAL(3,2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    event_type VARCHAR(50),
    images TEXT[], -- Array of review images
    is_verified BOOLEAN DEFAULT FALSE, -- Verified purchase
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendor FAQs
CREATE TABLE IF NOT EXISTS vendor_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. AVAILABILITY & CALENDAR
-- =====================================================

-- Vendor Availability Slots
CREATE TABLE IF NOT EXISTS availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot VARCHAR(10) NOT NULL, -- HH:MM format
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'busy', 'blocked')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vendor_id, date, time_slot)
);

-- =====================================================
-- 7. CART & ORDERS
-- =====================================================

-- Cart Items (can be package OR item)
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    -- Either package_id OR listing_id (not both)
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('package', 'item')),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    base_price DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2) NOT NULL, -- After add-ons and customizations
    event_date DATE,
    event_time VARCHAR(10), -- HH:MM format
    customizations JSONB, -- Flexible JSON for custom options
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    -- Business Rule: item_type must match listing.type
    -- This is enforced at the application level (Java backend)
);

-- Cart Item Add-Ons (Junction Table) - Only for packages
CREATE TABLE IF NOT EXISTS cart_item_add_ons (
    cart_item_id UUID REFERENCES cart_items(id) ON DELETE CASCADE,
    add_on_id UUID REFERENCES add_ons(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL, -- Snapshot price at time of cart
    PRIMARY KEY (cart_item_id, add_on_id)
);

-- Orders (can be package OR item)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "EVT-2024-001"
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    -- Either package_id OR listing_id (not both)
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE SET NULL,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('package', 'item')),
    
    -- Order Details
    event_type VARCHAR(50),
    event_date DATE,
    event_time VARCHAR(10),
    venue_address TEXT,
    guest_count INTEGER,
    
    -- Pricing
    base_amount DECIMAL(10,2) NOT NULL,
    add_ons_amount DECIMAL(10,2) DEFAULT 0,
    customizations_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment
    token_paid DECIMAL(10,2) DEFAULT 0, -- Advance payment
    balance_amount DECIMAL(10,2), -- Remaining amount
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    
    -- Order Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'disputed')),
    
    -- Customer Details
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    
    -- Metadata
    notes TEXT,
    customizations JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    -- Business Rule: item_type must match listing.type
    -- This is enforced at the application level (Java backend)
);

-- Order Add-Ons (Junction Table) - Only for packages
CREATE TABLE IF NOT EXISTS order_add_ons (
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    add_on_id UUID REFERENCES add_ons(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL, -- Snapshot price at time of order
    PRIMARY KEY (order_id, add_on_id)
);

-- Order Timeline (Status History)
CREATE TABLE IF NOT EXISTS order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL, -- e.g., "Lead Received", "Token Paid", "Booking Confirmed"
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL, -- 'razorpay', 'stripe', 'cash', etc.
    payment_gateway VARCHAR(50), -- 'razorpay', 'stripe'
    transaction_id VARCHAR(255), -- Payment gateway transaction ID
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_data JSONB, -- Store gateway response
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. LEADS & INQUIRIES
-- =====================================================

-- Leads (Inquiries before booking)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be anonymous
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    event_type VARCHAR(50),
    event_date DATE,
    venue_address TEXT,
    guest_count INTEGER,
    budget VARCHAR(100), -- e.g., "50,000 - 1,00,000"
    message TEXT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'open', 'quoted', 'accepted', 'declined', 'converted')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Quotes (Vendor responses to leads)
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    item_type VARCHAR(20) CHECK (item_type IN ('package', 'item')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 9. COMMUNICATION
-- =====================================================

-- Chat Threads
CREATE TABLE IF NOT EXISTS chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    last_message TEXT,
    last_message_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'lead' CHECK (status IN ('lead', 'booked')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vendor_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('vendor', 'customer')),
    text TEXT NOT NULL,
    attachment_type VARCHAR(20) CHECK (attachment_type IN ('image', 'pdf', 'document')),
    attachment_url TEXT,
    attachment_name VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 10. FINANCIAL (Vendor Wallet)
-- =====================================================

-- Vendor Wallet
CREATE TABLE IF NOT EXISTS vendor_wallets (
    vendor_id UUID PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0 CHECK (balance >= 0),
    pending_payouts DECIMAL(10,2) DEFAULT 0 CHECK (pending_payouts >= 0),
    total_earnings DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payouts
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    bank_name VARCHAR(255),
    account_holder_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    requested_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    failure_reason TEXT
);

-- =====================================================
-- 11. INDEXES (Performance Optimization)
-- =====================================================

-- Vendor indexes
CREATE INDEX idx_vendors_category ON vendors(vendor_category_id);
CREATE INDEX idx_vendors_city ON vendors(city_id);
CREATE INDEX idx_vendors_user ON vendors(user_id);
CREATE INDEX idx_vendors_active ON vendors(is_active) WHERE is_active = TRUE;

-- Listing indexes
CREATE INDEX idx_listings_vendor ON listings(vendor_id);
CREATE INDEX idx_listings_category ON listings(listing_category_id);
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_active ON listings(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_listings_popular ON listings(is_popular) WHERE is_popular = TRUE;

-- Package Items indexes
CREATE INDEX idx_package_items_package ON package_items(package_id);
CREATE INDEX idx_package_items_item ON package_items(item_id);

-- Order indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(event_date);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_listing ON orders(listing_id);

-- Cart indexes
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_vendor ON cart_items(vendor_id);

-- Review indexes
CREATE INDEX idx_reviews_vendor ON reviews(vendor_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Availability indexes
CREATE INDEX idx_availability_vendor_date ON availability_slots(vendor_id, date);
CREATE INDEX idx_availability_status ON availability_slots(status);

-- Chat indexes
CREATE INDEX idx_chat_threads_vendor ON chat_threads(vendor_id);
CREATE INDEX idx_chat_threads_user ON chat_threads(user_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- =====================================================
-- 12. TRIGGERS (Auto-update timestamps)
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. ROW LEVEL SECURITY (RLS) Policies
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Vendors: Vendors can only see/edit their own vendor profile
CREATE POLICY "Vendors can view own vendor" ON vendors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update own vendor" ON vendors
    FOR UPDATE USING (auth.uid() = user_id);

-- Cart items: Users can only see/edit their own cart
CREATE POLICY "Users can view own cart" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Orders: Users can see their own orders, vendors can see orders for their vendors
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Vendors can view own vendor orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE vendors.id = orders.vendor_id 
            AND vendors.user_id = auth.uid()
        )
    );

-- =====================================================
-- END OF SCHEMA
-- =====================================================
