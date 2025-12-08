# Supabase Integration - Setup Guide

## Schritt 1: Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Notiere dir die **Project URL** und den **anon/public key**

## Schritt 2: Environment Variables

Erstelle eine `.env.local` Datei im Root-Verzeichnis mit folgenden Variablen:

```env
NEXT_PUBLIC_SUPABASE_URL=deine_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key
SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key
```

**Wo finde ich diese Werte?**
- Gehe zu deinem Supabase Projekt
- Settings → API
- Dort findest du:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role** Key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ WICHTIG: Dieser Key umgeht RLS - niemals im Frontend verwenden!)

## Schritt 3: SQL Schema ausführen

1. Gehe zu deinem Supabase Projekt
2. Öffne den **SQL Editor**
3. Kopiere den Inhalt von `supabase/schema.sql`
4. Führe das SQL-Script aus

Das Script erstellt:
- `profiles` Tabelle (User-Profile)
- `orders` Tabelle (Aufträge)
- `order_data` Tabelle (Wizard-Daten)
- `invoices` Tabelle (Rechnungen)
- Row Level Security Policies
- Trigger für auto-update `updated_at`
- Trigger für auto-create profile bei User-Signup

## Schritt 4: Authentication Setup (Optional)

Falls du Authentication nutzen möchtest:

1. Gehe zu Authentication → Providers
2. Aktiviere die gewünschten Provider (Email, Google, etc.)
3. Konfiguriere die Email-Templates

## Schritt 5: Testen

Nach dem Setup kannst du die App starten:

```bash
npm run dev
```

Die Service-Funktionen in `services/orderService.ts` sind bereit für die Verwendung.

## Wichtige Hinweise

- **Row Level Security (RLS)** ist aktiviert - nur User der gleichen Company können Daten sehen
- Die `profiles` Tabelle wird automatisch erstellt, wenn ein neuer User sich registriert
- Alle Timestamps werden automatisch aktualisiert

