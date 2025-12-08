import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft } from "lucide-react"

export default function DatenschutzPage() {
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
            <CardTitle>Datenschutzerklärung</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Datenschutz auf einen Blick</h3>
              <h4 className="font-semibold mt-4">Allgemeine Hinweise</h4>
              <p className="text-sm text-muted-foreground">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, 
                was mit Ihren personenbezogenen Daten passiert, wenn Sie diese 
                Website besuchen. Personenbezogene Daten sind alle Daten, mit 
                denen Sie persönlich identifiziert werden können.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2. Datenerfassung auf dieser Website</h3>
              <h4 className="font-semibold mt-4">Wer ist verantwortlich für die Datenerfassung?</h4>
              <p className="text-sm text-muted-foreground">
                Die Datenverarbeitung auf dieser Website erfolgt durch den 
                Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum 
                dieser Website entnehmen.
              </p>

              <h4 className="font-semibold mt-4">Wie erfassen wir Ihre Daten?</h4>
              <p className="text-sm text-muted-foreground">
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese 
                mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie 
                in ein Kontaktformular eingeben.
              </p>

              <h4 className="font-semibold mt-4">Wofür nutzen wir Ihre Daten?</h4>
              <p className="text-sm text-muted-foreground">
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung 
                der Website zu gewährleisten. Andere Daten können zur Analyse 
                Ihres Nutzerverhaltens verwendet werden.
              </p>

              <h4 className="font-semibold mt-4">Welche Rechte haben Sie bezüglich Ihrer Daten?</h4>
              <p className="text-sm text-muted-foreground">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, 
                Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu 
                erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung 
                dieser Daten zu verlangen. Hierzu sowie zu weiteren Fragen zum Thema 
                Datenschutz können Sie sich jederzeit an uns wenden.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3. Analyse-Tools</h3>
              <p className="text-sm text-muted-foreground">
                Wir verwenden auf dieser Website keine Analyse-Tools oder 
                Tracking-Technologien.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">4. Speicherdauer</h3>
              <p className="text-sm text-muted-foreground">
                Soweit innerhalb dieser Datenschutzerklärung keine speziellere 
                Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen 
                Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. 
                Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine 
                Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten 
                gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für 
                die Speicherung Ihrer personenbezogenen Daten haben.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">5. Kontakt</h3>
              <p className="text-sm text-muted-foreground">
                Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:
                <br />
                E-Mail: datenschutz@schadenportal.de
              </p>
            </div>

            <p className="text-xs text-muted-foreground mt-8">
              Stand: {new Date().toLocaleDateString("de-DE")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

