-- ============================================
-- MIGRATION: Fix RLS Policies für Orders System
-- ============================================
-- Dieses Script aktualisiert die Policies ohne Fehler zu werfen
-- Führe dies aus nachdem das Schema bereits erstellt wurde

-- ============================================
-- 1. PROFILES: Admin Rolle hinzufügen
-- ============================================
-- Update CHECK constraint to include 'admin' role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('chef', 'azubi', 'partner', 'admin'));

-- ============================================
-- 2. ORDERS: Policies aktualisieren
-- ============================================

-- Drop alte Policies
DROP POLICY IF EXISTS "Users can view company orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update company orders" ON orders;
DROP POLICY IF EXISTS "Company Access" ON orders;
DROP POLICY IF EXISTS "Company Access Authenticated" ON orders;
DROP POLICY IF EXISTS "Allow API Order Creation" ON orders;
DROP POLICY IF EXISTS "Allow API Order Read" ON orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;

-- Make company_id NOT NULL (wenn noch nicht gesetzt)
-- Vorsicht: Nur wenn keine NULL Werte existieren
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM orders WHERE company_id IS NULL LIMIT 1) THEN
    ALTER TABLE orders ALTER COLUMN company_id SET NOT NULL;
  END IF;
END $$;

-- Neue Policies erstellen

-- Policy: Authenticated users can view orders from their company
CREATE POLICY "Users can view company orders" ON orders
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      company_id = auth.uid() -- Sie sind der Chef
      OR company_id IN (
        SELECT id FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'chef'
      )
    )
  );

-- Policy: API can create orders (unauthenticated, but must have valid company_id)
CREATE POLICY "Allow API order creation" ON orders
  FOR INSERT
  WITH CHECK (
    company_id IN (SELECT id FROM profiles WHERE role = 'chef')
  );

-- Policy: Users can update orders from their company
CREATE POLICY "Users can update company orders" ON orders
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      company_id = auth.uid() -- Sie sind der Chef
      OR company_id IN (
        SELECT id FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'chef'
      )
    )
  );

-- Policy: Admin can view all orders
CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 3. ORDER_DATA: Policies aktualisieren
-- ============================================

-- Drop alte Policies
DROP POLICY IF EXISTS "Users can view company order_data" ON order_data;
DROP POLICY IF EXISTS "Users can create order_data" ON order_data;
DROP POLICY IF EXISTS "Users can update order_data" ON order_data;

-- Neue Policies erstellen
CREATE POLICY "Users can view company order_data" ON order_data
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    order_id IN (
      SELECT id FROM orders WHERE (
        company_id = auth.uid()
        OR company_id IN (
          SELECT id FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'chef'
        )
      )
    )
  );

CREATE POLICY "Users can create company order_data" ON order_data
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    order_id IN (
      SELECT id FROM orders WHERE (
        company_id = auth.uid()
        OR company_id IN (
          SELECT id FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'chef'
        )
      )
    )
  );

CREATE POLICY "Users can update company order_data" ON order_data
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    order_id IN (
      SELECT id FROM orders WHERE (
        company_id = auth.uid()
        OR company_id IN (
          SELECT id FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'chef'
        )
      )
    )
  );

-- ============================================
-- 4. INVOICES: Policies aktualisieren
-- ============================================

-- Drop alte Policies
DROP POLICY IF EXISTS "Users can view company invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON invoices;

-- Neue Policies erstellen
CREATE POLICY "Users can view company invoices" ON invoices
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    order_id IN (
      SELECT id FROM orders WHERE (
        company_id = auth.uid()
        OR company_id IN (
          SELECT id FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'chef'
        )
      )
    )
  );

CREATE POLICY "Users can create company invoices" ON invoices
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    order_id IN (
      SELECT id FROM orders WHERE (
        company_id = auth.uid()
        OR company_id IN (
          SELECT id FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'chef'
        )
      )
    )
  );
