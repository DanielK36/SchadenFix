-- ============================================
-- MIGRATION: Routing Rules für Handwerker erweitern
-- ============================================
-- Führt preferred_partner_id zu preferred_assignee_id um und fügt assignee_type hinzu

-- Schritt 1: Neue Spalte assignee_type hinzufügen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'routing_rules' AND column_name = 'assignee_type'
  ) THEN
    ALTER TABLE routing_rules ADD COLUMN assignee_type TEXT CHECK (assignee_type IN ('partner', 'handwerker'));
    RAISE NOTICE 'Added assignee_type column to routing_rules';
  END IF;
END $$;

-- Schritt 2: Neue Spalte preferred_assignee_id hinzufügen (ohne FK Constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'routing_rules' AND column_name = 'preferred_assignee_id'
  ) THEN
    ALTER TABLE routing_rules ADD COLUMN preferred_assignee_id UUID;
    RAISE NOTICE 'Added preferred_assignee_id column to routing_rules';
  END IF;
END $$;

-- Schritt 3: Migriere bestehende Daten: preferred_partner_id → preferred_assignee_id
DO $$
BEGIN
  UPDATE routing_rules
  SET 
    preferred_assignee_id = preferred_partner_id,
    assignee_type = 'partner'
  WHERE preferred_partner_id IS NOT NULL 
    AND (preferred_assignee_id IS NULL OR assignee_type IS NULL);
  
  RAISE NOTICE 'Migrated existing preferred_partner_id to preferred_assignee_id';
END $$;

-- Schritt 4: Entferne alte Spalte preferred_partner_id (nur wenn preferred_assignee_id existiert)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'routing_rules' AND column_name = 'preferred_assignee_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'routing_rules' AND column_name = 'preferred_partner_id'
  ) THEN
    -- Entferne Foreign Key Constraint zuerst
    ALTER TABLE routing_rules DROP CONSTRAINT IF EXISTS routing_rules_preferred_partner_id_fkey;
    -- Entferne Spalte
    ALTER TABLE routing_rules DROP COLUMN preferred_partner_id;
    RAISE NOTICE 'Removed old preferred_partner_id column';
  END IF;
END $$;

-- Schritt 5: Index für preferred_assignee_id erstellen
CREATE INDEX IF NOT EXISTS idx_routing_rules_preferred_assignee_id ON routing_rules(preferred_assignee_id);
