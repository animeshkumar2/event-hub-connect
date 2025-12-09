# Schema Changes - Separate Packages and Listings

## Summary

The schema has been refactored to address two key requirements:

1. **Separate `packages` and `listings` tables** (instead of unified table)
2. **Clear distinction between vendor category and listing category**

## Key Changes

### 1. Separate Tables

**Before (Unified):**
- Single `listings` table with `type` discriminator ('package' or 'listing')

**After (Separate):**
- `packages` table - for package listings
- `listings` table - for individual item listings

### 2. Category Naming

**Before:**
- `vendors.category_id` - vendor's category
- `listings.category_id` - listing's category

**After:**
- `vendors.vendor_category_id` - vendor's PRIMARY business category
- `packages.listing_category_id` - package's category (can differ from vendor.category)
- `listings.listing_category_id` - listing's category (can be any category, vendors can post listings in multiple categories)

### 3. Updated Relationships

**Packages:**
- `packages.vendor_id` → `vendors.id`
- `packages.listing_category_id` → `categories.id`
- `add_ons.package_id` → `packages.id` (changed from `listing_id`)
- `package_event_types.package_id` → `packages.id`

**Listings:**
- `listings.vendor_id` → `vendors.id`
- `listings.listing_category_id` → `categories.id`
- `listing_event_types.listing_id` → `listings.id`

**Cart & Orders:**
- `cart_items` now has both `package_id` and `listing_id` (mutually exclusive)
- `cart_items.item_type` discriminator: 'package' or 'listing'
- `orders` now has both `package_id` and `listing_id` (mutually exclusive)
- `orders.item_type` discriminator: 'package' or 'listing'

## Database Structure

```
vendors
├── vendor_category_id (Vendor's primary category)
│
├── packages[] (One-to-Many)
│   ├── listing_category_id (Package's category)
│   └── package_event_types[] (Many-to-Many)
│
└── listings[] (One-to-Many)
    ├── listing_category_id (Listing's category)
    └── listing_event_types[] (Many-to-Many)
```

## Example

```
Vendor: "Moments Photography Studio"
├── vendor_category_id = "photographer"  ← Vendor's primary category
│
├── Package: "Classic Wedding Package"
│   ├── listing_category_id = "photographer"  ← Package's category (matches vendor category)
│   └── package_event_types = [Wedding, Engagement]
│
├── Package: "Event Decoration Package"
│   ├── listing_category_id = "decorator"  ← Package's category (different from vendor category - allowed!)
│   └── package_event_types = [Wedding, Corporate]
│
└── Listing: "Professional Camera Rental"
    ├── listing_category_id = "photographer"  ← Listing's category
    └── listing_event_types = [Wedding, Corporate]
```

**Note:** Vendors can now create listings in ANY category, not just their primary category. 
This allows vendors to offer services across multiple categories (e.g., a photographer 
can also offer decoration services, or a decor vendor can offer photography).

## Migration Notes

If you already ran the old schema, you'll need to:

1. **Drop old tables** (if they exist):
   ```sql
   DROP TABLE IF EXISTS listing_event_types CASCADE;
   DROP TABLE IF EXISTS add_ons CASCADE;
   DROP TABLE IF EXISTS listings CASCADE; -- Old unified table
   ```

2. **Run new schema** (`schema.sql`)

3. **Migrate data** (if you have existing data):
   ```sql
   -- Migrate packages from old listings table
   INSERT INTO packages (id, vendor_id, name, description, price, listing_category_id, ...)
   SELECT id, vendor_id, name, description, price, category_id, ...
   FROM old_listings WHERE type = 'package';
   
   -- Migrate individual listings
   INSERT INTO listings (id, vendor_id, name, description, price, listing_category_id, ...)
   SELECT id, vendor_id, name, description, price, category_id, ...
   FROM old_listings WHERE type = 'listing';
   ```

## Benefits

1. **Clearer separation** - Packages and listings are distinct entities
2. **Better type safety** - No need for type discriminator checks
3. **Easier queries** - Direct queries on packages or listings tables
4. **Clearer naming** - `vendor_category_id` vs `listing_category_id` makes intent clear

