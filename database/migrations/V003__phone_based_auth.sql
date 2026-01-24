-- Migration: Switch to phone-based authentication
-- Email becomes optional, phone becomes required and unique

-- Step 1: Make email nullable (it was NOT NULL before)
ALTER TABLE user_profiles ALTER COLUMN email DROP NOT NULL;

-- Step 2: Find and fix duplicate phone numbers before adding unique constraint
-- Append a suffix to duplicate phone numbers (keeping the oldest record's phone intact)
WITH duplicates AS (
    SELECT id, phone, 
           ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at ASC, id ASC) as rn
    FROM user_profiles
    WHERE phone IS NOT NULL
)
UPDATE user_profiles 
SET phone = phone || '_dup_' || duplicates.rn
FROM duplicates
WHERE user_profiles.id = duplicates.id 
  AND duplicates.rn > 1;

-- Step 3: Add unique constraint on phone if not exists
DO $$
BEGIN
    -- Check if unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_phone_key' 
        AND conrelid = 'user_profiles'::regclass
    ) THEN
        -- Add unique constraint on phone
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_phone_key UNIQUE (phone);
    END IF;
END $$;

-- Step 4: Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);

-- Note: Users with duplicate phones now have '_dup_N' suffix
-- They will need to update their phone number on next login
-- The application should detect this and prompt them to enter a valid phone
