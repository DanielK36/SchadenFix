-- ============================================
-- assigned_partner_id: Referral-Partner (nicht Handwerker)
-- assigned_to = Handwerker (Profil), assigned_partner_id = Partner (Vermittler/Referral)
-- ============================================

-- 1. Spalte assigned_partner_id zu orders hinzufügen (falls nicht vorhanden)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'partners'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'assigned_partner_id'
    ) THEN
      ALTER TABLE orders
        ADD COLUMN assigned_partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;
      RAISE NOTICE 'Added assigned_partner_id to orders';
    END IF;
  END IF;
END $$;

-- 2. Index für Abfragen der Partner-Leads (nur wenn Spalte existiert)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'assigned_partner_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_orders_assigned_partner_id ON orders(assigned_partner_id);
  END IF;
END $$;

-- 3. RLS: Partner dürfen ihre Referral-Aufträge (assigned_partner_id = ich) lesen
DROP POLICY IF EXISTS "Partner can view own referral orders" ON orders;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'assigned_partner_id'
  ) THEN
    EXECUTE 'CREATE POLICY "Partner can view own referral orders" ON orders
      FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND assigned_partner_id = auth.uid()
      )';
  END IF;
END $$;
