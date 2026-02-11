-- ============================================
-- CREATE ASSIGNMENT SETTINGS (Service Role)
-- ============================================
-- Dieses Script erstellt Assignment Settings direkt ohne RLS-Prüfung
-- Führe dies im Supabase SQL Editor aus (läuft mit Service Role)

-- Stelle sicher, dass die Tabelle existiert
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

-- Erstelle Unique Index (falls nicht vorhanden)
CREATE UNIQUE INDEX IF NOT EXISTS idx_assignment_settings_unique
  ON assignment_settings (profession, (COALESCE(zip_prefix, '')));

-- Erstelle alle Assignment Settings für alle Gewerke (globale Settings ohne ZIP-Prefix)
INSERT INTO assignment_settings (profession, zip_prefix, mode, active, broadcast_partner_count, fallback_behavior)
VALUES
  ('maler', NULL, 'auto', true, 3, 'internal_only'),
  ('trocknung', NULL, 'auto', true, 3, 'internal_only'),
  ('gutachter', NULL, 'auto', true, 3, 'internal_only'),
  ('bodenleger', NULL, 'auto', true, 3, 'internal_only'),
  ('sanitaer', NULL, 'auto', true, 3, 'internal_only'),
  ('dachdecker', NULL, 'auto', true, 3, 'internal_only'),
  ('kfz', NULL, 'auto', true, 3, 'internal_only'),
  ('glas', NULL, 'auto', true, 3, 'internal_only'),
  ('rechtsfall', NULL, 'auto', true, 3, 'internal_only')
ON CONFLICT (profession, COALESCE(zip_prefix, '')) 
DO UPDATE SET 
  mode = 'auto',
  active = true,
  updated_at = NOW();

-- Zeige alle erstellten Settings
SELECT profession, zip_prefix, mode, active, created_at 
FROM assignment_settings 
ORDER BY profession, zip_prefix;
