---
name: Angebot Rechnung Flow
overview: Plan für KVA-Bearbeitung, Rechnungs-UI, Magic-Link-Angebotsflow, „Rechnung bezahlt“, Statistiken sowie E-Mails/WhatsApp und rechtliche Absicherung im Angebots- und Rechnungsprozess.
todos: []
isProject: false
---

# Angebot & Rechnung: Umsetzung und nächste Schritte

## Ist-Stand (Kurz)

| Bereich | Aktuell |
|--------|---------|
| **KVA bearbeiten** | [QuotePreview.tsx](components/pro/QuotePreview.tsx): „Bearbeiten“ schaltet nur `isEditing`; Einzelpreise sind editierbar, werden **nicht gespeichert**. `onEdit` ist `() => {}`. |
| **Rechnung erstellen** | [app/pro/orders/[id]/page.tsx](app/pro/orders/[id]/page.tsx) Tab „Angebot/Rechnung“: Felder (Netto, MwSt, etc.) funktionieren, Block ist optisch schlicht. „PDF generieren & Senden“ macht nur `alert(...)` – **keine** PDF-Erzeugung, kein Speichern, kein Versand. |
| **Magic Link / Kunde** | [app/offer/[offerId]/page.tsx](app/offer/[offerId]/page.tsx) nutzt **Mock** `getOfferById(offerId)`; kein Backend, keine Verknüpfung zu echten Aufträgen/Angeboten. |
| **Rechnung bezahlt** | [app/api/pro/invoices/[id]/route.ts](app/api/pro/invoices/[id]/route.ts): PUT erlaubt bereits `status` (inkl. `"paid"`). **Keine** Pro-UI (Button „Rechnung bezahlt“). |
| **Statistiken** | Dashboard/Admin/Finanzen werten `inv.status === "paid"` aus – sobald Rechnungen auf `paid` gesetzt werden, fließen sie in die Statistiken. |
| **E-Mails** | [lib/email.ts](lib/email.ts): Resend für Claim-Bestätigung und interne Mails. **Keine** Mails für Angebot versenden, Rechnung versenden, Annahme, Zahlung. |
| **WhatsApp** | Nicht angebunden. |
| **Rechtliches** | Keine zentralen Checkboxen/Infoboxen für AGB, Widerruf, Datenschutz im Angebots-/Annahme-Flow. |

---

## 1. KVA bearbeiten sinnvoll umsetzen

**Problem:** Änderungen an Positionen/Preisen sind nur im lokalen State; nach Reload oder „Angebot freigeben“ fehlt Persistenz.

**Vorschlag:**

- **Wo speichern?** Zwei saubere Optionen:
- **A)** Neue Tabelle `order_quotes` (oder `order_offer_items`): `order_id`, `items` (JSONB: Positionen mit Beschreibung, Menge, Einheit, Einzelpreis, Gesamt), `version`/`updated_at`. Eine Zeile pro Auftrag, Überschreiben beim Speichern.
- **B)** Bestehendes `order_wizard_data` um ein JSONB-Feld `quote_items` erweitern und dort die KVA-Positionen ablegen (weniger neue Strukturen, dafür Vermischung mit Wizard-Logik).

- **„Bearbeiten“ im UI:**  
- Wenn **A)**: Beim Klick auf „Bearbeiten“ bleibt die bestehende Inline-Bearbeitung (Mengen/Preise). Zusätzlich: Beim Klick auf „Fertig“ oder „Angebot freigeben & Senden“ die aktuellen `items` an eine neue API senden (z.B. `PUT /api/pro/orders/[id]/quote`) und in DB schreiben.  
- Optional: `onEdit` so nutzen, dass aus dem Auftragsdetail ein größerer Editor geöffnet wird (z.B. Modal/Seite), wo auch Texte/Positionen hinzugefügt/entfernt werden können – kann Phase 2 sein.

- **Konkrete Schritte:**

1. Migration: Tabelle `order_quotes` (oder Erweiterung `order_wizard_data`) anlegen.
2. API `PUT /api/pro/orders/[id]/quote `(Body: `{ items: QuoteItem[] }`) implementieren; Pro-User und `company_id`/Auftragszugehörigkeit prüfen.
3. In [QuotePreview.tsx](components/pro/QuotePreview.tsx): Beim „Angebot freigeben & Senden“ (und optional „Fertig“) `items` an diese API senden; bei Load des Auftrags `items` aus dieser Quelle laden und anstelle von `generateQuoteFromWizardData` verwenden, falls vorhanden.
4. Auftragsdetail-Seite: Beim Laden des Auftrags Angebots-Items (falls vorhanden) an `QuotePreview` übergeben, sodass Bearbeitung echte Daten trifft.

Damit ist der KVA wirklich „bearbeitbar“ und bleibt erhalten.

---

## 2. Rechnung erstellen: Optik und Funktionalität

**Optik:** Den Block „Rechnung erstellen“ an das KVA-Layout anlehnen (Karte mit klaren Abschnitten, Typografie wie in [QuotePreview.tsx](components/pro/QuotePreview.tsx)), ohne den Tab zu überladen.

**„PDF generieren & Senden“:**

- **Minimal:**  
- Rechnung per `POST /api/pro/invoices` anlegen (order_id, net_amount, vat_rate, description, due_date aus dem Formular).  
- Button-Text/Loading und Erfolg-/Fehlermeldung (z.B. Toast oder Hinweis unter dem Button).  
- Kein echter PDF-Versand in Phase 1 – nur DB-Persistenz und klare Rückmeldung.
- **Erweitert (später):**  
- PDF serverseitig erzeugen (z.B. @react-pdf/renderer serverseitig oder eine Library wie pdf-lib / Puppeteer), in Storage legen, `pdf_url` in `invoices` setzen.  
- E-Mail „Rechnung für Auftrag XY“ an Kunden-E-Mail mit Link zum PDF oder Anhang (siehe Abschnitt E-Mails).

**Verlinkungen:**

- Nach Erstellen: entweder Kurz-Hinweis „Rechnung erstellt“ + optional Link zu „Rechnungscenter“ oder zu einer Rechnungsdetail-Ansicht ` /pro/invoices/[id]` (falls gewünscht).
- Rechnungscenter [app/pro/billing/page.tsx](app/pro/billing/page.tsx): Liste/Detail so verlinken, dass man von einem Auftrag zur zugehörigen Rechnung und umgekehrt kommt (z.B. `order_id` in Rechnungsliste, Klick führt zu `/pro/orders/[id]` Tab Rechnung).

---

## 3. Magic Link – Kunde nimmt an

**Ziel:** Handwerker kann ein Angebot „freigeben & senden“ → System erzeugt einen kundenbezogenen Link → Kunde öffnet Link, sieht Angebot, kann annehmen (z.B. mit Signatur).

**Datenmodell:**

- Entweder bestehende Struktur um Nutzung erweitern oder neu:
- **Variante A:** Tabelle `order_quotes` (siehe oben) um `offer_token` (unique), `offer_sent_at`, `customer_accepted_at`, `customer_signature_url` (optional) erweitern.
- **Variante B:** Eigene Tabelle `pro_offers` mit `order_id`, `token`, `items`, `status` (draft | sent | accepted | declined), `sent_at`, `accepted_at`, `signature_url`, etc.

**Flow:**

1. Handwerker klickt „Angebot freigeben & Senden“:

- KVA-Items speichern (order_quotes / pro_offers).
- `offer_token` generieren (z.B. uuid oder secure random), in DB speichern.
- Öffentliche URL: `/offer/[token]` (nicht orderId; token nicht leicht ratbar).
- Optional sofort: E-Mail an Kundene-Mail mit Link `{BASE}/offer/[token]`.

2. Kunde öffnet Link:

- [app/offer/[offerId]/page.tsx](app/offer/[offerId]/page.tsx) umbauen auf `/offer/[token]` (oder Route umbenennen).
- API `GET /api/offer/[token]` (öffentlich, nur wenn Token gültig): liefert Angebotsdetail (Auftragsinfo, Kundename, Positionen, Summen, Gültigkeit). Kein Mock mehr.

3. Kunde „nimmt an“ (z.B. Signatur + „Annehmen“):

- `POST /api/offer/[token]/accept `(Signatur als Data-URL oder Upload), Server speichert Annahme, setzt z.B. `orders.status = 'angebot'` oder neuer Status `offer_accepted`, `order_quotes`/`pro_offers.accepted_at` etc.
- Optional: E-Mail an Handwerker „Kunde hat Angebot angenommen“.

**Rechtliches** (siehe Abschnitt 6): Auf der Angebots-Kunden-Seite klare Infos + Checkboxen (AGB, Datenschutz, ggf. Widerruf) und „Annehmen“ erst aktiv, wenn alle nötigen angehakt.

---

## 4. Rechnung bezahlt – Handwerker setzt Status

- **Backend:** Bereits möglich: `PUT /api/pro/invoices/[id] `mit `{ "status": "paid" }` (vgl. [app/api/pro/invoices/[id]/route.ts](app/api/pro/invoices/[id]/route.ts)).
- **UI:**
- **Variante A:** Im Auftragsdetail unter „Angebot/Rechnung“, wenn für diesen Auftrag bereits eine Rechnung existiert: kleines Badge „Rechnung: Offen“ plus Button „Als bezahlt markieren“ → Aufruf `PUT /api/pro/invoices/[invoiceId] `mit `status: "paid"`.
- **Variante B:** Im Rechnungscenter [app/pro/billing/page.tsx](app/pro/billing/page.tsx) bei jeder Rechnung mit `status !== 'paid'` einen Button „Rechnung bezahlt“ → gleicher API-Call.
- **Statistik:** Keine Extra-Arbeit nötig – Admin/Dashboard/Finanzen lesen bereits `inv.status === "paid"`. Sobald der Handwerker den Status setzt, fließt die Rechnung in die Statistiken.

---

## 5. E-Mails und WhatsApp

**E-Mails (Resend bleibt zentral):**

- **Neue Templates/Funktionen in [lib/email.ts](lib/email.ts) (oder eigene Dateien pro Kontext):**
- **Angebot an Kunde:** Betreff z.B. „Ihr Kostenvoranschlag – [Auftrag/Angebot-ID]“, Body: kurze Anrede, Link `/offer/[token]`, Hinweis auf Gültigkeit.
- **Rechnung an Kunde:** „Ihre Rechnung zu Auftrag …“, Link zum PDF oder Anhang (sobald PDF vorhanden).
- **Annahme für Handwerker:** „Ihr Angebot wurde von [Kunde] angenommen“.
- **Optional:** „Rechnung als bezahlt gemeldet“ an Buchhaltung/Backoffice (falls gewünscht).

- **Integration:** Beim „Angebot freigeben & Senden“ und beim „Rechnung per E-Mail senden“ die jeweilige Funktion aufrufen; Kunden-E-Mail aus `orders.customer_data` oder aus zugehörigem Auftrag.

**WhatsApp:**

- Derzeit **nicht** im Code. Für einen zweiten Kanal könnten z.B. Twilio oder eine WhatsApp Business API angebunden werden.
- Sinnvolle Platzierung: optional beim Versand des Angebots/der Rechnung („Per E-Mail“ / „Per WhatsApp“ / „Beides“). Dafür wäre ein eigener kleiner Abschnitt „WhatsApp-Integration“ nötig (Credentials, Template-Nachrichten, Logging).

Empfehlung: Zuerst E-Mails sauber ausbauen, WhatsApp als separaten Schritt planen und mit dir abstimmen (Anbieter, Kosten, gewünschte Szenarien).

---

## 6. Rechtliche Checkboxen und Infos

- **Wo:** Vor allem auf der **Kunden-Seite des Angebots** ([app/offer/[offerId]/page.tsx](app/offer/[offerId]/page.tsx) bzw. `/offer/[token]`):
- Checkbox „Ich habe die [AGB](link) gelesen und akzeptiert.“
- Checkbox „Ich habe die [Datenschutzerklärung](link) zur Kenntnis genommen.“
- Optional: „Ich wurde über mein Widerrufsrecht informiert“ (falls B2C).
- „Annehmen“-Button erst aktiv, wenn alle erforderlichen angehakt sind; Absende-Request enthält die Bestätigungen (z.B. als Flags in `POST /api/offer/[token]/accept`), Server speichert Zeitpunkt der Annahme (und idealerweise, dass die Checkboxen bestätigt wurden).
- **Pro-Seite:** Beim „Angebot freigeben & Senden“ optional kurzer Hinweis: „Mit dem Versand erhalten der Kunde unsere AGB und Datenschutzhinweise“ (rein informativ, kein Muss-Checkbox für den Handwerker, außer du willst das so).

---

## 7. Nächste Schritte – priorisiert

1. **KVA persistieren („bearbeiten“ wird wirksam)**  

- Migration für Angebots-Items (z.B. `order_quotes`), API `PUT /api/pro/orders/[id]/quote`, QuotePreview + Auftragsdetail anbinden.  
- Danach: „Angebot freigeben & Senden“ speichert immer den aktuellen KVA.

2. **Rechnung erstellen verknüpfen**  

- „PDF generieren & Senden“ durch echten Aufruf `POST /api/pro/invoices` ersetzen, Erfolg/Fehler anzeigen, ggf. Link ins Rechnungscenter.  
- Block „Rechnung erstellen“ optisch an KVA-Karte anpassen.

3. **Magic Link & Kunde nimmt an**  

- Token-Flow und Tabelle/Spalten für Angebot-Versand + Annahme.  
- `/offer/[token]` und `GET /api/offer/[token]`, `POST /api/offer/[token]/accept`.  
- E-Mail „Angebot an Kunde“ mit Link.

4. **„Rechnung bezahlt“-Button**  

- In Pro (Auftragsdetail und/oder Rechnungscenter) einführen und `PUT .../invoices/[id] `mit `status: "paid"` aufrufen.

5. **Rechtliches auf Kunden-Angebotsseite**  

- AGB-/Datenschutz-Checkboxen, Widerruf optional; Annahme nur bei bestätigten Häkchen.

6. **E-Mails ausbauen**  

- Wie in Abschnitt 5; WhatsApp danach oder parallel als eigenen Baustein.

Wenn du magst, können wir als erstes nur (1) und (2) detailliert durchgehen (konkrete Änderungen in den genannten Dateien), oder du gibst eine andere Reihenfolge vor (z.B. zuerst Magic Link, dann KVA-Speichern).