-- =====================================================
-- Offers/Negotiation Table
-- Allows users to make offers on listings, similar to OLX
-- =====================================================

CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Offer details
    offered_price DECIMAL(10,2) NOT NULL CHECK (offered_price > 0),
    original_price DECIMAL(10,2) NOT NULL CHECK (original_price > 0),
    message TEXT, -- Optional message with the offer
    
    -- Event details (optional, can be provided with offer)
    event_type VARCHAR(50),
    event_date DATE,
    event_time VARCHAR(10),
    venue_address TEXT,
    guest_count INTEGER,
    
    -- Offer status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'expired', 'withdrawn')),
    
    -- Counter offer (if vendor counters)
    counter_price DECIMAL(10,2) CHECK (counter_price > 0),
    counter_message TEXT,
    
    -- Order reference (if offer is accepted and converted to order)
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    -- Lead reference (if offer creates/updates a lead)
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    expired_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_offers_thread_id ON offers(thread_id);
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_user_id ON offers(user_id);
CREATE INDEX IF NOT EXISTS idx_offers_vendor_id ON offers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_order_id ON offers(order_id);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers(created_at DESC);

-- Add comment
COMMENT ON TABLE offers IS 'Stores negotiation offers made by users on listings, similar to OLX negotiation feature';
COMMENT ON COLUMN offers.offered_price IS 'Price offered by the user';
COMMENT ON COLUMN offers.original_price IS 'Original listing price at the time of offer';
COMMENT ON COLUMN offers.counter_price IS 'Counter offer price from vendor (if vendor counters)';
COMMENT ON COLUMN offers.status IS 'pending: waiting for vendor response, accepted: vendor accepted, rejected: vendor rejected, countered: vendor made counter offer, expired: offer expired, withdrawn: user withdrew offer';



