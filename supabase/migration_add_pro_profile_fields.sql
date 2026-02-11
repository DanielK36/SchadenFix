-- ============================================
-- MIGRATION: Pro-Profil-Felder (Ansprechpartner, Kontakt, Adresse, Bank)
-- ============================================
-- Fügt Felder zur profiles Tabelle hinzu für Pro-Einstellungen

DO $$
DECLARE
  col TEXT;
  cols TEXT[] := ARRAY[
    'contact_person', 'email', 'phone', 'address', 'zip', 'city',
    'iban', 'account_holder', 'tax_id'
  ];
BEGIN
  FOREACH col IN ARRAY cols
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = col
    ) THEN
      EXECUTE format('ALTER TABLE profiles ADD COLUMN %I TEXT', col);
      RAISE NOTICE 'Added column profiles.%', col;
    END IF;
  END LOOP;
END $$;
