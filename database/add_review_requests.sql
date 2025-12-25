-- Review Requests Tracking Table
-- Tracks when vendors request reviews from customers

CREATE TABLE IF NOT EXISTS review_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    requested_at TIMESTAMP DEFAULT NOW(),
    email_sent BOOLEAN DEFAULT FALSE,
    email_opened BOOLEAN DEFAULT FALSE,
    review_submitted BOOLEAN DEFAULT FALSE,
    
    -- Prevent duplicate requests for same order
    UNIQUE(order_id),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_requests_vendor ON review_requests(vendor_id, requested_at);
CREATE INDEX IF NOT EXISTS idx_review_requests_customer ON review_requests(customer_id, requested_at);
CREATE INDEX IF NOT EXISTS idx_review_requests_order ON review_requests(order_id);

-- Comments
COMMENT ON TABLE review_requests IS 'Tracks review requests sent by vendors to customers';
COMMENT ON COLUMN review_requests.email_opened IS 'Tracks if customer opened the review request email';
COMMENT ON COLUMN review_requests.review_submitted IS 'Tracks if customer submitted a review after request';
