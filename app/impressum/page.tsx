import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft } from "lucide-react"

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>
          <ThemeToggle />
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Impressum</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p className="text-sm text-muted-foreground">
              Angaben gemäß § 5 TMG
            </p>
            
            <h3 className="text-lg font-semibold mt-6">Schadenportal</h3>
            <p>
              Musterstraße 1<br />
              12345 Musterstadt
            </p>

            <h3 className="text-lg font-semibold mt-6">Kontakt</h3>
            <p>
              Telefon: +49 (0) 123 456789<br />
              E-Mail: info@schadenportal.de
            </p>

            <h3 className="text-lg font-semibold mt-6">Verantwortlich für den Inhalt</h3>
            <p>
              Max Mustermann<br />
              Musterstraße 1<br />
              12345 Musterstadt
            </p>

            <h3 className="text-lg font-semibold mt-6">Haftungsausschluss</h3>
            <p className="text-sm text-muted-foreground">
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte 
              können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter 
              sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
              nach den allgemeinen Gesetzen verantwortlich.
            </p>

            <p className="text-xs text-muted-foreground mt-8">
              Stand: {new Date().toLocaleDateString("de-DE")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

