"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, MessageCircle, Home } from "lucide-react"
import Link from "next/link"

export default function V3ThanksPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ticketId = searchParams.get("ticket")
  const onlyCallback = searchParams.get("onlyCallback") === "true"
  const hasWorkshopBinding = searchParams.get("workshopBinding") === "true"

  const partnersParam = searchParams.get("partners")
  const partners = partnersParam ? JSON.parse(decodeURIComponent(partnersParam)) : []

  const whatsappMessage = encodeURIComponent(
    `Hallo, ich habe einen Schaden gemeldet. Ticket-ID: ${ticketId || "N/A"}`
  )
  const whatsappLink = `https://wa.me/491711234567?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-[#EAB308]" aria-hidden="true" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Vielen Dank!</h2>
          </div>

          {ticketId && (
            <>
              <div className="mb-2 text-xs text-gray-500">Ihre Ticket-Nummer:</div>
              <div className="mb-6 font-mono text-sm text-gray-800 break-all">{ticketId}</div>
            </>
          )}

          <div className="mb-6 space-y-2 text-sm leading-relaxed text-gray-700">
            <p>Bestätigung per E-Mail ist unterwegs.</p>
            {onlyCallback || partners.length === 0 ? (
              <p>
                Wir rufen Sie <strong>innerhalb von 60 Minuten</strong> zurück.
              </p>
            ) : (
              <p>
                <strong>{partners[0]?.name}</strong> meldet sich i. d. R. <strong>innerhalb von 2–4 Std.</strong>
              </p>
            )}
            <p>Sie können Ihre Ticket-ID jederzeit angeben.</p>
          </div>

          {onlyCallback || partners.length === 0 ? (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <p className="font-medium mb-2 text-gray-900">Rückruf-Service:</p>
              <p>
                Wir rufen Sie <strong>innerhalb von 60 Minuten</strong> zurück. Außerhalb der Geschäftszeiten spätestens am nächsten Werktag.
              </p>
            </div>
          ) : (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <p className="mb-2">
                Weitergeleitet an:{" "}
                <span className="inline-flex items-center rounded-full bg-white px-2 py-1 text-gray-900 font-medium border border-gray-200">
                  {partners[0]?.name}
                </span>
              </p>
              <p className="text-gray-600">
                Meldet sich i. d. R. innerhalb von <strong>2–4 Std.</strong>
              </p>
            </div>
          )}

          {hasWorkshopBinding && (
            <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
              <p className="font-medium mb-1">Hinweis zur Werkstattbindung:</p>
              <p className="leading-relaxed">Bei Werkstattbindung wird die Partnerwahl in der Regel im Rahmen der Abwicklung abgestimmt. Wir unterstützen Sie bei der Vorbereitung.</p>
            </div>
          )}

          <div className="mb-6 text-xs text-gray-500">
            Notfälle: <strong>02161 … (24/7)</strong>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#EAB308] text-sm font-medium text-white shadow-sm hover:bg-amber-600 active:bg-amber-700 focus:ring-2 focus:ring-[#EAB308] focus:outline-none transition-colors"
              aria-label="WhatsApp öffnen"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp
            </a>
            <Link
              href="/v3"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-[#EAB308] focus:outline-none transition-colors"
              aria-label="Zur Startseite"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              Zur Startseite
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push(`/v3/claim/kfz`)}
              className="w-full text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
            >
              Weitere Schadenart melden
            </button>
          </div>
        </div>

        {/* Sticky WhatsApp Button */}
        <div className="sticky bottom-4 mt-4 px-4 sm:px-0">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-[#EAB308] py-3 text-center text-sm font-medium text-white shadow-md hover:bg-amber-600 focus:ring-2 focus:ring-[#EAB308] focus:outline-none transition-colors"
            aria-label="WhatsApp öffnen"
          >
            <MessageCircle className="h-5 w-5 inline-block mr-2" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

