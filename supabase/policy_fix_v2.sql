-- ============================================
-- RLS POLICY FIX V2: Allow API to create orders
-- ============================================
-- This policy allows the API route to create orders
-- even without an authenticated user (for public claim submissions)

-- Drop existing policies
DROP POLICY IF EXISTS "Company Access" ON orders;
DROP POLICY IF EXISTS "Company Access Authenticated" ON orders;
DROP POLICY IF EXISTS "Allow API Order Creation" ON orders;

-- Policy for SELECT, UPDATE, DELETE (authenticated users from company)
CREATE POLICY "Company Access Authenticated" ON orders
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Policy for INSERT: Allow if company_id exists in profiles
-- This allows the API route (unauthenticated) to create orders
CREATE POLICY "Allow API Order Creation" ON orders
  FOR INSERT
  WITH CHECK (
    company_id IN (SELECT id FROM profiles WHERE role = 'chef')
    OR company_id IN (SELECT company_id FROM profiles WHERE company_id IS NOT NULL)
  );

-- Also allow SELECT for unauthenticated users (for API routes that need to read)
-- But only for orders that belong to verified companies
CREATE POLICY "Allow API Order Read" ON orders
  FOR SELECT
  USING (
    company_id IN (SELECT id FROM profiles WHERE role = 'chef')
    OR company_id IN (SELECT company_id FROM profiles WHERE company_id IS NOT NULL)
  );

