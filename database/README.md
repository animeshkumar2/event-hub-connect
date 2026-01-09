# Database Schema - Event Hub Connect

This directory contains the database schema and setup files for the Event Hub Connect platform using Supabase (PostgreSQL).

## Files

- **`schema.sql`** - Complete database schema with all tables, indexes, triggers, and RLS policies
- **`seed_data.sql`** - Reference data (event types, categories, cities, mappings)
- **`README.md`** - This file

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - Project name: `event-hub-connect`
   - Database password: (save this securely)
   - Region: Choose closest to your users
5. Wait for project to be created (~2 minutes)

### 2. Run Schema in Supabase SQL Editor

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste contents of `schema.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Wait for execution to complete

### 3. Seed Reference Data

1. In the same SQL Editor
2. Create a new query
3. Copy and paste contents of `seed_data.sql`
4. Click **Run**
5. Verify data was inserted:
   ```sql
   SELECT * FROM event_types;
   SELECT * FROM categories;
   SELECT * FROM event_type_categories;
   SELECT * FROM cities;
   ```

## Database Connection

### Get Connection String

1. Go to **Settings** → **Database**
2. Find **Connection string** section
3. Copy the **URI** connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### For Java/Spring Boot

Add to `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://db.xxx.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver
```

## Schema Overview

### Core Tables

- **`vendors`** - Vendor profiles
- **`listings`** - Unified table for packages and individual listings
- **`add_ons`** - Package add-ons
- **`bookable_setups`** - Pre-designed setups
- **`orders`** - Customer orders
- **`cart_items`** - Shopping cart items
- **`reviews`** - Vendor reviews
- **`vendor_faqs`** - Vendor FAQs
- **`availability_slots`** - Vendor availability calendar

### Reference Data

- **`event_types`** - Event types (Wedding, Birthday, etc.)
- **`categories`** - Service categories (Photography, Décor, etc.)
- **`event_type_categories`** - Mapping: which categories are valid for each event type
- **`cities`** - Available cities

### Transaction Tables

- **`orders`** - Customer orders
- **`payments`** - Payment records
- **`order_timeline`** - Order status history
- **`cart_items`** - Shopping cart

### Communication

- **`chat_threads`** - Chat conversations
- **`messages`** - Chat messages
- **`leads`** - Vendor inquiries
- **`quotes`** - Vendor quotes

### Financial

- **`vendor_wallets`** - Vendor wallet balances
- **`wallet_transactions`** - Wallet transaction history
- **`payouts`** - Vendor payout requests

## Key Features

### 1. Unified Listings Table
- Single `listings` table handles both packages and individual listings
- `type` field discriminates: `'package'` or `'listing'`
- Package-specific fields are NULL for individual listings

### 2. Event Type → Category Filtering
- `event_type_categories` junction table enforces valid combinations
- Prevents invalid listings (e.g., MUA services in Birthday events)

### 3. Row Level Security (RLS)
- Users can only see/edit their own data
- Vendors can only see/edit their own vendor profile and orders
- Enabled on sensitive tables

### 4. Indexes
- Optimized indexes on frequently queried columns
- Improves query performance for filtering and searching

## Next Steps

1. ✅ Run `schema.sql` in Supabase SQL Editor
2. ✅ Run `seed_data.sql` to populate reference data
3. ✅ Get connection string from Supabase dashboard
4. ✅ Configure Java backend with connection string
5. ✅ Start building API endpoints

## Useful Queries

### Check if schema was created correctly
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Verify seed data
```sql
-- Check event types
SELECT * FROM event_types;

-- Check categories
SELECT * FROM categories;

-- Check mappings
SELECT et.name as event_type, c.name as category
FROM event_type_categories etc
JOIN event_types et ON etc.event_type_id = et.id
JOIN categories c ON etc.category_id = c.id
ORDER BY et.name, c.name;
```

### Count records
```sql
SELECT 
    (SELECT COUNT(*) FROM vendors) as vendors,
    (SELECT COUNT(*) FROM listings) as listings,
    (SELECT COUNT(*) FROM orders) as orders,
    (SELECT COUNT(*) FROM users) as users;
```

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review PostgreSQL documentation: https://www.postgresql.org/docs/
3. Check schema comments in `schema.sql`











