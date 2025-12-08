"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { UseFormReturn } from "react-hook-form"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface WishOptionsProps {
  form: UseFormReturn<any>
  type: string
}

// Typ-spezifische Wunsch-Optionen gemäß Matrix
export function getWishOptionsForType(type: string) {
  switch (type) {
    case "kfz":
      return [
        { value: "werkstatt", label: "Werkstatt" },
        { value: "gutachter", label: "Gutachter" },
        { value: "anwalt", label: "Rechtsanwalt" },
        { value: "nur_rueckruf", label: "Nur Rückruf" },
      ]
    case "glas":
      return [
        { value: "glaser", label: "Glaser (Standard)" },
        { value: "gutachter", label: "Gutachter (nur bei strittigen Fällen)" },
        { value: "nur_rueckruf", label: "Nur Rückruf" },
      ]
    case "wasser":
      return [
        { value: "sanitaer", label: "Sanitärbetrieb" },
        { value: "trocknung", label: "Trocknungsfirma" },
        { value: "gutachter", label: "Gutachter" },
        { value: "nur_rueckruf", label: "Nur Rückruf" },
      ]
    case "gebaeude":
    case "sturm":
      return [
        { value: "dach", label: "Dachdecker/Handwerker" },
        { value: "gutachter", label: "Gutachter" },
        { value: "nur_rueckruf", label: "Nur Rückruf" },
      ]
    case "feuer":
      return [
        { value: "brandsanierung", label: "Brandsanierung/Handwerker" },
        { value: "gutachter", label: "Gutachter" },
        { value: "anwalt", label: "Rechtsanwalt (optional)" },
        { value: "nur_rueckruf", label: "Nur Rückruf" },
      ]
    case "recht":
      return [
        { value: "anwalt", label: "Rechtsanwalt" },
        { value: "nur_rueckruf", label: "Nur Rückruf" },
      ]
    default:
      return [
        { value: "gutachter", label: "Gutachter" },
        { value: "anwalt", label: "Rechtsanwalt" },
        { value: "nur_rueckruf", label: "Nur Rückruf" },
      ]
  }
}

export function WishOptions({ form, type }: WishOptionsProps) {
  let options = getWishOptionsForType(type)
  
  // Bei Glas: Gutachter nur anzeigen wenn strittig
  if (type === "glas") {
    options = options.filter(opt => {
      if (opt.value === "gutachter") {
        return form.watch("strittig") === true
      }
      return true
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Label>Wunschabwicklung *</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Sie entscheiden, wie wir starten:
                <br />• <strong>Direkt-Partner:</strong> Wir geben Ihren Fall (mit Einwilligung) an den passenden Profi weiter.
                <br />• <strong>Gutachter:</strong> Erst neutrale Bewertung, dann Regulierung.
                <br />• <strong>Nur Rückruf:</strong> Wir melden uns persönlich und besprechen das Vorgehen.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={`wish-${option.value}`}
              checked={(form.watch("wish") || []).includes(option.value)}
              onCheckedChange={(checked) => {
                const current = form.watch("wish") || []
                if (checked) {
                  form.setValue("wish", [...current, option.value])
                } else {
                  form.setValue("wish", current.filter((w: string) => w !== option.value))
                }
              }}
            />
            <Label htmlFor={`wish-${option.value}`} className="cursor-pointer text-sm">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
      {form.formState.errors.wish && (
        <p className="text-xs sm:text-sm text-destructive mt-1">
          {form.formState.errors.wish.message as string}
        </p>
      )}
    </div>
  )
}

