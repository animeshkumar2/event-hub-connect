# Fix Availability Slots Status - Step by Step Instructions

## Problem
The database has a CHECK constraint that only allows lowercase values (`'available'`, `'booked'`, `'busy'`, `'blocked'`), but the Java enum expects uppercase values (`'AVAILABLE'`, `'BOOKED'`, `'BUSY'`, `'BLOCKED'`).

## Solution
Run these SQL statements **ONE AT A TIME** in your Supabase SQL editor:

### Step 1: Drop the existing constraint
```sql
ALTER TABLE availability_slots 
DROP CONSTRAINT IF EXISTS availability_slots_status_check;
```

### Step 2: Update all data to uppercase
```sql
UPDATE availability_slots 
SET status = 'AVAILABLE' 
WHERE LOWER(status) = 'available';
```

```sql
UPDATE availability_slots 
SET status = 'BOOKED' 
WHERE LOWER(status) = 'booked';
```

```sql
UPDATE availability_slots 
SET status = 'BUSY' 
WHERE LOWER(status) = 'busy';
```

```sql
UPDATE availability_slots 
SET status = 'BLOCKED' 
WHERE LOWER(status) = 'blocked';
```

### Step 3: Add new constraint with uppercase values
```sql
ALTER TABLE availability_slots 
ADD CONSTRAINT availability_slots_status_check 
CHECK (status IN ('AVAILABLE', 'BOOKED', 'BUSY', 'BLOCKED'));
```

### Step 4: Update default value
```sql
ALTER TABLE availability_slots 
ALTER COLUMN status SET DEFAULT 'AVAILABLE';
```

### Step 5: Verify (optional)
```sql
SELECT status, COUNT(*) as count 
FROM availability_slots 
GROUP BY status
ORDER BY status;
```

## Important Notes
- Run each statement **separately** and wait for it to complete before running the next one
- The constraint must be dropped BEFORE updating the data
- The new constraint must be added AFTER updating the data
- After completing these steps, restart your backend server



