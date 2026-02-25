-- Migration: Add new columns to add_ons table and remove package-only restriction
-- Run this against your Supabase database

-- 1. Add missing columns (if they don't exist)
ALTER TABLE public.add_ons ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE public.add_ons ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE public.add_ons ADD COLUMN IF NOT EXISTS max_quantity INTEGER DEFAULT 10;
ALTER TABLE public.add_ons ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. Drop any trigger that restricts add-ons to packages only
-- (This trigger may have been created via Supabase dashboard)
DROP TRIGGER IF EXISTS validate_add_on_package ON public.add_ons;
DROP TRIGGER IF EXISTS check_add_on_package ON public.add_ons;
DROP TRIGGER IF EXISTS enforce_add_on_package ON public.add_ons;
DROP TRIGGER IF EXISTS add_on_package_check ON public.add_ons;
DROP TRIGGER IF EXISTS validate_add_on ON public.add_ons;
DROP TRIGGER IF EXISTS check_package_type ON public.add_ons;

-- 3. Drop any related functions
DROP FUNCTION IF EXISTS public.validate_add_on_package() CASCADE;
DROP FUNCTION IF EXISTS public.check_add_on_package() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_add_on_package() CASCADE;
DROP FUNCTION IF EXISTS public.validate_add_on() CASCADE;
DROP FUNCTION IF EXISTS public.check_package_type() CASCADE;

-- 4. List all triggers on add_ons table (run this to see what exists)
-- SELECT tgname, tgtype, proname 
-- FROM pg_trigger t 
-- JOIN pg_proc p ON t.tgfoid = p.oid 
-- JOIN pg_class c ON t.tgrelid = c.oid 
-- WHERE c.relname = 'add_ons' AND NOT t.tgisinternal;

-- 5. List all RLS policies on add_ons (run this to check)
-- SELECT * FROM pg_policies WHERE tablename = 'add_ons';
