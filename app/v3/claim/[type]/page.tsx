"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  claimTypeSchema,
  kfzClaimSchema,
  gebaeudeClaimSchema,
  glasClaimSchema,
  wasserClaimSchema,
  feuerClaimSchema,
  sturmClaimSchema,
  rechtClaimSchema,
  sonstigesClaimSchema,
  type ClaimInput,
} from "@/lib/schemas/claim"
import { Progress } from "@/components/v2/Progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PhotoUploader } from "@/components/PhotoUploader"
import { ContactFields } from "@/components/ContactFields"
import { ConsentNote } from "@/components/ConsentNote"
import { getWishOptionsForType } from "@/app/melden/[type]/wish-options"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, Info } from "lucide-react"

const claimSchemas = {
  kfz: kfzClaimSchema,
  glas: glasClaimSchema,
  wasser: wasserClaimSchema,
  gebaeude: gebaeudeClaimSchema,
  sturm: sturmClaimSchema,
  feuer: feuerClaimSchema,
  recht: rechtClaimSchema,
  sonstiges: sonstigesClaimSchema,
}

export default function V3WizardPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const type = params.type as string

  if (!claimTypeSchema.safeParse(type).success) {
    router.push("/v3")
    return null
  }

  const schema = claimSchemas[type as keyof typeof claimSchemas]
  if (!schema) {
    router.push("/v3")
    return null
  }

  const form = useForm<ClaimInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: type as any,
      description: "",
      occurredAt: new Date(Date.now() - 60000).toISOString(),
      locationText: "",
      plz: "",
      wish: [],
      contact: {
        name: "",
        email: "",
        phone: "",
        preferredContactMethod: "telefon",
      },
      photos: [],
      consents: {
        partner: false,
        agent: false,
      },
      ...(type === "sonstiges" && { freeText: "" }),
    },
    mode: "onChange",
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getSteps = () => {
    return [
      {
        title: "Schaden beschreiben",
        component: (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-800">
                Was ist passiert? *
              </Label>
              <p className="text-xs text-gray-500 mb-1 mt-1">Beschreiben Sie den Schaden in 1–2 Sätzen.</p>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Beschreiben Sie den Schaden..."
                rows={4}
                className="mt-1 rounded-xl border-gray-200 focus:ring-[#EAB308] focus:border-[#EAB308]"
              />
              {form.formState.errors.description && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.description.message as string}
                </p>
              )}
            </div>

            {type === "kfz" && (
              <>
                <div>
                  <Label htmlFor="damageType">Schadenart</Label>
                  <Select
                    value={form.watch("damageType") || ""}
                    onValueChange={(value) => form.setValue("damageType", value as any)}
                  >
                    <SelectTrigger className="rounded-xl border-gray-200 focus:ring-[#EAB308]">
                      <SelectValue placeholder="Art wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unfall">Unfall</SelectItem>
                      <SelectItem value="parkrempler">Parkrempler</SelectItem>
                      <SelectItem value="wild">Wild</SelectItem>
                      <SelectItem value="hagel">Hagel</SelectItem>
                      <SelectItem value="glasbruch">Glasbruch</SelectItem>
                      <SelectItem value="vandalismus">Vandalismus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="fahrunfaehig"
                    checked={form.watch("fahrunfaehig") || false}
                    onCheckedChange={(checked) => form.setValue("fahrunfaehig", checked as boolean)}
                    className="h-5 w-5 accent-[#EAB308]"
                  />
                  <Label htmlFor="fahrunfaehig" className="cursor-pointer text-sm text-gray-700">
                    Fahrzeug fahrunfähig
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="werkstattbindung"
                    checked={form.watch("werkstattbindung") || false}
                    onCheckedChange={(checked) => form.setValue("werkstattbindung", checked as boolean)}
                    className="h-5 w-5 accent-[#EAB308]"
                  />
                  <Label htmlFor="werkstattbindung" className="cursor-pointer text-sm text-gray-700">
                    Werkstattbindung vorhanden
                  </Label>
                </div>
              </>
            )}

            {type === "wasser" && (
              <>
                <div>
                  <Label htmlFor="issueType">Art des Wasserschadens</Label>
                  <Select
                    value={form.watch("issueType") || ""}
                    onValueChange={(value) => form.setValue("issueType", value as any)}
                  >
                    <SelectTrigger className="rounded-xl border-gray-200 focus:ring-[#EAB308]">
                      <SelectValue placeholder="Art wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rohrbruch">Rohrbruch</SelectItem>
                      <SelectItem value="feuchtigkeit">Feuchtigkeit</SelectItem>
                      <SelectItem value="rueckstau">Rückstau</SelectItem>
                      <SelectItem value="ueberschwemmung">Überschwemmung</SelectItem>
                      <SelectItem value="unbekannt">Unbekannt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="austrittAktiv"
                    checked={form.watch("austrittAktiv") || false}
                    onCheckedChange={(checked) => {
                      form.setValue("austrittAktiv", checked as boolean)
                      if (checked) form.setValue("notfall", true)
                    }}
                    className="h-5 w-5 accent-[#EAB308]"
                  />
                  <Label htmlFor="austrittAktiv" className="cursor-pointer text-sm text-gray-700">
                    Austritt noch aktiv? Notfall?
                  </Label>
                </div>
                {form.watch("austrittAktiv") && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="flex-1 leading-relaxed">
                        <strong>Notfall:</strong> Schließen Sie den Hauptwasserhahn. Strom im betroffenen Bereich ausschalten. Bei Gefahr <strong>112</strong>.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {type === "sonstiges" && (
              <div>
                <Label htmlFor="freeText">Weitere Details *</Label>
                <Textarea
                  id="freeText"
                  {...form.register("freeText")}
                  placeholder="Beschreiben Sie den Schaden genauer..."
                  rows={4}
                  className="mt-1 rounded-xl border-gray-200 focus:ring-[#EAB308]"
                />
                {type === "sonstiges" && (form.formState.errors as any).freeText && (
                  <p className="mt-1 text-xs text-red-600">
                    {(form.formState.errors as any).freeText.message as string}
                  </p>
                )}
              </div>
            )}
          </div>
        ),
        validate: () => {
          const description = form.watch("description")
          const hasDescription = description && description.trim().length >= 5
          if (type === "sonstiges") {
            const freeText = form.watch("freeText")
            return hasDescription && freeText && freeText.trim().length >= 10
          }
          return hasDescription
        },
      },
      {
        title: "Details & Ort",
        component: (
          <div className="space-y-4">
            <div>
              <Label htmlFor="occurredAt" className="text-sm font-medium text-gray-800">
                Wann ist es passiert? *
              </Label>
              <Input
                id="occurredAt"
                type="datetime-local"
                value={form.watch("occurredAt") ? new Date(form.watch("occurredAt")!).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    const isoString = new Date(value).toISOString()
                    form.setValue("occurredAt", isoString)
                  } else {
                    form.setValue("occurredAt", "")
                  }
                }}
                className="mt-1 rounded-xl border-gray-200 focus:ring-[#EAB308]"
              />
              {form.formState.errors.occurredAt && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.occurredAt.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="plz" className="text-sm font-medium text-gray-800">
                PLZ *
              </Label>
              <Input
                id="plz"
                {...form.register("plz")}
                placeholder="12345"
                inputMode="numeric"
                pattern="\d{5}"
                maxLength={5}
                className="mt-1 rounded-xl border-gray-200 focus:ring-[#EAB308]"
              />
              {form.formState.errors.plz && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.plz.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="locationText" className="text-sm font-medium text-gray-800">
                Ort *
              </Label>
              <Input
                id="locationText"
                {...form.register("locationText")}
                placeholder="Stadt, Straße"
                className="mt-1 rounded-xl border-gray-200 focus:ring-[#EAB308]"
              />
              {form.formState.errors.locationText && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.locationText.message as string}
                </p>
              )}
            </div>

            {(type === "kfz" || type === "recht") && (
              <div>
                <Label className="text-sm font-medium text-gray-800 mb-2 block">
                  Wer war schuld? *
                </Label>
                <div className="space-y-2">
                  {["ich", "andere", "unklar"].map((guiltOption) => (
                    <div key={guiltOption} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`guilt-${guiltOption}`}
                        name="guilt"
                        value={guiltOption}
                        checked={form.watch("guilt") === guiltOption}
                        onChange={(e) => form.setValue("guilt", e.target.value as any)}
                        className="h-5 w-5 accent-[#EAB308]"
                      />
                      <Label htmlFor={`guilt-${guiltOption}`} className="cursor-pointer text-sm text-gray-700">
                        {guiltOption === "ich" && "Ich war schuld"}
                        {guiltOption === "andere" && "Andere waren schuld"}
                        {guiltOption === "unklar" && "Unklar"}
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.guilt && (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.guilt.message as string}
                  </p>
                )}
              </div>
            )}

            {type === "kfz" && form.watch("werkstattbindung") && (
              <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-[#EAB308] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1 leading-relaxed">
                    Bei Werkstattbindung wird die Partnerwahl in der Regel im Rahmen der Abwicklung abgestimmt. Wir unterstützen Sie bei der Vorbereitung.
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-gray-800 mb-2 block">
                Wunschabwicklung *
              </Label>
              <div className="mt-2 space-y-2">
                {getWishOptionsForType(type).map((option) => {
                  if (type === "glas" && option.value === "gutachter" && !form.watch("strittig")) {
                    return null
                  }
                  return (
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
                        className="h-5 w-5 accent-[#EAB308]"
                      />
                      <Label htmlFor={`wish-${option.value}`} className="cursor-pointer text-sm text-gray-700">
                        {option.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
              {form.formState.errors.wish && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.wish.message as string}
                </p>
              )}
            </div>

            {type !== "recht" && type !== "kfz" && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Checkbox
                  id="rechtsbeistand"
                  checked={form.watch("rechtsbeistand") || false}
                  onCheckedChange={(checked) => {
                    form.setValue("rechtsbeistand", checked as boolean)
                    if (checked && !form.watch("wish")?.includes("anwalt")) {
                      form.setValue("wish", [...(form.watch("wish") || []), "anwalt"])
                    }
                  }}
                  className="h-5 w-5 accent-[#EAB308]"
                />
                <Label htmlFor="rechtsbeistand" className="cursor-pointer text-sm text-gray-700">
                  Rechtsbeistand gewünscht?
                </Label>
              </div>
            )}
          </div>
        ),
        validate: () => {
          const occurredAt = form.watch("occurredAt")
          const plz = form.watch("plz")
          const locationText = form.watch("locationText")
          const wish = form.watch("wish")
          const needsGuilt = type === "kfz" || type === "recht"
          const guilt = form.watch("guilt")
          return (
            !!occurredAt &&
            !!plz &&
            plz.length === 5 &&
            !!locationText &&
            Array.isArray(wish) &&
            wish.length > 0 &&
            (!needsGuilt || !!guilt)
          )
        },
      },
      {
        title: "Kontakt & Abschluss",
        component: (
          <div className="space-y-4">
            <ContactFields form={form} />

            <div className="pt-4 border-t">
              <Label className="mb-2 block text-sm font-medium text-gray-800">
                Fotos (optional)
              </Label>
              <p className="mb-2 text-xs text-gray-500 leading-relaxed">
                Optional: 1 Übersicht + 2–3 Details (max. 10 Bilder). Unsere Partner begutachten bei Bedarf vor Ort.
              </p>
              <PhotoUploader
                value={form.watch("photos") || []}
                onChange={(urls) => {
                  form.setValue("photos", urls)
                  if (typeof window !== "undefined" && urls.length > 0) {
                    console.log(`📊 Analytics: photo_upload`, { count: urls.length, type })
                  }
                }}
              />
            </div>

            <div className="pt-4 border-t">
              <ConsentNote form={form} />
            </div>
          </div>
        ),
        validate: () => {
          const contact = form.watch("contact")
          const consents = form.watch("consents")
          return (
            !!contact?.name &&
            contact.name.trim().length > 0 &&
            !!contact?.email &&
            contact.email.includes("@") &&
            !!contact?.phone &&
            contact.phone.trim().length >= 6 &&
            !!contact?.preferredContactMethod &&
            consents?.partner === true
          )
        },
      },
    ]
  }

  const steps = getSteps()
  const totalSteps = steps.length

  const handleNext = async () => {
    const currentStepData = steps[currentStep]

    if (typeof window !== "undefined") {
      console.log(`📊 Analytics: step_change`, { stepIndex: currentStep, type })
    }

    if (!currentStepData.validate()) {
      toast({
        title: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      })

      let fieldsToValidate: string[] = []
      if (currentStep === 0) {
        fieldsToValidate = ["description"]
        if (type === "sonstiges") fieldsToValidate.push("freeText")
      } else if (currentStep === 1) {
        fieldsToValidate = ["occurredAt", "plz", "locationText", "wish"]
        const needsGuilt = type === "kfz" || type === "recht"
        if (needsGuilt) fieldsToValidate.push("guilt")
      } else if (currentStep === 2) {
        fieldsToValidate = ["contact.name", "contact.email", "contact.phone", "contact.preferredContactMethod", "consents.partner"]
      }

      await form.trigger(fieldsToValidate as any)

      const firstError = document.querySelector('[class*="text-red-600"]')
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const result = await form.trigger()
    if (!result) {
      toast({
        title: "Bitte korrigieren Sie alle Fehler",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const data = form.getValues()

    if (typeof window !== "undefined") {
      console.log(`📊 Analytics: submit`, {
        type,
        wish: data.wish,
        regionPrefix: data.plz ? data.plz.substring(0, 2) : "",
        hasWorkshopBinding: type === "kfz" && (data as any).werkstattbindung === true,
        onlyCallback: data.wish.includes("nur_rueckruf"),
      })
    }

    try {
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        const redirectPath = result.redirectUrl || `/v3/thanks?ticket=${result.ticketId}`
        router.push(redirectPath)
      } else {
        toast({
          title: "Fehler beim Absenden",
          description: result.error || "Bitte versuchen Sie es erneut",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Fehler beim Absenden",
        description: "Bitte versuchen Sie es erneut",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-10 sm:py-14">
        <Link
          href="/v3"
          className="mb-4 sm:mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Zurück
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              Schaden melden: {type.toUpperCase()}
            </h1>
            <Progress current={currentStep + 1} total={totalSteps} />
          </div>

          <div>
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              {steps[currentStep].title}
            </h2>
            {steps[currentStep].component}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="h-11 flex-1 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#EAB308] focus:outline-none transition-colors"
              aria-label="Zurück"
            >
              Zurück
            </button>
            <button
              type="button"
              onClick={currentStep === totalSteps - 1 ? handleSubmit : handleNext}
              disabled={isSubmitting}
              className="h-11 flex-1 rounded-xl bg-[#EAB308] text-sm font-medium text-white hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#EAB308] focus:outline-none transition-colors"
              aria-label={currentStep === totalSteps - 1 ? "Absenden" : "Weiter"}
            >
              {isSubmitting ? "Wird gesendet..." : currentStep === totalSteps - 1 ? "Absenden" : "Weiter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

