-- ============================================
-- CLEAN DATABASE SETUP
-- ============================================
-- Führe dies NACH reset_database.sql aus
-- Dieses Script erstellt das komplette Schema neu

-- ============================================
-- 1. ENABLE EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. PROFILES TABLE
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('chef', 'azubi', 'partner', 'admin')),
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 3. PARTNERS TABLE
-- ============================================

CREATE TABLE partners (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  email TEXT,
  profession TEXT,
  zip_codes TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating DECIMAL(3, 2) NOT NULL DEFAULT 4.50,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all partners" ON partners
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can create partners" ON partners
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update partners" ON partners
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete partners" ON partners
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Partner can view own partner row" ON partners
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Partner can update own partner row" ON partners
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
-- KONZEPT: company_id zeigt direkt auf das Chef-Profil (profiles.id)
-- Jede Company = ein Chef-Profil

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'neu' CHECK (status IN ('neu', 'bearbeitung', 'angebot', 'abgeschlossen', 'storniert')),
  type TEXT NOT NULL CHECK (type IN ('wasser', 'feuer', 'kfz', 'glas', 'gebaeude', 'rechtsfall')),
  customer_data JSONB NOT NULL DEFAULT '{}',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  description TEXT
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies
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

CREATE POLICY "Allow API order creation" ON orders
  FOR INSERT
  WITH CHECK (
    company_id IN (SELECT id FROM profiles WHERE role = 'chef')
  );

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

CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_orders_company_id ON orders(company_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_assigned_to ON orders(assigned_to);
CREATE INDEX idx_orders_assigned_partner_id ON orders(assigned_partner_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 5. ORDER_DATA TABLE (Azubi-Wizard Daten)
-- ============================================

CREATE TABLE order_data (
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

-- Policies
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

-- Index
CREATE INDEX idx_order_data_order_id ON order_data(order_id);

-- ============================================
-- 6. INVOICES TABLE
-- ============================================

CREATE TABLE invoices (
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

-- Policies
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

-- Indexes
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================
-- 7. ROUTING / ASSIGNMENT TABLES
-- ============================================

CREATE TABLE routing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_prefix TEXT NOT NULL,
  profession TEXT NOT NULL,
  preferred_partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  priority INT NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view routing_rules" ON routing_rules
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can create routing_rules" ON routing_rules
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update routing_rules" ON routing_rules
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete routing_rules" ON routing_rules
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX idx_routing_rules_zip_prefix ON routing_rules(zip_prefix);
CREATE INDEX idx_routing_rules_profession ON routing_rules(profession);
CREATE INDEX idx_routing_rules_active ON routing_rules(active);

CREATE TABLE assignment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profession TEXT NOT NULL,
  zip_prefix TEXT,
  mode TEXT NOT NULL DEFAULT 'manual' CHECK (mode IN ('manual', 'auto', 'broadcast')),
  broadcast_partner_count INT NOT NULL DEFAULT 3,
  fallback_behavior TEXT NOT NULL DEFAULT 'internal_only' CHECK (fallback_behavior IN ('internal_only', 'manual')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE assignment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view assignment_settings" ON assignment_settings
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can create assignment_settings" ON assignment_settings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update assignment_settings" ON assignment_settings
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete assignment_settings" ON assignment_settings
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE UNIQUE INDEX idx_assignment_settings_unique
  ON assignment_settings (profession, (COALESCE(zip_prefix, '')));

CREATE TABLE partner_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'declined', 'expired')),
  token_hash TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE partner_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view partner_offers" ON partner_offers
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can create partner_offers" ON partner_offers
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update partner_offers" ON partner_offers
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete partner_offers" ON partner_offers
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Partner can view own offers" ON partner_offers
  FOR SELECT USING (auth.uid() = partner_id);

CREATE POLICY "Partner can update own offers" ON partner_offers
  FOR UPDATE USING (auth.uid() = partner_id);

CREATE UNIQUE INDEX idx_partner_offers_unique ON partner_offers(order_id, partner_id);
CREATE UNIQUE INDEX idx_partner_offers_token_hash_unique
  ON partner_offers(token_hash) WHERE token_hash IS NOT NULL;

-- ============================================
-- 8. FUNCTIONS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, company_name)
  VALUES (
    NEW.id,
    'azubi', -- Default role
    COALESCE(NEW.raw_user_meta_data->>'company_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. TRIGGERS
-- ============================================

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at 
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_data_updated_at 
  BEFORE UPDATE ON order_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routing_rules_updated_at
  BEFORE UPDATE ON routing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_settings_updated_at
  BEFORE UPDATE ON assignment_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_offers_updated_at
  BEFORE UPDATE ON partner_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. VERIFY SETUP
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'partners', 'orders', 'order_data', 'invoices', 'routing_rules', 'assignment_settings', 'partner_offers');
  
  IF table_count = 8 THEN
    RAISE NOTICE '✅ Setup erfolgreich: Alle 8 Tabellen erstellt';
  ELSE
    RAISE WARNING '⚠️ Setup unvollständig: Nur % von 8 Tabellen erstellt', table_count;
  END IF;
END $$;
