"use client"

import { useState } from "react"
import {
  CarFront,
  Car,
  Truck,
  BusFront,
  CarTaxiFront,
  Square,
  Grid3x3,
  Shield,
  Diamond,
  Octagon,
  Building,
  Building2,
  Warehouse,
  Factory,
  Landmark,
  Flame,
  Zap,
  Sparkles,
  Circle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type IconFamily = "contour" | "outline" | "inlinefill" | "duotone" | "negative"

type IconVariant = {
  id: string
  label: string
  Icon: LucideIcon
  family: IconFamily
  description: string
  palette: {
    primary: string
    secondary?: string
    backdrop?: string
  }
}

const FAMILY_RENDERERS: Record<IconFamily, (variant: IconVariant) => JSX.Element> = {
  contour: ({ Icon, palette }) => (
    <div className="relative w-28 h-28 rounded-[32px] bg-[#05080F] border border-white/10 flex items-center justify-center">
      <Icon
        className="absolute w-20 h-20"
        stroke={palette.primary}
        strokeWidth={4.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.35 }}
      />
      <Icon
        className="relative w-16 h-16"
        stroke={palette.secondary ?? "#060A12"}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </div>
  ),
  outline: ({ Icon, palette }) => (
    <div className="relative w-28 h-28 rounded-[32px] border border-white/15 flex items-center justify-center bg-transparent">
      <Icon
        className="w-18 h-18"
        stroke={palette.primary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </div>
  ),
  inlinefill: ({ Icon, palette }) => (
    <div className="relative w-28 h-28 rounded-[32px] bg-[#070C14] border border-white/8 flex items-center justify-center">
      <Icon
        className="w-18 h-18"
        stroke={palette.primary}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ fill: palette.secondary ?? `${palette.primary}20` }}
      />
    </div>
  ),
  duotone: ({ Icon, palette }) => (
    <div className="relative w-28 h-28 rounded-[32px] overflow-hidden bg-[#05080F] border border-white/8">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(145deg, ${palette.primary}44, ${palette.secondary ?? palette.primary}11)` }}
      />
      <Icon
        className="relative z-10 w-18 h-18 mx-auto my-auto block"
        stroke={palette.primary}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Icon
        className="absolute inset-0 w-20 h-20 m-auto opacity-25"
        stroke={palette.secondary ?? "#FFFFFF"}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </div>
  ),
  negative: ({ Icon, palette }) => (
    <div className="relative w-28 h-28 rounded-[32px] bg-[#FDFDFD] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${palette.backdrop ?? "#111"}, ${palette.primary})` }}
      />
      <Icon
        className="relative z-10 w-20 h-20 mx-auto my-auto block mix-blend-screen"
        stroke="#FFFFFF"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </div>
  ),
}

const ICON_SETS: Record<string, IconVariant[]> = {
  KFZ: [
    {
      id: "kfz-contour",
      label: "Contour Drive",
      Icon: CarFront,
      family: "contour",
      description: "Dicke Farbkontur plus dunkler Kern",
      palette: { primary: "#FFD766", secondary: "#070B13" },
    },
    {
      id: "kfz-outline",
      label: "Outline Linear",
      Icon: Car,
      family: "outline",
      description: "Feine monochrome Linie",
      palette: { primary: "#F3C34F" },
    },
    {
      id: "kfz-inlinefill",
      label: "Inline Fill",
      Icon: Truck,
      family: "inlinefill",
      description: "Farbfläche mit Kontur",
      palette: { primary: "#FAD37C", secondary: "#FAD37C22" },
    },
    {
      id: "kfz-duotone",
      label: "Duo Motion",
      Icon: BusFront,
      family: "duotone",
      description: "Zweifarbige Linienlagen",
      palette: { primary: "#FFE3A6", secondary: "#FFF1CC" },
    },
    {
      id: "kfz-negative",
      label: "Negative Glow",
      Icon: CarTaxiFront,
      family: "negative",
      description: "Invertierter Glow",
      palette: { primary: "#F8C65A", backdrop: "#05070A" },
    },
  ],
  GLAS: [
    {
      id: "glas-contour",
      label: "Contour Pane",
      Icon: Square,
      family: "contour",
      description: "Türkisfarbene Außenkante",
      palette: { primary: "#7FE3FF", secondary: "#04070D" },
    },
    {
      id: "glas-outline",
      label: "Outline Grid",
      Icon: Grid3x3,
      family: "outline",
      description: "Feine Glaslinien",
      palette: { primary: "#9BE6FF" },
    },
    {
      id: "glas-inlinefill",
      label: "Inline Frost",
      Icon: Shield,
      family: "inlinefill",
      description: "Ausgefüllter Schild",
      palette: { primary: "#8DDCFF", secondary: "#8DDCFF26" },
    },
    {
      id: "glas-duotone",
      label: "Duo Crystal",
      Icon: Diamond,
      family: "duotone",
      description: "Doppelte Lichtkante",
      palette: { primary: "#7FD7FF", secondary: "#D4F6FF" },
    },
    {
      id: "glas-negative",
      label: "Negative Ice",
      Icon: Octagon,
      family: "negative",
      description: "Hell auf dunkel",
      palette: { primary: "#6FC8FF", backdrop: "#04121F" },
    },
  ],
  GEBÄUDE: [
    {
      id: "geb-contour",
      label: "Contour Tower",
      Icon: Building,
      family: "contour",
      description: "Architekturkontur",
      palette: { primary: "#B8C6FF", secondary: "#05080F" },
    },
    {
      id: "geb-outline",
      label: "Outline Blocks",
      Icon: Building2,
      family: "outline",
      description: "Feine Linien",
      palette: { primary: "#A5B6FF" },
    },
    {
      id: "geb-inlinefill",
      label: "Inline Warehouse",
      Icon: Warehouse,
      family: "inlinefill",
      description: "Fläche + Strich",
      palette: { primary: "#9EB2FF", secondary: "#9EB2FF22" },
    },
    {
      id: "geb-duotone",
      label: "Duo Factory",
      Icon: Factory,
      family: "duotone",
      description: "Zweifarbige Tiefe",
      palette: { primary: "#9AB0FF", secondary: "#C6D1FF" },
    },
    {
      id: "geb-negative",
      label: "Negative Landmark",
      Icon: Landmark,
      family: "negative",
      description: "Licht auf dunkel",
      palette: { primary: "#CED7FF", backdrop: "#0A0D18" },
    },
  ],
  FEUER: [
    {
      id: "feu-contour",
      label: "Contour Flame",
      Icon: Flame,
      family: "contour",
      description: "Außenring mit Kern",
      palette: { primary: "#FFB577", secondary: "#0C0706" },
    },
    {
      id: "feu-outline",
      label: "Outline Spark",
      Icon: Sparkles,
      family: "outline",
      description: "Feine Linien",
      palette: { primary: "#FF9D66" },
    },
    {
      id: "feu-inlinefill",
      label: "Inline Surge",
      Icon: Zap,
      family: "inlinefill",
      description: "Farbfläche + Strich",
      palette: { primary: "#FF9456", secondary: "#FF945623" },
    },
    {
      id: "feu-duotone",
      label: "Duo Ember",
      Icon: Flame,
      family: "duotone",
      description: "Doppelte Glowlinie",
      palette: { primary: "#FF7E45", secondary: "#FFC9A4" },
    },
    {
      id: "feu-negative",
      label: "Negative Burst",
      Icon: Flame,
      family: "negative",
      description: "Inverser Glow",
      palette: { primary: "#FF8F5A", backdrop: "#140704" },
    },
  ],
}

const STYLE_LABELS: Record<IconFamily, string> = {
  contour: "Kontur + Farbe",
  outline: "Nur Umriss",
  inlinefill: "Farbfläche + Umriss",
  duotone: "Doppelte Linie / Duotone",
  negative: "Negativ / Invers",
}

export default function IconAuswahlPage() {
  const [selected, setSelected] = useState<Record<string, string>>({})

  return (
    <main className="min-h-screen bg-[#04070D] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="text-center space-y-4">
          <p className="text-[12px] uppercase tracking-[0.35em] text-gray-500">Icon Playground</p>
          <h1 className="text-3xl font-semibold">Gold Arc – Icon Varianten</h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Fokus auf Strichführung: dicke Farbkontur, reine Outlines, Inline-Fills, Duotone-Stacks und invertierte Negative –
            so sieht man direkt, wie derselbe Lucide-Grundkörper komplett anders wirkt.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gray-500">
            {Object.entries(STYLE_LABELS).map(([key, label]) => (
              <span key={key} className="px-3 py-1 rounded-full bg-white/5">
                {label}
              </span>
            ))}
          </div>
        </header>

        {Object.entries(ICON_SETS).map(([category, variants]) => (
          <section key={category} className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">{category}</h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() =>
                    setSelected((prev) => ({
                      ...prev,
                      [category]: variant.id,
                    }))
                  }
                  className={`relative rounded-3xl p-4 flex flex-col items-center gap-4 transition-all ${
                    selected[category] === variant.id
                      ? "bg-[#121826] border border-[rgba(255,214,106,0.8)] shadow-[0_15px_45px_rgba(255,214,106,0.2)]"
                      : "bg-[#070B13] border border-white/8 hover:border-[rgba(255,214,106,0.4)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
                  }`}
                >
                  {FAMILY_RENDERERS[variant.family](variant)}
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold">{variant.label}</p>
                    <p className="text-xs text-gray-400">{variant.description}</p>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
                      {STYLE_LABELS[variant.family]}
                    </p>
                  </div>
                  {selected[category] === variant.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#FFD66A] shadow-[0_0_12px_rgba(255,214,106,0.8)]" />
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}

        <section className="p-6 rounded-3xl border border-white/10 bg-[#070B12] space-y-3">
          <h3 className="text-lg font-semibold">Aktuelle Auswahl</h3>
          <pre className="text-xs bg-black/30 rounded-2xl p-4 overflow-auto">
            {JSON.stringify(selected, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  )
}
