# Update-Plan für Schadenportal

## 🔴 Kritische Sicherheitslücken (SOFORT beheben)

1. **Next.js 14.2.33** → **14.2.35** (DoS-Schwachstelle)
   - `npm install next@14.2.35`
   - Minimales Risiko, nur Patch-Update

2. **glob** (via eslint-config-next) → Update Next.js löst das
   - Command Injection Schwachstelle

3. **js-yaml** → `npm audit fix`
   - Prototype Pollution (moderate)

## 📋 Empfohlener Update-Plan

### Phase 1: Sicherheitsupdates (SOFORT)
```bash
# Kritische Sicherheitsupdates
npm install next@14.2.35 eslint-config-next@14.2.35
npm audit fix
```

### Phase 2: Minor/Patch Updates (Niedriges Risiko)
```bash
# Minor Updates ohne Breaking Changes
npm install @supabase/supabase-js@latest
npm install react-hook-form@latest
npm install recharts@latest
npm install autoprefixer@latest
npm install @radix-ui/react-label@latest
```

### Phase 3: Major Updates (VORSICHTIG - Breaking Changes möglich)

#### Option A: Konservativ (Empfohlen für Produktion)
- Next.js 14.2.35 beibehalten (stabil)
- React 18.3.1 beibehalten (kompatibel)
- Nur sicherheitskritische Updates

#### Option B: Modern (Für neue Features)
- Next.js 15.x (Breaking Changes prüfen)
- React 19.x (nur mit Next.js 15+)
- Framer Motion 12.x
- Tailwind CSS 4.x (große Änderungen!)

## ⚠️ Wichtige Hinweise

1. **Next.js 16** ist noch sehr neu - könnte Instabilität haben
2. **React 19** erfordert Next.js 15+
3. **Tailwind CSS 4** ist ein komplett neues System - große Migration nötig
4. **Zod 4** hat Breaking Changes in der API

## 🎯 Empfehlung

**Für Produktion:** Phase 1 + Phase 2 (sicher, stabil)
**Für Entwicklung:** Phase 1 + Phase 2 + vorsichtige Phase 3

## 📝 Nach Updates testen

- [ ] Build funktioniert (`npm run build`)
- [ ] Dev Server startet (`npm run dev`)
- [ ] Alle Seiten laden korrekt
- [ ] Authentication funktioniert
- [ ] API Routes funktionieren
- [ ] Supabase Connection funktioniert
