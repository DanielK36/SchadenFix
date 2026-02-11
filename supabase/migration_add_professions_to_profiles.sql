-- ============================================
-- MIGRATION: Add professions JSONB field to profiles
-- ============================================
-- Fügt ein professions JSONB Feld zur profiles Tabelle hinzu für Handwerker-Gewerke

-- Schritt 1: Spalte hinzufügen (falls nicht vorhanden)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'professions'
  ) THEN
    ALTER TABLE profiles ADD COLUMN professions JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added professions column to profiles table';
  END IF;
END $$;

-- Schritt 2: Bestehende Einträge auf leeres Array setzen (falls NULL)
UPDATE profiles 
SET professions = '[]'::jsonb 
WHERE professions IS NULL;

-- Schritt 3: Index für JSONB-Queries erstellen (für bessere Performance bei Filterung)
CREATE INDEX IF NOT EXISTS idx_profiles_professions ON profiles USING GIN (professions);

