-- Rechnungen als bezahlt markieren: UPDATE-Policy für invoices ergänzen
-- Ohne diese Policy schlägt PUT /api/pro/invoices/[id] (status = paid) fehl.

DROP POLICY IF EXISTS "Users can update company invoices" ON invoices;
CREATE POLICY "Users can update company invoices" ON invoices
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
