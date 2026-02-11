-- ============================================
-- CREATE assignment_settings TABLE
-- ============================================
-- Falls die Tabelle noch nicht existiert, wird sie hier erstellt

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

-- Enable Row Level Security
ALTER TABLE assignment_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
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

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_assignment_settings_unique
  ON assignment_settings (profession, (COALESCE(zip_prefix, '')));

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_assignment_settings_updated_at ON assignment_settings;
CREATE TRIGGER update_assignment_settings_updated_at 
  BEFORE UPDATE ON assignment_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
