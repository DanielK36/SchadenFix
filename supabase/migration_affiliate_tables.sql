-- ============================================
-- Affiliate Tables for Partner (Vermittler)
-- ============================================

-- Simplify partners table (remove handwerker-only fields)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'profession'
  ) THEN
    ALTER TABLE partners DROP COLUMN IF EXISTS profession;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'zip_codes'
  ) THEN
    ALTER TABLE partners DROP COLUMN IF EXISTS zip_codes;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'rating'
  ) THEN
    ALTER TABLE partners DROP COLUMN IF EXISTS rating;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE partners DROP COLUMN IF EXISTS is_verified;
  END IF;
END $$;

-- Affiliate links
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

CREATE INDEX IF NOT EXISTS idx_affiliate_links_partner_id ON affiliate_links(partner_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON affiliate_links(code);

-- Partner commissions
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_commissions_order_unique ON partner_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner_id ON partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_order_id ON partner_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_status ON partner_commissions(status);

-- Partner payout settings
CREATE TABLE IF NOT EXISTS partner_payout_settings (
  partner_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  iban TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  tax_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_payout_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Partner can read own affiliate links
DROP POLICY IF EXISTS "Partner can view own affiliate links" ON affiliate_links;
CREATE POLICY "Partner can view own affiliate links" ON affiliate_links
  FOR SELECT USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Partner can update own affiliate links" ON affiliate_links;
CREATE POLICY "Partner can update own affiliate links" ON affiliate_links
  FOR UPDATE USING (auth.uid() = partner_id);

-- RLS: Partner can view own commissions
DROP POLICY IF EXISTS "Partner can view own commissions" ON partner_commissions;
CREATE POLICY "Partner can view own commissions" ON partner_commissions
  FOR SELECT USING (auth.uid() = partner_id);

-- RLS: Partner can view/update own payout settings
DROP POLICY IF EXISTS "Partner can view own payout settings" ON partner_payout_settings;
CREATE POLICY "Partner can view own payout settings" ON partner_payout_settings
  FOR SELECT USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Partner can update own payout settings" ON partner_payout_settings;
CREATE POLICY "Partner can update own payout settings" ON partner_payout_settings
  FOR UPDATE USING (auth.uid() = partner_id);
