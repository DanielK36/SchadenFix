-- ============================================
-- ADD ORDER_WIZARD_DATA TABLE
-- ============================================
-- Diese Tabelle wird vom Code verwendet (orderService.ts)
-- Sie ist identisch zu order_data, aber mit einem anderen Namen

CREATE TABLE IF NOT EXISTS order_wizard_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  category_answers JSONB DEFAULT '{}',
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  voice_note_url TEXT,
  internal_notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE order_wizard_data ENABLE ROW LEVEL SECURITY;

-- Policies (gleiche Logik wie order_data)
CREATE POLICY "Users can view company order_wizard_data" ON order_wizard_data
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    order_id IN (
      SELECT id FROM orders WHERE (
        company_id = auth.uid()
        OR company_id IN (
          SELECT id FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'chef'
        )
      )
    )
  );

CREATE POLICY "Users can create company order_wizard_data" ON order_wizard_data
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    order_id IN (
      SELECT id FROM orders WHERE (
        company_id = auth.uid()
        OR company_id IN (
          SELECT id FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'chef'
        )
      )
    )
  );

CREATE POLICY "Users can update company order_wizard_data" ON order_wizard_data
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    order_id IN (
      SELECT id FROM orders WHERE (
        company_id = auth.uid()
        OR company_id IN (
          SELECT id FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'chef'
        )
      )
    )
  );

-- Index
CREATE INDEX idx_order_wizard_data_order_id ON order_wizard_data(order_id);

-- Trigger für updated_at
CREATE TRIGGER update_order_wizard_data_updated_at 
  BEFORE UPDATE ON order_wizard_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
