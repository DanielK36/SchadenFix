-- ============================================
-- SUPABASE SCHEMA FÜR SCHADENPORTAL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (Erweiterung der Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('chef', 'azubi', 'partner')),
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. ORDERS TABLE (Die Aufträge)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'neu' CHECK (status IN ('neu', 'bearbeitung', 'angebot', 'abgeschlossen', 'storniert')),
  type TEXT NOT NULL CHECK (type IN ('wasser', 'feuer', 'kfz', 'glas', 'gebaeude', 'rechtsfall')),
  customer_data JSONB NOT NULL DEFAULT '{}',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  description TEXT
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view orders from their company
CREATE POLICY "Users can view company orders" ON orders
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can create orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can update orders from their company
CREATE POLICY "Users can update company orders" ON orders
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_to ON orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 3. ORDER_DATA TABLE (Azubi-Wizard Daten)
-- ============================================
CREATE TABLE IF NOT EXISTS order_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  category_answers JSONB DEFAULT '{}',
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  voice_note_url TEXT,
  internal_notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE order_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view order_data for orders from their company
CREATE POLICY "Users can view company order_data" ON order_data
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE company_id IN (
        SELECT id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Policy: Users can create order_data
CREATE POLICY "Users can create order_data" ON order_data
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE company_id IN (
        SELECT id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Policy: Users can update order_data
CREATE POLICY "Users can update order_data" ON order_data
  FOR UPDATE USING (
    order_id IN (
      SELECT id FROM orders WHERE company_id IN (
        SELECT id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_order_data_order_id ON order_data(order_id);

-- ============================================
-- 4. INVOICES TABLE (Rechnungen)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  invoice_number TEXT UNIQUE,
  net_amount DECIMAL(10, 2) NOT NULL,
  vat_rate DECIMAL(5, 2) NOT NULL DEFAULT 19.00,
  gross_amount DECIMAL(10, 2) NOT NULL,
  due_date DATE,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  pdf_url TEXT
);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invoices for orders from their company
CREATE POLICY "Users can view company invoices" ON invoices
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE company_id IN (
        SELECT id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Policy: Users can create invoices
CREATE POLICY "Users can create invoices" ON invoices
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE company_id IN (
        SELECT id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ============================================
-- 5. FUNCTION: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_data_updated_at BEFORE UPDATE ON order_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. FUNCTION: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, company_name)
  VALUES (
    NEW.id,
    'azubi', -- Default role
    COALESCE(NEW.raw_user_meta_data->>'company_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

