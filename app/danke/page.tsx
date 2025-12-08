"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PartnerBadges } from "@/components/PartnerBadges"
import { CheckCircle2, MessageCircle, Home } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DankePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ticketId = searchParams.get("ticket")
  const onlyCallback = searchParams.get("onlyCallback") === "true"
  const hasWorkshopBinding = searchParams.get("workshopBinding") === "true"
  
  // Partners aus URL params (wird von API gesetzt)
  const partnersParam = searchParams.get("partners")
  const partners = partnersParam ? JSON.parse(decodeURIComponent(partnersParam)) : []

  const whatsappMessage = encodeURIComponent(
    `Hallo, ich habe einen Schaden gemeldet. Ticket-ID: ${ticketId || "N/A"}`
  )
  const whatsappLink = `https://wa.me/491711234567?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <div className="flex justify-end mb-4 sm:mb-8">
          <ThemeToggle />
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="flex justify-center mb-3 sm:mb-4">
                <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl">Vielen Dank!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {ticketId && (
                <div className="bg-muted p-3 sm:p-4 rounded-lg text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Ihre Ticket-Nummer:</p>
                  <p className="text-lg sm:text-2xl font-bold text-primary break-all">{ticketId}</p>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">So geht's weiter:</h3>
                <ul className="space-y-1.5 sm:space-y-2 list-disc list-inside text-sm sm:text-base text-muted-foreground">
                  <li>Bestätigung per E-Mail ist unterwegs.</li>
                  {onlyCallback || partners.length === 0 ? (
                    <li>Wir rufen Sie <strong>innerhalb von 60 Minuten</strong> zurück.</li>
                  ) : (
                    <li><strong>{partners[0]?.name}</strong> meldet sich i. d. R. <strong>innerhalb von 2–4 Std.</strong></li>
                  )}
                  <li>Sie können Ihre Ticket-ID jederzeit angeben.</li>
                </ul>
              </div>

              {onlyCallback || partners.length === 0 ? (
                <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Rückruf-Service:</p>
                  <p>Wir rufen Sie <strong>innerhalb von 60 Minuten</strong> zurück. Außerhalb der Geschäftszeiten spätestens am nächsten Werktag.</p>
                </div>
              ) : (
                <PartnerBadges partners={partners} />
              )}

              {hasWorkshopBinding && (
                <div className="mt-2 rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                  <p className="font-medium mb-1">Hinweis zur Werkstattbindung:</p>
                  <p>Bei Werkstattbindung wird die Partnerwahl in der Regel im Rahmen der Abwicklung abgestimmt. Wir unterstützen Sie bei der Vorbereitung.</p>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs sm:text-sm font-medium mb-1">Notfälle:</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong>02161 … (24/7)</strong> – Für dringende Fälle außerhalb der Geschäftszeiten
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-4">
                <Button asChild className="flex-1 text-xs sm:text-sm h-9 sm:h-10">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Per WhatsApp teilen</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </a>
                </Button>
                <Button variant="outline" asChild className="flex-1 text-xs sm:text-sm h-9 sm:h-10">
                  <Link href="/" className="flex items-center justify-center gap-1 sm:gap-2">
                    <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Zur Startseite</span>
                    <span className="sm:hidden">Start</span>
                  </Link>
                </Button>
              </div>

              <div className="pt-3 sm:pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/melden/kfz`)}
                  className="w-full text-xs sm:text-sm h-9 sm:h-10"
                >
                  Weitere Schadenart melden
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

