-- Create customer_waitlist table for Phase 1 customer lead capture
-- This table stores customer information who are interested in the platform
-- before the customer features are launched

CREATE TABLE IF NOT EXISTS customer_waitlist (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notified BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_waitlist_email ON customer_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_customer_waitlist_created_at ON customer_waitlist(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_waitlist_notified ON customer_waitlist(notified);

-- Add comment to table
COMMENT ON TABLE customer_waitlist IS 'Stores customer waitlist entries for Phase 1 launch';
