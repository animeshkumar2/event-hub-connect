-- Create callback_requests table for Request Callback feature
-- This stores customer callback requests from listing pages

CREATE TABLE IF NOT EXISTS callback_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(10) NOT NULL,
    event_date DATE,
    date_flexible BOOLEAN DEFAULT FALSE,
    requirement TEXT,
    listing_id VARCHAR(255),
    listing_name VARCHAR(255),
    vendor_id UUID REFERENCES vendors(id),
    vendor_name VARCHAR(255),
    category VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    called_at TIMESTAMP,
    called_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup of pending callbacks
CREATE INDEX IF NOT EXISTS idx_callback_requests_status ON callback_requests(status);

-- Index for vendor lookup
CREATE INDEX IF NOT EXISTS idx_callback_requests_vendor ON callback_requests(vendor_id);

-- Index for mobile (spam prevention)
CREATE INDEX IF NOT EXISTS idx_callback_requests_mobile ON callback_requests(mobile);

-- Index for created_at (sorting)
CREATE INDEX IF NOT EXISTS idx_callback_requests_created ON callback_requests(created_at DESC);

COMMENT ON TABLE callback_requests IS 'Stores customer callback requests from listing pages';
COMMENT ON COLUMN callback_requests.status IS 'PENDING, CALLED, CONNECTED, NOT_REACHABLE, NOT_INTERESTED, CONVERTED';
