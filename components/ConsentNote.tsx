"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { UseFormReturn } from "react-hook-form"
import { Info } from "lucide-react"

interface ConsentNoteProps {
  form: UseFormReturn<any>
}

export function ConsentNote({ form }: ConsentNoteProps) {
  return (
    <div className="space-y-4">
      {/* Hinweis oben im Wizard */}
      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        <p className="font-medium mb-1">Wichtiger Hinweis:</p>
        <p>Wir helfen bei der <strong>praktischen Abwicklung</strong> Ihres Schadens durch Vermittlung geprüfter Partnerbetriebe.</p>
      </div>

      {/* Checkbox 1: Partner-Weitergabe (Pflicht) */}
      <div className="flex items-start gap-3 p-3 sm:p-4 border rounded-lg bg-muted/30">
        <Checkbox
          id="consent-partner"
          checked={form.watch("consents.partner") || false}
          onCheckedChange={(checked) => form.setValue("consents.partner", checked)}
          className="mt-1"
        />
        <div className="flex-1">
          <Label
            htmlFor="consent-partner"
            className="text-xs sm:text-sm leading-relaxed cursor-pointer block"
          >
            Ich willige ein, dass meine Angaben an ausgewählte Partner (z. B. Werkstatt/Handwerker/Glaser) zur Bearbeitung weitergegeben werden. *
          </Label>
          <p className="text-xs text-muted-foreground mt-2">
            Das Portal ist für Sie kostenfrei. Partnerbetriebe nutzen unsere Plattform auf <strong>Servicevertragsbasis (10 %)</strong>.
          </p>
          {form.formState.errors.consents && 'partner' in form.formState.errors.consents && (
            <p className="text-xs text-destructive mt-1">
              {(form.formState.errors.consents.partner as any)?.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Checkbox 2: Vermittler-Einsicht (Optional) */}
      <div className="flex items-start gap-3 p-3 sm:p-4 border rounded-lg bg-muted/30">
        <Checkbox
          id="consent-agent"
          checked={form.watch("consents.agent") || false}
          onCheckedChange={(checked) => form.setValue("consents.agent", checked)}
          className="mt-1"
        />
        <Label
          htmlFor="consent-agent"
          className="text-xs sm:text-sm leading-relaxed cursor-pointer flex-1"
        >
          Mein betreuender Versicherungsvermittler darf meine Schadenmeldung einsehen (falls registriert).
        </Label>
      </div>

      {/* Links */}
      <div className="text-xs sm:text-sm text-muted-foreground text-center space-x-2">
        <Link href="/transparenz" className="text-primary underline hover:text-primary/80">
          Transparenz & Unabhängigkeit
        </Link>
        {" • "}
        <Link href="/datenschutz" className="text-primary underline hover:text-primary/80">
          Datenschutzerklärung
        </Link>
        {" • "}
        <Link href="/impressum" className="text-primary underline hover:text-primary/80">
          Impressum
        </Link>
      </div>
    </div>
  )
}
