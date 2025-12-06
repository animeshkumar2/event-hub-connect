-- Fix availability_slots status constraint and values
-- The Java enum expects: AVAILABLE, BOOKED, BUSY, BLOCKED (uppercase)
-- But the database constraint only allows lowercase

-- IMPORTANT: Run these statements ONE AT A TIME in order

-- Step 1: Drop the existing constraint FIRST
ALTER TABLE availability_slots 
DROP CONSTRAINT IF EXISTS availability_slots_status_check;

-- Step 2: Now update the data (constraint is gone, so this will work)
UPDATE availability_slots 
SET status = 'AVAILABLE' 
WHERE LOWER(status) = 'available';

UPDATE availability_slots 
SET status = 'BOOKED' 
WHERE LOWER(status) = 'booked';

UPDATE availability_slots 
SET status = 'BUSY' 
WHERE LOWER(status) = 'busy';

UPDATE availability_slots 
SET status = 'BLOCKED' 
WHERE LOWER(status) = 'blocked';

-- Step 3: Add new constraint that allows uppercase values
ALTER TABLE availability_slots 
ADD CONSTRAINT availability_slots_status_check 
CHECK (status IN ('AVAILABLE', 'BOOKED', 'BUSY', 'BLOCKED'));

-- Step 4: Update the default value for new rows
ALTER TABLE availability_slots 
ALTER COLUMN status SET DEFAULT 'AVAILABLE';

-- Step 5: Verify the update
SELECT status, COUNT(*) as count 
FROM availability_slots 
GROUP BY status
ORDER BY status;
