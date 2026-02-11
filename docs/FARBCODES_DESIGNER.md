# Farbcodes für Designer

Übersicht der vereinheitlichten Farbpalette für alle Bereiche.

---

## Einheitliche Palette (alle Bereiche)

| Verwendung | Hex | RGB | Beschreibung |
|------------|-----|-----|--------------|
| **Gold (Primär)** | `#B8903A` | 184, 144, 58 | Hauptakzent, Buttons, Links, Icons |
| **Gold (Hover)** | `#A67C2A` | 166, 124, 42 | Hover-Zustände |
| **Grau (Sekundär)** | `#6B7280` | 107, 114, 128 | Muted Text, Labels, Sekundär |
| **Weiß** | `#FFFFFF` | 255, 255, 255 | Text auf dunklem Hintergrund, Karten |
| **Text (Primär)** | `#1A1A1A` | 26, 26, 26 | Überschriften, Fließtext (helle Themes) |

---

## 1. Öffentliche Seite

**Bereich:** Startseite (`/`), Schaden melden (`/melden/[type]`), Danke-Seite (`/danke`), Angebotsseite (`/offer/[offerId]`), AGB, Datenschutz, Impressum, Transparenz

| Verwendung | Hex | Beschreibung |
|------------|-----|--------------|
| Hintergrund (Haupt) | `#DEDED7` | Warmes Grau (Startseite) |
| Hintergrund (Body) | `#F8FAFC` | Heller Neutralton |
| Gold | `#B8903A` / Hover `#A67C2A` | Einheitlich |
| Text (Primär) | `#1A1A1A` | Überschriften, Fließtext |
| Text (Sekundär) | `#6B7280` | Muted Text |
| Border | `#EAEAEA` | Rahmen, Trennlinien |
| Karte/Fläche | `#FFFFFF` | Weiß für Karten |

---

## 2. Partner-Portal

**Bereich:** `/partner/*` – dunkles Theme, Premium-Look

| Verwendung | Hex | Beschreibung |
|------------|-----|--------------|
| Hintergrund (Haupt) | `#0A0A0A` | Tiefes Schwarz |
| Karten / Cards | `#1A1A1A` | Dunkelgrau |
| Input/Fläche | `#000000` | Reines Schwarz |
| Text (Primär) | `#FFFFFF` | Weiß |
| Text (Sekundär) | `#6B7280` | Grau (einheitlich) |
| Gold | `#B8903A` / Hover `#A67C2A` | Einheitlich |
| Erfolg | `#10B981` | Grün |
| Warnung | `#F59E0B` | Amber |
| Info | `#3B82F6` | Blau |
| Border | `rgba(255,255,255,0.1)` | Dezente Linien |

---

## 3. Pro-Portal (Handwerker)

**Bereich:** `/pro/*` – helles Theme, sachlich

| Verwendung | Hex | Beschreibung |
|------------|-----|--------------|
| Hintergrund (Haupt) | `#F8FAFC` | Sehr helles Blau-Grau |
| Karten / Cards | `#FFFFFF` | Weiß |
| Text (Primär) | `#1A1A1A` | Überschriften, Fließtext |
| Text (Sekundär) | `#6B7280` | Grau (einheitlich) |
| Gold | `#B8903A` / Hover `#A67C2A` | Einheitlich |
| Erfolg | `#10B981` | Grün |
| Warnung | `#F59E0B` | Amber |
| Info | `#3B82F6` | Blau |
| Border | `#E2E8F0` | Hellgrau |
| Fläche (neutral) | `#F7F7F7` | Filter, Tabellen-Header |
| Dringlichkeit | `#EF4444` | Rot (neue Aufträge) |

---

## CSS-Variablen (Referenz)

**Partner** (`partner-globals.css`):
- `--partner-gold: #B8903A`
- `--partner-gold-hover: #A67C2A`
- `--partner-text-secondary: #6B7280`

**Pro** (`pro-globals.css`):
- `--pro-gold: #B8903A`
- `--pro-gold-hover: #A67C2A`
- `--pro-text-secondary: #6B7280`

---

*Stand: Januar 2025 – Vereinheitlichte Palette*
