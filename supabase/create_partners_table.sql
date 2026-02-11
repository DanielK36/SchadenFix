-- ============================================
-- CREATE PARTNERS TABLE (AFFILIATES)
-- ============================================
-- Run this to create the partners table if it doesn't exist

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

-- Create trigger for updated_at
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing partner profiles to partners table
INSERT INTO partners (id, company_name, email, profession, zip_codes, is_verified, rating)
SELECT 
  p.id,
  COALESCE(p.company_name, 'Unbekannt') as company_name,
  au.email,
  NULL as profession,
  ARRAY[]::TEXT[] as zip_codes,
  FALSE as is_verified,
  4.5 as rating
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE p.role = 'partner'
  AND NOT EXISTS (SELECT 1 FROM partners WHERE partners.id = p.id)
ON CONFLICT (id) DO NOTHING;
