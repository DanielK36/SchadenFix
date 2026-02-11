-- ============================================
-- MIGRATION: order_quotes für KVA-Persistenz + Magic-Link-Angebote
-- ============================================
-- Speichert KVA-Positionen pro Auftrag und Token für Kunden-Link

CREATE TABLE IF NOT EXISTS order_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  offer_token TEXT UNIQUE,
  offer_sent_at TIMESTAMPTZ,
  customer_accepted_at TIMESTAMPTZ,
  customer_signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_quotes_order_id ON order_quotes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_quotes_offer_token ON order_quotes(offer_token) WHERE offer_token IS NOT NULL;

ALTER TABLE order_quotes ENABLE ROW LEVEL SECURITY;

-- Pro-User (Auftrag gehört zur Company) dürfen ihre Angebote lesen/schreiben
CREATE POLICY "Pro can manage own order quotes" ON order_quotes
  FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    order_id IN (
      SELECT id FROM orders WHERE company_id = auth.uid() OR assigned_to = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    order_id IN (
      SELECT id FROM orders WHERE company_id = auth.uid() OR assigned_to = auth.uid()
    )
  );

-- Öffentlicher Zugriff per Token nur per Service/API (keine Policy für anon auf RLS)
-- GET /api/offer/[token] nutzt Service-Role oder eigene Token-Validierung
