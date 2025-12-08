import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft } from "lucide-react"

export default function TransparenzPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex justify-between items-center mb-4 sm:mb-8">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 text-primary hover:underline text-sm sm:text-base">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Zurück
          </Link>
          <ThemeToggle />
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                Transparenz & Unabhängigkeit
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Unser Service ist für Verbraucher kostenfrei. Partnerbetriebe nutzen unsere Plattform auf Servicevertragsbasis. 
                  Wir sind kein Versicherer und führen keine Schadenregulierung durch.
                </p>

                <h2 className="text-lg sm:text-xl font-semibold mb-3">Kostenfreiheit für Verbraucher</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Das Schadenportal ist für Sie als Verbraucher <strong>100 % kostenfrei</strong>. 
                  Sie zahlen keine Gebühren oder Zusatzkosten für die Nutzung unserer Plattform.
                </p>

                <h2 className="text-lg sm:text-xl font-semibold mb-3">Geschäftsmodell</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Partnerbetriebe (Werkstätten, Handwerker, Gutachter, Rechtsanwälte) nutzen unsere Plattform 
                  auf <strong>Servicevertragsbasis</strong>. Diese Partnerbetriebe entrichten eine Servicegebühr 
                  (10 % auf ausgeführte Aufträge) für die Plattformnutzung und Vermittlung.
                </p>

                <h2 className="text-lg sm:text-xl font-semibold mb-3">Unabhängigkeit & Transparenz</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  <strong>Wichtig:</strong> Diese Vergütungsmodelle beeinflussen weder Ihren Preis noch die 
                  Abwicklung Ihres Schadens. Die Partnerbetriebe arbeiten zu ihren üblichen Konditionen.
                </p>

                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Wir vermitteln Dienstleister zur Schadenbehebung. Wir regulieren keine Schäden und entscheiden 
                  nicht im Namen von Versicherern.
                </p>

                <h2 className="text-lg sm:text-xl font-semibold mb-3">Datenweitergabe</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Ihre Daten werden nur mit Ihrer ausdrücklichen Einwilligung an Partner weitergegeben. 
                  Sie können jederzeit der Datenweitergabe widersprechen. Details finden Sie in unserer 
                  <Link href="/datenschutz" className="text-primary underline ml-1">Datenschutzerklärung</Link>.
                </p>
              </div>

              <div className="pt-4 border-t">
                <Link href="/" className="text-primary underline text-sm hover:text-primary/80">
                  ← Zur Startseite
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

