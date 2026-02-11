-- ============================================
-- COMPLETE DATABASE RESET
-- ============================================
-- WARNUNG: Dieses Script löscht ALLE Daten!
-- Führe dies nur aus wenn du sicher bist, dass du alle Daten löschen willst.

-- ============================================
-- 1. DROP ALL POLICIES FIRST (sicherer)
-- ============================================

-- Orders policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view company orders" ON orders;
  DROP POLICY IF EXISTS "Allow API order creation" ON orders;
  DROP POLICY IF EXISTS "Users can update company orders" ON orders;
  DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
  DROP POLICY IF EXISTS "Company Access" ON orders;
  DROP POLICY IF EXISTS "Company Access Authenticated" ON orders;
  DROP POLICY IF EXISTS "Allow API Order Creation" ON orders;
  DROP POLICY IF EXISTS "Allow API Order Read" ON orders;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Order_data policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view company order_data" ON order_data;
  DROP POLICY IF EXISTS "Users can create company order_data" ON order_data;
  DROP POLICY IF EXISTS "Users can update company order_data" ON order_data;
  DROP POLICY IF EXISTS "Users can view order_data for orders from their company" ON order_data;
  DROP POLICY IF EXISTS "Users can create order_data" ON order_data;
  DROP POLICY IF EXISTS "Users can update order_data" ON order_data;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Invoices policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view company invoices" ON invoices;
  DROP POLICY IF EXISTS "Users can create company invoices" ON invoices;
  DROP POLICY IF EXISTS "Users can create invoices" ON invoices;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Profiles policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================
-- 2. DROP ALL TRIGGERS (sicher mit Exception Handling)
-- ============================================

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_order_data_updated_at ON order_data;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================
-- 3. DROP ALL FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- 4. DROP ALL TABLES (in richtiger Reihenfolge wegen Foreign Keys)
-- ============================================

-- Drop tables that reference other tables first
DROP TABLE IF EXISTS partner_offers CASCADE;
DROP TABLE IF EXISTS assignment_settings CASCADE;
DROP TABLE IF EXISTS routing_rules CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS order_data CASCADE;
DROP TABLE IF EXISTS order_wizard_data CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS partners CASCADE;

-- ============================================
-- 4. DROP EXTENSIONS (optional - nur wenn nicht mehr benötigt)
-- ============================================

-- UUID extension wird normalerweise nicht gelöscht, da andere Tabellen es nutzen könnten
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- ============================================
-- 5. VERIFY CLEANUP
-- ============================================

-- Prüfe ob noch Tabellen existieren (sollte leer sein)
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'orders', 'order_data', 'invoices', 'partners', 'routing_rules', 'assignment_settings', 'partner_offers');
  
  IF table_count > 0 THEN
    RAISE NOTICE 'WARNUNG: Es existieren noch % Tabellen', table_count;
  ELSE
    RAISE NOTICE '✅ Alle Tabellen erfolgreich gelöscht';
  END IF;
END $$;
