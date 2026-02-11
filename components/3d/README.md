# 3D Glass Prism Setup

## Aktueller Status

Die `GlassPrism.tsx` Komponente verwendet aktuell einen CSS-basierten Platzhalter.

## React Three Fiber Installation (Optional)

Für das echte 3D-Glas-Prisma mit Caustics installiere:

```bash
npm install @react-three/fiber @react-three/drei three
```

## Nach Installation

Ersetze den Inhalt von `GlassPrism.tsx` mit:

```tsx
"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Mesh } from "three"
import { Caustics, Environment } from "@react-three/drei"

// ... (siehe vollständige Implementierung)
```

## Features

- Langsame Rotation (0.3x speed)
- Lichtbrechung (Caustics)
- Farbwechsel basierend auf Hover-State
- Transparentes Glas-Material

