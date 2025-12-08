# Schadenportal

Eine produktionsreife, mobile-first Schadensmeldung-Web-App mit exzellentem UX/UI. Nutzer können Schäden schnell und unkompliziert melden und werden automatisch an passende Partner weitergeleitet.

## ⚖️ Rechtliche Abgrenzung

**Wichtiger Hinweis:** Das Schadenportal ist eine **eigenständige Serviceplattform nach der Schadenmeldung** und dient der **praktischen Hilfe** durch Partnervermittlung (Werkstatt/Handwerker/Gutachter/Anwalt). 

- ✅ **Was wir tun:** Wir vermitteln Dienstleister zur Schadenbehebung
- ❌ **Was wir NICHT tun:** Wir regulieren keine Schäden und entscheiden nicht für den Versicherer
- 📋 **Schadenregulierung:** Erfolgt stets durch die Versicherung des Kunden

Der Betreiber ist ein **Versicherungsvermittler (Mehrfachagent)**, keine Schadensregulierung und keine Steuerung im Namen des Versicherers.

## Features

- 🚗 **Mehrere Schadentypen**: KFZ, Glas, Wasser, Gebäude, Sturm, Feuer, Rechtsfall, Sonstiges
- 📸 **Foto-Upload**: Optional, Mehrfach-Upload mit Vorschau (max. 10 Bilder)
- 🤝 **Typ-spezifisches Partner-Routing**: 
  - KFZ → Werkstatt, Gutachter, Rechtsanwalt
  - Glas → Glaser (Gutachter nur bei strittigen Fällen)
  - Wasser → Sanitärbetrieb, Trocknungsfirma
  - Gebäude/Sturm → Dachdecker/Handwerker
  - Feuer → Brandsanierung/Handwerker
- 📧 **E-Mail-Benachrichtigungen**: 
  - Kunde: Bestätigung mit Ticket-ID, Zeitfenster, Partner-Info
  - Interne Inbox: Vollständige Details, SLA für "Nur Rückruf"
  - Partner: Nur bei Einwilligung und nicht "Nur Rückruf"
- ✅ **DSGVO-konform**: Zwei Einwilligungen (Partner-Weitergabe Pflicht, Vermittler optional)
- 🔔 **Notfall-Hinweise**: Automatische Hinweise bei aktiven Wasseraustritten
- 🏭 **Werkstattbindung**: Hinweise bei KFZ mit Werkstattbindung
- 📱 **Mobile-First**: Optimiert für alle Geräte
- 🌙 **Dark Mode**: Unterstützung für Dark Mode
- ⚡ **Schnell & Modern**: Next.js 14, TypeScript, Tailwind CSS

## Tech-Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui Komponenten
- **React Hook Form** + Zod (Validierung)
- **Uploadthing** für Bild-Uploads
- **Supabase** (optional) oder In-Memory für Demo
- **Resend** für E-Mail-Versand
- **Framer Motion** für Animationen

## Setup

### Voraussetzungen

- Node.js 18+ oder höher
- pnpm, npm oder yarn

### Installation

1. Dependencies installieren:

```bash
# Mit pnpm (empfohlen)
pnpm install

# Oder mit npm
npm install

# Oder mit yarn
yarn install
```

2. Umgebungsvariablen konfigurieren:

Erstellen Sie eine `.env.local` Datei basierend auf `.env.example`:

```bash
cp .env.example .env.local
```

Füllen Sie die erforderlichen Umgebungsvariablen aus:

```env
# Uploadthing (für Foto-Uploads)
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Resend (für E-Mails)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=Schadenportal <noreply@schadenportal.de>

# Interne E-Mail-Adresse
INTERNAL_EMAIL=service@schadenportal.de

# Supabase (optional - falls verwendet)
USE_SUPABASE=false
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Development-Server starten:

```bash
# Mit pnpm
pnpm dev

# Oder mit npm
npm run dev

# Oder mit yarn
yarn dev
```

Die App ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Projektstruktur

```
├── app/                    # Next.js App Router Seiten
│   ├── api/               # API Routes
│   ├── melden/[type]/     # Dynamischer Wizard
│   ├── danke/             # Bestätigungsseite
│   └── ...
├── components/            # React Komponenten
│   ├── ui/               # shadcn/ui Komponenten
│   └── ...
├── lib/                  # Utilities & Business Logic
│   ├── schemas/          # Zod Schemas
│   ├── repo/             # Repository Pattern
│   ├── partner-routing.ts
│   └── ...
├── data/                 # Statische Daten
│   └── partners.json     # Partner-Mapping
└── public/               # Statische Assets
```

## Verwendung

### Schaden melden

1. Auf der Startseite den gewünschten Schadentyp wählen
2. Den mehrstufigen Wizard durchlaufen:
   - Was ist passiert?
   - Wann und wo?
   - Schuldfrage & Wünsche
   - Fotos (optional)
   - Kontakt
   - Einverständnis
3. Nach dem Absenden erhalten Sie eine Ticket-ID
4. Automatische Weiterleitung an passende Partner

### Partner-Routing

Das System routet automatisch basierend auf:
- **Schadentyp**: z.B. Glas → Glaser
- **PLZ-Region**: Partners werden nach Region gefiltert
- **Wunschabwicklung**: Gutachter, Anwalt, Werkstatt
- **Spezifische Felder**: z.B. KFZ mit Glasschaden → Glaser

Partner-Daten werden in `data/partners.json` verwaltet.

## Entwicklung

### Linting

```bash
# Mit pnpm
pnpm lint
pnpm build
pnpm start

# Oder mit npm/yarn - ersetzen Sie 'pnpm' durch 'npm' oder 'yarn'
```

## Repository-Pattern

Die App nutzt ein Repository-Pattern für die Datenpersistenz:

- **In-Memory** (Standard): Für lokale Entwicklung
- **Supabase**: Optional für Produktion

Konfiguration über `USE_SUPABASE` in `.env.local`.

## E-Mail-Versand

Die App sendet automatisch E-Mails an:
- **Kunde**: Bestätigung mit Ticket-ID
- **Interne Inbox**: Vollständige Schadensdetails
- **Partner**: Kurze Zusammenfassung mit Kontaktdaten

Verwendet wird [Resend](https://resend.com/).

## Foto-Upload

Foto-Uploads erfolgen über [Uploadthing](https://uploadthing.com/):
- Bis zu 10 Fotos pro Schaden
- Max. 4 MB pro Bild
- Automatische Optimierung

## DSGVO & Datenschutz

- **Datenschutzerklärung** unter `/datenschutz`
- **Zwei Einwilligungen:**
  - Partner-Weitergabe (Pflicht): Einwilligung zur Weitergabe an ausgewählte Partner
  - Vermittler-Einsicht (Optional): Betreuender Versicherungsvermittler darf einsehen
- **Transparenz**: Hinweis zu Tippgeberprovisionen (keine Mehrkosten für Kunden)
- **Server-seitige Validierung**: Alle Daten werden serverseitig validiert
- **Sichere Datenverarbeitung**: Keine Auth, keine sensiblen Daten ohne Einwilligung

## Lizenz

Alle Rechte vorbehalten.

## Support

Bei Fragen oder Problemen wenden Sie sich an: info@schadenportal.de

