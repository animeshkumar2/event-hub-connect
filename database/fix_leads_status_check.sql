-- Fix status check constraints for leads and offers tables
-- Run this in your PostgreSQL database

-- ============================================
-- FIX 1: leads_status_check constraint
-- ============================================
-- Drop the existing check constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Add the updated check constraint with all valid statuses
ALTER TABLE leads 
ADD CONSTRAINT leads_status_check 
CHECK (status IN ('NEW', 'OPEN', 'QUOTED', 'ACCEPTED', 'DECLINED', 'CONVERTED', 'WITHDRAWN'));

-- ============================================
-- FIX 2: offers_status_check constraint
-- ============================================
-- Drop the existing check constraint
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;

-- Add the updated check constraint with all valid statuses
ALTER TABLE offers 
ADD CONSTRAINT offers_status_check 
CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'EXPIRED', 'WITHDRAWN'));

-- ============================================
-- Verification
-- ============================================
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname IN ('leads_status_check', 'offers_status_check');

