# Seed Data Setup Guide

This guide explains how to populate the database with dummy data for testing.

## Prerequisites

1. Database schema must be created (run `schema_v2.sql` first)
2. Supabase PostgreSQL database is accessible
3. You have database connection credentials

## Steps to Load Seed Data

### Option 1: Using Supabase Dashboard

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `seed_data_complete.sql`
3. Paste into SQL Editor
4. Click "Run" to execute

### Option 2: Using psql Command Line

```bash
# Connect to your Supabase database
psql -h db.vwhxzxayzpdfmpnnzslq.supabase.co -U postgres -d postgres

# Run the seed data script
\i database/seed_data_complete.sql
```

### Option 3: Using Database Client

1. Open your database client (pgAdmin, DBeaver, etc.)
2. Connect to your Supabase database
3. Open `database/seed_data_complete.sql`
4. Execute the script

## What Gets Created

The seed data includes:

### Reference Data
- **5 Event Types**: Wedding, Birthday, Corporate, Engagement, Anniversary
- **9 Categories**: photographer, makeup, decorator, caterer, dj, videographer, etc.
- **8 Cities**: Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Kolkata, Jaipur
- **Event Type → Category Mappings**: Defines which categories are valid for each event type

### Users
- **9 User Profiles**: 
  - 2 Customers
  - 6 Vendors
  - 1 Admin

### Vendors
- **6 Vendors**:
  - Moments Photography Studio (Photographer)
  - Glamour Studio (Makeup Artist)
  - Royal Decorators (Decorator)
  - DJ Music Hub (DJ)
  - Delicious Caterers (Caterer)
  - Cinematic Films (Videographer)

### Listings
- **11 Listings**:
  - 7 Packages (various categories)
  - 4 Individual Items
  - All linked to appropriate event types

### Additional Data
- **5 Add-ons**: For various packages
- **7 Reviews**: Sample reviews for vendors
- **5 Past Events**: Portfolio images for vendors
- **3 Bookable Setups**: Ready-to-book decoration setups
- **6 Vendor Wallets**: Wallet balances for vendors
- **4 FAQs**: Frequently asked questions
- **8 Availability Slots**: Sample availability for next few weeks

## Testing the Data

After loading seed data, you can test:

1. **Search Listings**: 
   - Visit `/search?eventType=1&category=photographer`
   - Should show photography listings for weddings

2. **View Vendor Profile**:
   - Visit `/vendor/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
   - Should show Moments Photography Studio with packages and listings

3. **View Reviews**:
   - Check vendor profiles for reviews
   - Reviews should be visible and affect ratings

4. **Test Cart**:
   - Add listings to cart
   - View cart summary with platform fee and GST

## Important Notes

- **UUIDs**: All IDs are hardcoded UUIDs for consistency
- **Images**: Using Unsplash placeholder URLs - replace with actual images in production
- **Dates**: Availability slots use relative dates (CURRENT_DATE + INTERVAL)
- **Conflicts**: Script uses `ON CONFLICT DO NOTHING` to prevent errors on re-run

## Troubleshooting

### Error: "relation does not exist"
- Make sure you've run `schema_v2.sql` first
- Check that all tables are created

### Error: "duplicate key value"
- This is normal if you run the script multiple times
- The script uses `ON CONFLICT DO NOTHING` to handle duplicates

### No data showing in frontend
- Check that backend is running and connected to database
- Verify API endpoints are working
- Check browser console for errors

## Next Steps

After loading seed data:

1. Start the backend: `cd backend && ./mvnw spring-boot:run`
2. Start the frontend: `cd frontend && npm run dev`
3. Test the integration:
   - Search for listings
   - View vendor profiles
   - Add items to cart
   - Create orders

## Updating Seed Data

To add more data:

1. Edit `seed_data_complete.sql`
2. Add new INSERT statements
3. Re-run the script (it will skip existing data)

## Production Warning

⚠️ **DO NOT** run this seed data script in production! This is for development and testing only.









