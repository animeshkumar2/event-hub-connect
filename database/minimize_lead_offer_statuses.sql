-- Minimize Lead and Offer Statuses
-- Remove QUOTED, ACCEPTED from LeadStatus
-- Remove EXPIRED from OfferStatus
-- Run this in your PostgreSQL database

-- ============================================
-- STEP 1: Migrate existing data
-- ============================================
-- Update QUOTED leads to OPEN (vendor countered/responded)
UPDATE leads SET status = 'OPEN' WHERE status = 'QUOTED';

-- Update ACCEPTED leads to CONVERTED (order created)
UPDATE leads SET status = 'CONVERTED' WHERE status = 'ACCEPTED';

-- Update EXPIRED offers to REJECTED (treat expired as rejected)
UPDATE offers SET status = 'REJECTED' WHERE status = 'EXPIRED';

-- ============================================
-- STEP 2: Update leads_status_check constraint
-- ============================================
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE leads 
ADD CONSTRAINT leads_status_check 
CHECK (status IN ('NEW', 'OPEN', 'DECLINED', 'WITHDRAWN', 'CONVERTED'));

-- ============================================
-- STEP 3: Update offers_status_check constraint
-- ============================================
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;

ALTER TABLE offers 
ADD CONSTRAINT offers_status_check 
CHECK (status IN ('PENDING', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'));

-- ============================================
-- Verification
-- ============================================
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname IN ('leads_status_check', 'offers_status_check');

-- Verify data migration
SELECT status, COUNT(*) as count FROM leads GROUP BY status;
SELECT status, COUNT(*) as count FROM offers GROUP BY status;
