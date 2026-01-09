# Database Migration Instructions

## Adding Customization Support to Offers

To add customization support to the offers table, run the following migration:

```bash
# Connect to your PostgreSQL database (Supabase or local)
# Then run:

psql -h YOUR_DATABASE_HOST -U postgres -d postgres -f database/add_customization_to_offers.sql

# Or if using Supabase, run the SQL in the Supabase SQL Editor
```

### Migration File: `database/add_customization_to_offers.sql`

This migration:
1. Adds `customized_price` column to store the price after customization
2. Adds `customization` JSONB column to store customization details
3. Updates existing offers to set `customized_price = original_price` for backward compatibility
4. Creates an index on the customization column for faster queries

### Important Notes:
- The migration uses `IF NOT EXISTS` so it's safe to run multiple times
- Existing offers will have `customized_price = original_price` automatically set
- The `customization` column is JSONB (allows NULL) for flexibility

