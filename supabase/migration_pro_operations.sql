-- ============================================
-- Pro Operations (Availability + Zip Areas)
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
