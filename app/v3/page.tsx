"use client"

import Link from "next/link"
import { Bolt, Camera, ThumbsUp, Info } from "lucide-react"

const claimTypes = [
  { id: "kfz", label: "KFZ", icon: "🚗", description: "Unfall, Parkrempler, Wild, Hagel" },
  { id: "glas", label: "Glas", icon: "🪟", description: "Autoscheiben, Fenster, Glastüren" },
  { id: "wasser", label: "Wasserschaden", icon: "💧", description: "Rohrbruch, Feuchtigkeit, Überschwemmung" },
  { id: "gebaeude", label: "Gebäude", icon: "🏠", description: "Dach, Fassade, Fliesen, Malerarbeiten" },
  { id: "sturm", label: "Hagel-/Sturm-/Gewitterschaden", icon: "⚡", description: "Sturmschäden, Hagel, Gewitter" },
  { id: "feuer", label: "Feuerschaden", icon: "🔥", description: "Brand, Rauch, Feuer" },
  { id: "recht", label: "Rechtsfall melden", icon: "⚖️", description: "Schadenersatz, Regress, Rechtsbeistand" },
  { id: "sonstiges", label: "Sonstiges", icon: "✳️", description: "Weitere Schäden" },
]

export default function V3Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Header mit Logo-Platzhalter */}
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm" aria-label="Logo Platzhalter">
              S
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E1E1E] tracking-tight">
              Schadenportal
            </h1>
          </div>
        </header>

        {/* Hero */}
        <section className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Schaden melden – schnell, digital, persönlich
          </h1>
          <p className="text-sm text-gray-600 mb-4 sm:mb-6">
            Beantworten Sie ein paar Fragen – wir kümmern uns um den Rest.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Bolt className="h-4 w-4 text-[#EAB308]" aria-hidden="true" />
              <span>In 3 Min gemeldet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-[#EAB308]" aria-hidden="true" />
              <span>Foto-Upload optional</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="h-4 w-4 text-[#EAB308]" aria-hidden="true" />
              <span>Direkt an Partner</span>
            </div>
          </div>
        </section>

        {/* Tiles */}
        <section className="mb-6 sm:mb-8">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ gridAutoRows: '1fr' }}>
            {claimTypes.map((type) => (
              <li key={type.id} className="h-full">
                <Link href={`/v3/claim/${type.id}`} className="group block h-full">
                  <div className="h-full min-h-[80px] rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-xl sm:text-2xl transition-transform group-hover:rotate-1 flex-shrink-0" aria-hidden="true">{type.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base text-gray-900 break-words leading-tight">{type.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-snug">{type.description}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Hinweisbox - elegante Info-Box */}
        <div className="mx-auto max-w-xl rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm mb-8 sm:mb-10">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#EAB308] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 leading-relaxed">
              <p>
                Dieses Portal vermittelt geprüfte Handwerks- und Servicepartner für die Behebung Ihres Schadens.
                Die Leistung ist für Sie kostenfrei.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mx-auto max-w-xl text-center text-xs sm:text-sm text-gray-500">
          <div className="mb-2 font-medium text-gray-700">Praktische Hilfe nach einem Schaden</div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-2">
            <Link href="/v3/transparenz" className="underline hover:text-gray-700 transition-colors">
              Transparenz & Unabhängigkeit
            </Link>
            <Link href="/datenschutz" className="underline hover:text-gray-700 transition-colors">
              Datenschutz
            </Link>
            <Link href="/impressum" className="underline hover:text-gray-700 transition-colors">
              Impressum
            </Link>
          </div>
          <div className="mt-2">© {new Date().getFullYear()} Schadenportal</div>
        </footer>
      </div>
    </div>
  )
}

