-- ============================================
-- RLS POLICY FIX: Allow API to create orders
-- ============================================
-- This policy allows the API route to create orders
-- even without an authenticated user (for public claim submissions)

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Company Access" ON orders;

-- Create new policies that allow:
-- 1. Authenticated users from the company can do everything
-- 2. Unauthenticated users (API) can INSERT orders (but only with valid company_id)

-- Policy for SELECT, UPDATE, DELETE (authenticated users only)
CREATE POLICY "Company Access Authenticated" ON orders
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Policy for INSERT (allows API to create orders)
-- This checks that the company_id exists in profiles
CREATE POLICY "Allow API Order Creation" ON orders
  FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE company_id IS NOT NULL)
    OR company_id IN (SELECT id FROM profiles WHERE role = 'chef')
  );

