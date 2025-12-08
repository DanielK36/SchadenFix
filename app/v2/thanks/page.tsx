"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, MessageCircle, Home } from "lucide-react"
import Link from "next/link"

export default function V2ThanksPage() {
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
    <div className="min-h-screen bg-neutral-50 pb-24">
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900">Vielen Dank!</h2>
          </div>

          {ticketId && (
            <>
              <div className="mb-4 text-xs text-gray-500">Ihre Ticket-Nummer:</div>
              <div className="mb-4 font-mono text-sm text-gray-800 break-all">{ticketId}</div>
            </>
          )}

          <div className="mb-4 space-y-2 text-sm text-gray-600">
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
            <div className="mb-4 rounded-xl border bg-neutral-50 p-3 text-sm">
              <p className="font-medium mb-1">Rückruf-Service:</p>
              <p>
                Wir rufen Sie <strong>innerhalb von 60 Minuten</strong> zurück. Außerhalb der Geschäftszeiten spätestens am nächsten Werktag.
              </p>
            </div>
          ) : (
            <div className="mb-4 rounded-xl border p-3 text-sm">
              <p>
                Weitergeleitet an:{" "}
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-1">
                  {partners[0]?.name}
                </span>
              </p>
              <div className="mt-1 text-gray-500">
                Meldet sich i. d. R. innerhalb von <strong>2–4 Std.</strong>
              </div>
            </div>
          )}

          {hasWorkshopBinding && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium mb-1">Hinweis zur Werkstattbindung:</p>
              <p>Bei Werkstattbindung wird die Partnerwahl in der Regel im Rahmen der Abwicklung abgestimmt. Wir unterstützen Sie bei der Vorbereitung.</p>
            </div>
          )}

          <div className="mb-4 text-xs text-gray-500">
            Notfälle: <strong>02161 … (24/7)</strong>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 font-medium text-white shadow-md hover:bg-amber-600 active:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </Link>
            <Link
              href="/v2"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border bg-white text-gray-700 hover:bg-neutral-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <Home className="h-5 w-5" />
              Zur Startseite
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => router.push(`/v2/claim/kfz`)}
              className="w-full text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Weitere Schadenart melden
            </button>
          </div>
        </div>

        {/* Sticky WhatsApp Button */}
        <div className="sticky bottom-4 mt-4 px-4">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-amber-500 py-3 text-center font-medium text-white shadow-md hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

