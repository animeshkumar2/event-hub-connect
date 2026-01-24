-- Add contact info fields to vendors table
-- These fields store vendor contact information

-- Add phone column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add email column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add instagram column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS instagram VARCHAR(100);

-- Add website column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email) WHERE email IS NOT NULL;
