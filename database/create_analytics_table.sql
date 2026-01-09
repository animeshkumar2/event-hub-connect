-- =====================================================
-- Analytics Tracking Table
-- Tracks website visitors and signups
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('page_view', 'signup', 'login', 'vendor_signup', 'customer_signup')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous visitors
    session_id VARCHAR(255), -- Track sessions
    page_path VARCHAR(500), -- Which page was visited
    referrer VARCHAR(500), -- Where they came from
    user_agent TEXT, -- Browser/device info
    ip_address VARCHAR(45), -- IPv4 or IPv6
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50), -- mobile, desktop, tablet
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type_date ON analytics_events(event_type, created_at);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_type_date_user ON analytics_events(event_type, created_at, user_id);







