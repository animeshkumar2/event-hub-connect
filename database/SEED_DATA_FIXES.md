# Seed Data Script - Fixes Applied

## Issues Fixed

### 1. Foreign Key Constraint Error
**Problem**: `user_profiles` table references `auth.users(id)`, which is managed by Supabase Auth. You cannot insert directly into `user_profiles` without first creating users via Supabase Auth.

**Solution**: 
- Removed `user_profiles` inserts from the seed data script
- Added clear comments explaining why and how to add them later

### 2. Vendors.user_id References
**Problem**: `vendors.user_id` also references `auth.users(id)`, but it's nullable in the schema.

**Solution**: 
- Set all `vendors.user_id` values to `NULL` in the seed data
- Vendors will work without user_ids for testing purposes
- In production, create users via Supabase Auth first, then update vendor user_ids

### 3. Reviews.user_id References
**Problem**: `reviews.user_id` references `auth.users(id)` and is NOT NULL, so we can't insert reviews without valid users.

**Solution**: 
- Removed reviews inserts from the seed data script
- Added commented example showing how to add reviews after creating users

## What the Script Now Includes

✅ **Event Types** (5 types)
✅ **Categories** (7 categories)
✅ **Event Type → Category Mappings** (all combinations)
✅ **Cities** (8 cities)
✅ **Vendors** (6 vendors with NULL user_id)
✅ **Listings** (11 listings: packages and items)
✅ **Listing → Event Type Mappings** (all combinations)
✅ **Add-ons** (5 add-ons for packages)
✅ **Vendor Past Events** (5 past events)
✅ **Bookable Setups** (3 setups)
✅ **Vendor Wallets** (6 wallets)
✅ **Vendor FAQs** (4 FAQs)
✅ **Availability Slots** (8 slots)

## What's Missing (Requires Supabase Auth)

❌ **User Profiles** - Need to create users via Supabase Auth first
❌ **Reviews** - Need valid user_ids from auth.users

## How to Add Users Later

### Option 1: Via Supabase Dashboard
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" or "Invite User"
3. Create users with emails matching your test data
4. Copy the UUIDs from the created users
5. Insert into `user_profiles` with matching UUIDs
6. Update `vendors.user_id` with vendor user UUIDs
7. Insert reviews with customer user UUIDs

### Option 2: Via Supabase Auth API
Use the Supabase Auth API to create users programmatically, then follow steps 4-7 above.

## Testing the Script

The seed data script should now run successfully in Supabase SQL Editor without any foreign key constraint errors.

**To run:**
1. Open Supabase Dashboard > SQL Editor
2. Copy and paste the entire `seed_data_complete.sql` file
3. Click "Run"
4. You should see: "Seed data inserted successfully!"

## Next Steps

1. ✅ Run the seed data script (should work now)
2. Start your backend: `cd backend && ./mvnw spring-boot:run`
3. Start your frontend: `cd frontend && npm run dev`
4. Test the search page - you should see vendors and listings
5. (Optional) Create users via Supabase Auth to enable full functionality




