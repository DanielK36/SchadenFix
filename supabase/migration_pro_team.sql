-- ============================================
-- Pro Team Members (Chef -> Azubi)
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
