# Alle Seiten der Schaden-App

Übersicht aller Routen und zugehörigen Dateien, um veraltete Seiten zu identifizieren.

---

## Öffentlich (ohne Login)

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/` | `app/page.tsx` | Startseite (Immersive mit Bento-Grid, Schaden melden) |
| `/melden/[type]` | `app/melden/[type]/page.tsx` | Schaden melden (kfz, glas, wasser, feuer, gebaeude, recht, …) |
| `/danke` | `app/danke/page.tsx` | Danke-Seite nach Schadenmeldung |
| `/offer/[offerId]` | `app/offer/[offerId]/page.tsx` | Kunden-Angebotsseite (KVA annehmen/unterschreiben) |
| `/agb` | `app/agb/page.tsx` | AGB |
| `/datenschutz` | `app/datenschutz/page.tsx` | Datenschutz |
| `/impressum` | `app/impressum/page.tsx` | Impressum |
| `/transparenz` | `app/transparenz/page.tsx` | Transparenz |
| `/meine-meldungen` | `app/meine-meldungen/page.tsx` | Meine Meldungen (Kunde?) |
| `/profil` | `app/profil/page.tsx` | Profil (öffentlich?) |

---

## Pro-Portal (Handwerker)

Layout: `app/pro/layout.tsx`

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/pro/login` | `app/pro/login/page.tsx` | Pro-Login |
| `/pro/register` | `app/pro/register/page.tsx` | Pro-Registrierung |
| `/pro/forgot-password` | `app/pro/forgot-password/page.tsx` | Passwort vergessen |
| `/pro/dashboard` | `app/pro/dashboard/page.tsx` | Dashboard |
| `/pro/orders` | `app/pro/orders/page.tsx` | Auftragsliste |
| `/pro/orders/[id]` | `app/pro/orders/[id]/page.tsx` | Auftragsdetail |
| `/pro/billing` | `app/pro/billing/page.tsx` | Abrechnung / Servicegebühr |
| `/pro/team` | `app/pro/team/page.tsx` | Team |
| `/pro/settings` | `app/pro/settings/page.tsx` | Einstellungen |
| `/pro/operations` | `app/pro/operations/page.tsx` | Einsatzbereiche / Verfügbarkeit |
| `/pro/performance` | `app/pro/performance/page.tsx` | Leistung / Statistiken |
| `/pro/invoices/new` | `app/pro/invoices/new/page.tsx` | Neue Rechnung (falls verwendet) |

---

## Partner-Portal (Vertriebler / Affiliate)

Layout: `app/partner/layout.tsx`

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/partner` | `app/partner/page.tsx` | Partner-Start / Dashboard |
| `/partner/login` | `app/partner/login/page.tsx` | Partner-Login |
| `/partner/login/forgot` | `app/partner/login/forgot/page.tsx` | Passwort vergessen |
| `/partner/login/reset` | `app/partner/login/reset/page.tsx` | Passwort zurücksetzen |
| `/partner/register` | `app/partner/register/page.tsx` | Partner-Registrierung |
| `/partner/leads` | `app/partner/leads/page.tsx` | Leads (Referral-Aufträge) |
| `/partner/leads/[id]` | `app/partner/leads/[id]/page.tsx` | Lead-Detail |
| `/partner/commissions` | `app/partner/commissions/page.tsx` | Provisionen |
| `/partner/commissions/[id]` | `app/partner/commissions/[id]/page.tsx` | Provision-Detail |
| `/partner/offers` | `app/partner/offers/page.tsx` | Angebote |
| `/partner/offers/[id]` | `app/partner/offers/[id]/page.tsx` | Angebot-Detail |
| `/partner/materials` | `app/partner/materials/page.tsx` | Werbemittel / Affiliate-Link |
| `/partner/team` | `app/partner/team/page.tsx` | Partner-Team |
| `/partner/settings` | `app/partner/settings/page.tsx` | Partner-Einstellungen |
| `/partner/invite/[token]` | `app/partner/invite/[token]/page.tsx` | Einladung per Token |

---

## Admin-Portal

Layout: `app/admin/layout.tsx`

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/admin` | `app/admin/page.tsx` | Admin-Dashboard |
| `/admin/orders` | `app/admin/orders/page.tsx` | Alle Aufträge |
| `/admin/orders/[orderId]` | `app/admin/orders/[orderId]/page.tsx` | Auftragsdetail (inkl. OrderDetailClient.tsx) |
| `/admin/partners` | `app/admin/partners/page.tsx` | Partner verwalten |
| `/admin/routing` | `app/admin/routing/page.tsx` | Routing-Regeln |
| `/admin/finances` | `app/admin/finances/page.tsx` | Finanzen |
| `/admin/radar` | `app/admin/radar/page.tsx` | Radar (Aufträge?) |

---

## Gold-Arc (eigener Flow / White-Label?)

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/gold-arc` | `app/gold-arc/page.tsx` | Gold-Arc Start |
| `/gold-arc/icon-auswahl` | `app/gold-arc/icon-auswahl/page.tsx` | Icon-Auswahl |
| `/gold-arc/melden` | `app/gold-arc/melden/page.tsx` | Schaden melden |
| `/gold-arc/beschreibung` | `app/gold-arc/beschreibung/page.tsx` | Beschreibung |
| `/gold-arc/rueckruf` | `app/gold-arc/rueckruf/page.tsx` | Rückruf-Daten |
| `/gold-arc/erfolg` | `app/gold-arc/erfolg/page.tsx` | Erfolgsseite |

---

## Swiss-Clean (eigener Flow)

Layout: `app/swiss-clean/layout.tsx`

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/swiss-clean` | `app/swiss-clean/page.tsx` | Swiss-Clean Start |
| `/swiss-clean/wizard` | `app/swiss-clean/wizard/page.tsx` | Wizard |
| `/swiss-clean/success` | `app/swiss-clean/success/page.tsx` | Erfolg |
| `/swiss-clean/contact` | `app/swiss-clean/contact/page.tsx` | Kontakt |

---

## Layouts (keine eigene URL)

| Datei | Gilt für |
|-------|----------|
| `app/layout.tsx` | Root-Layout (ganze App) |
| `app/pro/layout.tsx` | Alle `/pro/*` Seiten |
| `app/partner/layout.tsx` | Alle `/partner/*` Seiten |
| `app/admin/layout.tsx` | Alle `/admin/*` Seiten |

---

## Kurz-Check: Was könnte veraltet sein?

- **Rechtliches:** `agb`, `datenschutz`, `impressum`, `transparenz` – Texte/Rechtstand prüfen.
- **Pro:** `pro/performance`, `pro/invoices/new` – ob noch im Einsatz.
- **Partner:** `partner/offers`, `partner/offers/[id]` – ob mit aktuellem Angebots-Flow (KVA über `/offer/[offerId]`) übereinstimmt.
- **Admin:** `admin/radar`, `admin/finances` – ob Inhalt und KPIs aktuell sind.
- **Öffentlich:** `meine-meldungen`, `profil` – ob diese Routen noch vorgesehen sind.

Diese Liste kannst du abhaken und bei Bedarf veraltete Seiten entfernen oder umziehen.
