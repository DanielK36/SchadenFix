-- Status "genehmigt" für Aufträge erlauben (Kunde hat KVA angenommen)
-- Ohne diesen Wert schlägt POST /api/offer/[token]/accept beim Update auf "genehmigt" fehl.

-- Constraint-Name kann "orders_status_check" sein (PostgreSQL-Default)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('neu', 'bearbeitung', 'angebot', 'genehmigt', 'abgeschlossen', 'storniert'));
