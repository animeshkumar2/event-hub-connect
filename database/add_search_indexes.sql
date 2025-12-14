-- Improves search performance for listings/vendor search filters
-- Apply this on the deployment database

-- Listings base filters
CREATE INDEX IF NOT EXISTS idx_listings_active_type_category_price
  ON listings (is_active, type, listing_category_id, price);

-- City filter joins
CREATE INDEX IF NOT EXISTS idx_vendors_city_name
  ON vendors (city_name);

-- Event type mapping
CREATE INDEX IF NOT EXISTS idx_listing_event_types_event_type
  ON listing_event_types (event_type_id, listing_id);

-- Text search helpers (name/description) using lower
CREATE INDEX IF NOT EXISTS idx_listings_name_lower
  ON listings (LOWER(CAST(name AS TEXT)));

CREATE INDEX IF NOT EXISTS idx_listings_description_lower
  ON listings (LOWER(CAST(description AS TEXT)));

-- Category id lookup
CREATE INDEX IF NOT EXISTS idx_listings_category
  ON listings (listing_category_id);





