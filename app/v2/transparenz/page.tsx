"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function V2TransparenzPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/v2"
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Link>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-2xl font-semibold text-gray-900">
            Transparenz & Unabhängigkeit
          </h1>

          <div className="space-y-6 text-sm text-gray-600">
            <div>
              <p className="mb-4">
                Unser Service ist für Verbraucher kostenfrei. Partnerbetriebe nutzen unsere Plattform auf Servicevertragsbasis. 
                Wir sind kein Versicherer und führen keine Schadenregulierung durch.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Kostenfreiheit für Verbraucher</h2>
              <p className="mb-4">
                Das Schadenportal ist für Sie als Verbraucher <strong>100 % kostenfrei</strong>. 
                Sie zahlen keine Gebühren oder Zusatzkosten für die Nutzung unserer Plattform.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Geschäftsmodell</h2>
              <p className="mb-4">
                Partnerbetriebe (Werkstätten, Handwerker, Gutachter, Rechtsanwälte) nutzen unsere Plattform 
                auf <strong>Servicevertragsbasis</strong>. Diese Partnerbetriebe entrichten eine Servicegebühr 
                (10 % auf ausgeführte Aufträge) für die Plattformnutzung und Vermittlung.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Unabhängigkeit & Transparenz</h2>
              <p className="mb-4">
                <strong>Wichtig:</strong> Diese Vergütungsmodelle beeinflussen weder Ihren Preis noch die 
                Abwicklung Ihres Schadens. Die Partnerbetriebe arbeiten zu ihren üblichen Konditionen.
              </p>
              <p className="mb-4">
                Wir vermitteln Dienstleister zur Schadenbehebung. Wir regulieren keine Schäden und entscheiden 
                nicht im Namen von Versicherern.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Datenweitergabe</h2>
              <p>
                Ihre Daten werden nur mit Ihrer ausdrücklichen Einwilligung an Partner weitergegeben. 
                Sie können jederzeit der Datenweitergabe widersprechen. Details finden Sie in unserer{" "}
                <Link href="/datenschutz" className="text-amber-600 underline hover:text-amber-700">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Link href="/v2" className="text-sm text-amber-600 underline hover:text-amber-700">
              ← Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

