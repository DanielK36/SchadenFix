-- ============================================
-- SET ALL ASSIGNMENT SETTINGS TO AUTO MODE
-- ============================================
-- Setzt alle Assignment Settings auf "auto" Modus für automatische Zuweisung

-- Erstelle Assignment Settings für alle Gewerke (falls nicht vorhanden)
INSERT INTO assignment_settings (profession, zip_prefix, mode, active, broadcast_partner_count, fallback_behavior)
SELECT 
  profession,
  NULL as zip_prefix,
  'auto' as mode,
  true as active,
  3 as broadcast_partner_count,
  'internal_only' as fallback_behavior
FROM (
  VALUES 
    ('maler'),
    ('trocknung'),
    ('gutachter'),
    ('bodenleger'),
    ('sanitaer'),
    ('dachdecker'),
    ('kfz'),
    ('glas'),
    ('rechtsfall')
) AS professions(profession)
ON CONFLICT (profession, COALESCE(zip_prefix, '')) 
DO UPDATE SET 
  mode = 'auto',
  active = true;

-- Aktualisiere bestehende Settings auf "auto"
UPDATE assignment_settings
SET mode = 'auto', active = true
WHERE profession IN ('maler', 'trocknung', 'gutachter', 'bodenleger', 'sanitaer', 'dachdecker', 'kfz', 'glas', 'rechtsfall')
  AND (zip_prefix IS NULL OR zip_prefix = '');
