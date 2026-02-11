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
  role TEXT NOT NULL CHECK (role IN ('chef', 'azubi', 'partner', 'admin')),
  roles TEXT[],
  company_name TEXT,
  avatar_url TEXT,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  parent_partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  professions JSONB DEFAULT '[]'::jsonb, -- Gewerke für Handwerker (z.B. ["trocknung", "maler"])
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. PARTNERS TABLE (Vermittler / Affiliate-Accounts)
-- ============================================
-- Konzept: Partner sind Vermittler (Affiliate-Accounts) mit role='partner' im profiles-table.
-- Daher ist partners.id == profiles.id.
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Admin policies
DROP POLICY IF EXISTS "Admin can view all partners" ON partners;
CREATE POLICY "Admin can view all partners" ON partners
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can create partners" ON partners;
CREATE POLICY "Admin can create partners" ON partners
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update partners" ON partners;
CREATE POLICY "Admin can update partners" ON partners
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can delete partners" ON partners;
CREATE POLICY "Admin can delete partners" ON partners
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Partner self-access (Portal)
DROP POLICY IF EXISTS "Partner can view own partner row" ON partners;
CREATE POLICY "Partner can view own partner row" ON partners
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Partner can update own partner row" ON partners;
CREATE POLICY "Partner can update own partner row" ON partners
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2.1 AFFILIATE LINKS (Partner Links)
-- ============================================
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partner can view own affiliate links" ON affiliate_links;
CREATE POLICY "Partner can view own affiliate links" ON affiliate_links
  FOR SELECT USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Partner can update own affiliate links" ON affiliate_links;
CREATE POLICY "Partner can update own affiliate links" ON affiliate_links
  FOR UPDATE USING (auth.uid() = partner_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_links_partner_id ON affiliate_links(partner_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON affiliate_links(code);

-- ============================================
-- 2.2 PARTNER COMMISSIONS (Provisionen)
-- ============================================
CREATE TABLE IF NOT EXISTS partner_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
  commission_rate DECIMAL(5, 2) NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partner can view own commissions" ON partner_commissions;
CREATE POLICY "Partner can view own commissions" ON partner_commissions
  FOR SELECT USING (auth.uid() = partner_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_commissions_order_unique ON partner_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner_id ON partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_order_id ON partner_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_status ON partner_commissions(status);

-- ============================================
-- 2.3 PARTNER PAYOUT SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS partner_payout_settings (
  partner_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  iban TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  tax_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE partner_payout_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partner can view own payout settings" ON partner_payout_settings;
CREATE POLICY "Partner can view own payout settings" ON partner_payout_settings
  FOR SELECT USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Partner can update own payout settings" ON partner_payout_settings;
CREATE POLICY "Partner can update own payout settings" ON partner_payout_settings
  FOR UPDATE USING (auth.uid() = partner_id);

-- ============================================
-- 3. ORDERS TABLE (Die Aufträge)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'neu' CHECK (status IN ('neu', 'bearbeitung', 'angebot', 'genehmigt', 'abgeschlossen', 'storniert')),
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

-- Policy: Users can view orders from their company OR orders assigned to them
-- company_id = Chef-Profil-ID, User kann sehen wenn sie Chef sind
-- ODER assigned_to = User-ID (zugewiesene Aufträge)
DROP POLICY IF EXISTS "Users can view company orders" ON orders;
CREATE POLICY "Users can view company orders" ON orders
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      company_id = auth.uid() -- Sie sind der Chef
      OR company_id IN (
        SELECT id FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'chef'
      )
      OR assigned_to = auth.uid() -- Auftrag ist ihnen zugewiesen
    )
  );

-- Policy: API can create orders (unauthenticated, but must have valid company_id)
-- Service role key bypasses RLS, but this allows anon key to work too
DROP POLICY IF EXISTS "Allow API order creation" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Allow API order creation" ON orders
  FOR INSERT
  WITH CHECK (
    company_id IN (SELECT id FROM profiles WHERE role = 'chef')
  );

-- Policy: Users can update orders from their company OR orders assigned to them
DROP POLICY IF EXISTS "Users can update company orders" ON orders;
CREATE POLICY "Users can update company orders" ON orders
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      company_id = auth.uid() -- Sie sind der Chef
      OR company_id IN (
        SELECT id FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'chef'
      )
      OR assigned_to = auth.uid() -- Auftrag ist ihnen zugewiesen
    )
  );

-- Policy: Admin can view all orders
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy: Partner kann eigene Referral-Aufträge lesen (assigned_partner_id = ich)
DROP POLICY IF EXISTS "Partner can view own referral orders" ON orders;
CREATE POLICY "Partner can view own referral orders" ON orders
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND assigned_partner_id = auth.uid()
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_to ON orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_partner_id ON orders(assigned_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 4. ORDER_DATA TABLE (Azubi-Wizard Daten)
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
DROP POLICY IF EXISTS "Users can view company order_data" ON order_data;
DROP POLICY IF EXISTS "Users can view order_data for orders from their company" ON order_data;
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

-- Policy: Users can create order_data
DROP POLICY IF EXISTS "Users can create company order_data" ON order_data;
DROP POLICY IF EXISTS "Users can create order_data" ON order_data;
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

-- Policy: Users can update order_data
DROP POLICY IF EXISTS "Users can update company order_data" ON order_data;
DROP POLICY IF EXISTS "Users can update order_data" ON order_data;
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

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_order_data_order_id ON order_data(order_id);

-- ============================================
-- 5. INVOICES TABLE (Rechnungen)
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
DROP POLICY IF EXISTS "Users can view company invoices" ON invoices;
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

-- Policy: Users can create invoices
DROP POLICY IF EXISTS "Users can create company invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON invoices;
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

-- Policy: Users can update invoices for orders from their company (z. B. als bezahlt markieren)
DROP POLICY IF EXISTS "Users can update company invoices" ON invoices;
CREATE POLICY "Users can update company invoices" ON invoices
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

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ============================================
-- 5.1 PRO OPERATIONS (Availability + Zip Areas)
-- ============================================
CREATE TABLE IF NOT EXISTS pro_availability (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'LIMITED', 'UNAVAILABLE')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pro_zip_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  zip_range TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  load TEXT NOT NULL DEFAULT 'GREEN' CHECK (load IN ('GREEN', 'ORANGE', 'RED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_zip_areas_profile_id ON pro_zip_areas(profile_id);

ALTER TABLE pro_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_zip_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own availability" ON pro_availability;
CREATE POLICY "Users can view own availability" ON pro_availability
  FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update own availability" ON pro_availability;
CREATE POLICY "Users can update own availability" ON pro_availability
  FOR UPDATE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert own availability" ON pro_availability;
CREATE POLICY "Users can insert own availability" ON pro_availability
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can view own zip areas" ON pro_zip_areas;
CREATE POLICY "Users can view own zip areas" ON pro_zip_areas
  FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert own zip areas" ON pro_zip_areas;
CREATE POLICY "Users can insert own zip areas" ON pro_zip_areas
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update own zip areas" ON pro_zip_areas;
CREATE POLICY "Users can update own zip areas" ON pro_zip_areas
  FOR UPDATE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can delete own zip areas" ON pro_zip_areas;
CREATE POLICY "Users can delete own zip areas" ON pro_zip_areas
  FOR DELETE USING (auth.uid() = profile_id);

-- ============================================
-- 5.2 PRO TEAM MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS pro_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('azubi', 'chef')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pro_team_members_unique ON pro_team_members(company_id, member_id);
CREATE INDEX IF NOT EXISTS idx_pro_team_members_company_id ON pro_team_members(company_id);
CREATE INDEX IF NOT EXISTS idx_pro_team_members_member_id ON pro_team_members(member_id);

ALTER TABLE pro_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Company can view team members" ON pro_team_members;
CREATE POLICY "Company can view team members" ON pro_team_members
  FOR SELECT USING (
    auth.uid() = company_id OR auth.uid() = member_id
  );

DROP POLICY IF EXISTS "Company can insert team members" ON pro_team_members;
CREATE POLICY "Company can insert team members" ON pro_team_members
  FOR INSERT WITH CHECK (auth.uid() = company_id);

DROP POLICY IF EXISTS "Company can delete team members" ON pro_team_members;
CREATE POLICY "Company can delete team members" ON pro_team_members
  FOR DELETE USING (auth.uid() = company_id);

-- ============================================
-- 6. ROUTING / ASSIGNMENT TABLES
-- ============================================

-- Routing rules (Admin konfiguriert)
-- preferred_assignee_id kann auf partners.id (assignee_type='partner') ODER profiles.id (assignee_type='handwerker') referenzieren
CREATE TABLE IF NOT EXISTS routing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_prefix TEXT NOT NULL,
  profession TEXT NOT NULL,
  preferred_assignee_id UUID, -- Kann partners.id ODER profiles.id sein (abhängig von assignee_type)
  assignee_type TEXT CHECK (assignee_type IN ('partner', 'handwerker')),
  priority INT NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view routing_rules" ON routing_rules;
CREATE POLICY "Admin can view routing_rules" ON routing_rules
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can create routing_rules" ON routing_rules;
CREATE POLICY "Admin can create routing_rules" ON routing_rules
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update routing_rules" ON routing_rules;
CREATE POLICY "Admin can update routing_rules" ON routing_rules
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can delete routing_rules" ON routing_rules;
CREATE POLICY "Admin can delete routing_rules" ON routing_rules
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_routing_rules_zip_prefix ON routing_rules(zip_prefix);
CREATE INDEX IF NOT EXISTS idx_routing_rules_profession ON routing_rules(profession);
CREATE INDEX IF NOT EXISTS idx_routing_rules_active ON routing_rules(active);
CREATE INDEX IF NOT EXISTS idx_routing_rules_preferred_assignee_id ON routing_rules(preferred_assignee_id);

-- Assignment settings pro Gewerk/Region
CREATE TABLE IF NOT EXISTS assignment_settings (
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

DROP POLICY IF EXISTS "Admin can view assignment_settings" ON assignment_settings;
CREATE POLICY "Admin can view assignment_settings" ON assignment_settings
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can create assignment_settings" ON assignment_settings;
CREATE POLICY "Admin can create assignment_settings" ON assignment_settings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update assignment_settings" ON assignment_settings;
CREATE POLICY "Admin can update assignment_settings" ON assignment_settings
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can delete assignment_settings" ON assignment_settings;
CREATE POLICY "Admin can delete assignment_settings" ON assignment_settings
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_assignment_settings_unique
  ON assignment_settings (profession, (COALESCE(zip_prefix, '')));

-- Broadcast offers (Nachvollziehbarkeit + first-accept-wins)
CREATE TABLE IF NOT EXISTS partner_offers (
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

-- Admin policies
DROP POLICY IF EXISTS "Admin can view partner_offers" ON partner_offers;
CREATE POLICY "Admin can view partner_offers" ON partner_offers
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can create partner_offers" ON partner_offers;
CREATE POLICY "Admin can create partner_offers" ON partner_offers
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update partner_offers" ON partner_offers;
CREATE POLICY "Admin can update partner_offers" ON partner_offers
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can delete partner_offers" ON partner_offers;
CREATE POLICY "Admin can delete partner_offers" ON partner_offers
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Partner self-access (Portal)
DROP POLICY IF EXISTS "Partner can view own offers" ON partner_offers;
CREATE POLICY "Partner can view own offers" ON partner_offers
  FOR SELECT USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Partner can update own offers" ON partner_offers;
CREATE POLICY "Partner can update own offers" ON partner_offers
  FOR UPDATE USING (auth.uid() = partner_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_offers_unique ON partner_offers(order_id, partner_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_offers_token_hash_unique
  ON partner_offers(token_hash) WHERE token_hash IS NOT NULL;

-- ============================================
-- 6.5. PARTNER INVITATIONS TABLE (Magic Links)
-- ============================================
CREATE TABLE IF NOT EXISTS partner_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inviter_partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE partner_invitations ENABLE ROW LEVEL SECURITY;

-- Admin policies
DROP POLICY IF EXISTS "Admin can view partner_invitations" ON partner_invitations;
CREATE POLICY "Admin can view partner_invitations" ON partner_invitations
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Inviter can view their own invitations
DROP POLICY IF EXISTS "Partner can view own invitations" ON partner_invitations;
CREATE POLICY "Partner can view own invitations" ON partner_invitations
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND inviter_partner_id = auth.uid()
  );

-- Inviter can create invitations
DROP POLICY IF EXISTS "Partner can create invitations" ON partner_invitations;
CREATE POLICY "Partner can create invitations" ON partner_invitations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND inviter_partner_id = auth.uid()
  );

-- Anyone can view pending invitations by token (for Magic Link validation)
DROP POLICY IF EXISTS "Anyone can view pending invitation by token" ON partner_invitations;
CREATE POLICY "Anyone can view pending invitation by token" ON partner_invitations
  FOR SELECT USING (
    status = 'pending' AND expires_at > NOW()
  );

-- Inviter can update their own invitations
DROP POLICY IF EXISTS "Partner can update own invitations" ON partner_invitations;
CREATE POLICY "Partner can update own invitations" ON partner_invitations
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND inviter_partner_id = auth.uid()
  );

-- Invitee can accept invitation (via token, no auth required)
DROP POLICY IF EXISTS "Invitee can accept invitation" ON partner_invitations;
CREATE POLICY "Invitee can accept invitation" ON partner_invitations
  FOR UPDATE USING (
    status = 'pending' AND expires_at > NOW()
  );

CREATE INDEX IF NOT EXISTS idx_partner_invitations_token ON partner_invitations(token);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_inviter ON partner_invitations(inviter_partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_status ON partner_invitations(status);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_expires ON partner_invitations(expires_at);

-- ============================================
-- 7. FUNCTION: Auto-update updated_at
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

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_data_updated_at BEFORE UPDATE ON order_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routing_rules_updated_at BEFORE UPDATE ON routing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_settings_updated_at BEFORE UPDATE ON assignment_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_offers_updated_at BEFORE UPDATE ON partner_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_invitations_updated_at BEFORE UPDATE ON partner_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. FUNCTION: Auto-create profile on user signup
-- ============================================
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

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. MIGRATION: Add missing columns to existing tables
-- ============================================
-- This ensures that columns are added even if tables already exist

-- Add partner_id and parent_partner_id to profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'partner_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added partner_id column to profiles';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'parent_partner_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN parent_partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added parent_partner_id column to profiles';
  END IF;
END $$;

-- Add assigned_partner_id to orders if it doesn't exist AND partners table exists
DO $$
BEGIN
  -- Check if partners table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'partners'
  ) THEN
    -- Partners table exists, safe to add column with FK constraint
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'assigned_partner_id'
    ) THEN
      ALTER TABLE orders ADD COLUMN assigned_partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;
      RAISE NOTICE 'Added assigned_partner_id column to orders';
    END IF;
  ELSE
    RAISE NOTICE 'partners table does not exist yet - skipping assigned_partner_id column. This will be added when partners table is created.';
  END IF;
END $$;

-- Ensure index exists (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'assigned_partner_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_orders_assigned_partner_id ON orders(assigned_partner_id);
  END IF;
END $$;


