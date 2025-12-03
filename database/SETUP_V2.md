# Database Setup V2 - Unified Listings Schema

## Execution Order

### Step 1: Drop Existing Tables
Run `drop_tables.sql` first to clean up any existing tables:

```sql
-- In Supabase SQL Editor, run:
-- File: drop_tables.sql
```

**What it does:**
- Drops all existing tables in correct dependency order
- Drops triggers and functions
- Preserves reference data (event_types, categories, cities) - comment out if you want to drop those too

### Step 2: Create New Schema
Run `schema_v2.sql` to create the new unified schema:

```sql
-- In Supabase SQL Editor, run:
-- File: schema_v2.sql
```

**What it creates:**
- Unified `listings` table (type: 'package' or 'item')
- `package_items` junction table (links packages to items)
- All other tables (vendors, orders, cart, etc.)
- Indexes, triggers, RLS policies

### Step 3: Seed Reference Data
Run `seed_data_v2.sql` to populate reference data:

```sql
-- In Supabase SQL Editor, run:
-- File: seed_data_v2.sql
```

**What it inserts:**
- Event types (Wedding, Birthday, etc.)
- Categories (Photographer, Décor, etc.)
- Event Type → Category mappings
- Cities (Mumbai, Delhi, etc.)

## Key Features of V2 Schema

### 1. Unified Listings Table
- Single `listings` table for both packages and items
- `type` field: 'package' or 'item'
- Clear separation: `vendor_category_id` vs `listing_category_id`

### 2. Dual Package Support
Packages can have BOTH:
- **Text descriptions**: `included_items_text[]` (for display/marketing)
- **Item references**: `package_items` junction table (for functionality)

### 3. Package Items Junction Table
- Links packages to actual items
- Enables custom packages
- Tracks which items are in packages
- Supports analytics

## Example Usage

### Create a Package with Text Only
```sql
INSERT INTO listings (vendor_id, type, name, price, listing_category_id, included_items_text)
VALUES (
    'vendor-uuid',
    'package',
    'Classic Wedding Package',
    45000,
    'photographer',
    ARRAY['8 hours coverage', '2 photographers', '500+ edited photos']
);
```

### Create a Package with Item References
```sql
-- First create the package
INSERT INTO listings (id, vendor_id, type, name, price, listing_category_id, included_items_text)
VALUES (
    'p1',
    'vendor-uuid',
    'package',
    'Classic Wedding Package',
    45000,
    'photographer',
    ARRAY['8 hours coverage', '2 photographers', '500+ edited photos']
);

-- Then link items to package
INSERT INTO package_items (package_id, item_id, quantity, price)
VALUES
    ('p1', 'item-uuid-1', 1, 5000),
    ('p1', 'item-uuid-2', 2, 8000);
```

### Create an Individual Item
```sql
INSERT INTO listings (vendor_id, type, name, price, listing_category_id, unit)
VALUES (
    'vendor-uuid',
    'item',
    'Professional Camera Rental',
    5000,
    'photographer',
    'per day'
);
```

## Verification Queries

After setup, verify everything is created:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check event types
SELECT * FROM event_types;

-- Check categories
SELECT * FROM categories;

-- Check event type → category mappings
SELECT et.name as event_type, c.name as category
FROM event_type_categories etc
JOIN event_types et ON etc.event_type_id = et.id
JOIN categories c ON etc.category_id = c.id
ORDER BY et.name, c.name;
```

## Notes

- **CHECK constraints with subqueries**: Removed (PostgreSQL limitation)
- **Validation**: Enforced at application level (Java backend)
- **RLS Policies**: Enabled on sensitive tables
- **Indexes**: Optimized for common queries

## Next Steps

1. ✅ Run `drop_tables.sql`
2. ✅ Run `schema_v2.sql`
3. ✅ Run `seed_data_v2.sql`
4. ✅ Verify with queries above
5. ✅ Get connection string from Supabase dashboard
6. ✅ Configure Java backend

