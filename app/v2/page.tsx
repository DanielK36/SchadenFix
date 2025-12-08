"use client"

import Link from "next/link"

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

export default function V2Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Hero */}
        <section className="mx-auto max-w-xl py-10 text-center">
          <h1 className="text-2xl font-semibold tracking-[0.01em] text-gray-900">
            Schaden melden – schnell, digital, persönlich
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Beantworten Sie ein paar Fragen – wir kümmern uns um den Rest.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="h-4 w-4 text-amber-500">⚡</span>
              <span>In 3 Min gemeldet</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-4 w-4 text-amber-500">📷</span>
              <span>Foto-Upload optional</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-4 w-4 text-amber-500">👍</span>
              <span>Direkt an Partner</span>
            </div>
          </div>
        </section>

        {/* Tiles */}
        <section>
          <ul className="mx-auto grid max-w-2xl grid-cols-2 gap-3">
            {claimTypes.map((type) => (
              <li key={type.id}>
                <Link href={`/v2/claim/${type.id}`} className="group block">
                  <div className="rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl transition-transform group-hover:rotate-1">{type.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Hinweisbox */}
        <div className="mx-auto mt-6 max-w-xl rounded-2xl border bg-amber-50 p-4 text-center text-sm text-amber-900 border-amber-200">
          <div className="mx-auto mb-1 flex h-5 w-5 items-center justify-center">
            <span className="text-lg">ℹ️</span>
          </div>
          <div>
            Dieses Portal vermittelt geprüfte Handwerks- und Servicepartner für die Behebung Ihres Schadens.
            Der Service ist für Sie kostenfrei.
          </div>
        </div>

        {/* Footer */}
        <footer className="mx-auto mt-10 max-w-3xl px-4 pb-10 text-center text-xs text-gray-500">
          <div className="mb-2 font-medium text-gray-700">Praktische Hilfe nach einem Schaden</div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/v2/transparenz" className="underline hover:text-gray-700">
              Transparenz & Unabhängigkeit
            </Link>
            <Link href="/datenschutz" className="underline hover:text-gray-700">
              Datenschutz
            </Link>
            <Link href="/impressum" className="underline hover:text-gray-700">
              Impressum
            </Link>
          </div>
          <div className="mt-2">© {new Date().getFullYear()} Schadenportal</div>
        </footer>
      </div>
    </div>
  )
}
