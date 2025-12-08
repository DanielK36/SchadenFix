-- ============================================
-- CREATE DEFAULT PROFILE FOR ORDERS
-- ============================================
-- This creates a default system profile that can receive orders
-- Run this if you don't have any profiles yet

-- Option 1: Create a profile linked to an existing auth user
-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from auth.users
-- INSERT INTO profiles (id, role, company_id, company_name)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'chef',
--   'YOUR_USER_ID_HERE', -- Self-reference for company_id
--   'Default Company'
-- );

-- Option 2: Create a standalone system profile (if you have a system user)
-- First, create a system user in auth.users, then:
-- INSERT INTO profiles (id, role, company_id, company_name)
-- VALUES (
--   (SELECT id FROM auth.users LIMIT 1),
--   'chef',
--   (SELECT id FROM auth.users LIMIT 1),
--   'System Company'
-- );

-- Option 3: Quick fix - Create a dummy profile (for testing only)
-- WARNING: This creates a profile without a real auth user
-- Only use this for development/testing
DO $$
DECLARE
  dummy_id UUID := gen_random_uuid();
BEGIN
  -- Create a dummy profile
  INSERT INTO profiles (id, role, company_id, company_name, full_name)
  VALUES (
    dummy_id,
    'chef',
    dummy_id, -- Self-reference
    'Default Company',
    'System Admin'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Created default profile with ID: %', dummy_id;
END $$;


