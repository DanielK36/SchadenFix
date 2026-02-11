"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
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
import { Wizard } from "@/components/Wizard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PhotoUploader } from "@/components/PhotoUploader"
import { ContactFields } from "@/components/ContactFields"
import { ConsentNote } from "@/components/ConsentNote"
import { WishOptions } from "./wish-options"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { persistRefFromUrl, getRefForClaim, clearRefAfterSubmit } from "@/lib/referral-storage"

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

export default function MeldenPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const type = params.type as string
  
  // Referral-Code aus URL in sessionStorage speichern, damit er beim Navigieren nicht verloren geht
  const refFromUrl = searchParams.get("ref")
  useEffect(() => {
    persistRefFromUrl(refFromUrl)
  }, [refFromUrl])

  // Initialize hooks before any early returns
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Validate type first
  const isValidType = claimTypeSchema.safeParse(type).success
  const schema = isValidType ? claimSchemas[type as keyof typeof claimSchemas] : null
  
  // Initialize form with conditional schema
  const form = useForm<ClaimInput>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      type: type as any,
      description: "",
      occurredAt: new Date(Date.now() - 60000).toISOString(), // 1 Minute in der Vergangenheit, um Validierung zu erfüllen
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
    mode: "onChange", // Validierung bei Änderungen
  })
  
  // Early returns after all hooks
  if (!isValidType) {
    router.push("/")
    return null
  }

  if (!schema) {
    console.error(`No schema found for type: ${type}`)
    router.push("/")
    return null
  }

  // 3 Schritte statt 6
  const getSteps = () => {
    return [
      {
        title: "Schaden beschreiben",
        component: (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="description" className="text-sm sm:text-base">Was ist passiert? *</Label>
              <p className="text-xs text-muted-foreground mb-2">Beschreiben Sie den Schaden in 1–2 Sätzen.</p>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Bitte beschreiben Sie den Schaden..."
                rows={3}
                className="text-sm sm:text-base"
              />
              {form.formState.errors.description && (
                <p className="text-xs sm:text-sm text-destructive mt-1">
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
                    <SelectTrigger>
                      <SelectValue placeholder="Schadenart wählen" />
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
                  />
                  <Label htmlFor="fahrunfaehig" className="cursor-pointer text-sm">
                    Fahrzeug ist nicht fahrfähig
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="werkstattbindung"
                    checked={form.watch("werkstattbindung") || false}
                    onCheckedChange={(checked) => form.setValue("werkstattbindung", checked as boolean)}
                  />
                  <Label htmlFor="werkstattbindung" className="cursor-pointer text-sm">
                    Mein Vertrag enthält eine Werkstattbindung
                  </Label>
                </div>
              </>
            )}

            {type === "gebaeude" && (
              <>
                <div>
                  <Label htmlFor="buildingPart">Bauteil</Label>
                  <Select
                    value={form.watch("buildingPart") || ""}
                    onValueChange={(value) => form.setValue("buildingPart", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bauteil wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dach">Dach</SelectItem>
                      <SelectItem value="fassade">Fassade</SelectItem>
                      <SelectItem value="keller">Keller</SelectItem>
                      <SelectItem value="fliesen">Fliesen</SelectItem>
                      <SelectItem value="malerarbeiten">Malerarbeiten</SelectItem>
                      <SelectItem value="fenster">Fenster</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="damageType">Schadenursache</Label>
                  <Select
                    value={form.watch("damageType") || ""}
                    onValueChange={(value) => form.setValue("damageType", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ursache wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sturm">Sturm</SelectItem>
                      <SelectItem value="hagel">Hagel</SelectItem>
                      <SelectItem value="alterung">Alterung</SelectItem>
                      <SelectItem value="unklar">Unklar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.watch("buildingPart") === "dach" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="dachOffen"
                      checked={form.watch("dachOffen") || false}
                      onCheckedChange={(checked) => form.setValue("dachOffen", checked as boolean)}
                    />
                    <Label htmlFor="dachOffen" className="cursor-pointer text-sm">
                      Dach abgedeckt/offen? (Eilbedürftigkeit)
                    </Label>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="fremdverschulden"
                    checked={form.watch("fremdverschulden") || false}
                    onCheckedChange={(checked) => form.setValue("fremdverschulden", checked as boolean)}
                  />
                  <Label htmlFor="fremdverschulden" className="cursor-pointer text-sm">
                    Fremdverschulden möglich
                  </Label>
                </div>
              </>
            )}

            {type === "glas" && (
              <>
                <div>
                  <Label htmlFor="glassArea">Bereich</Label>
                  <Select
                    value={form.watch("glassArea") || ""}
                    onValueChange={(value) => form.setValue("glassArea", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bereich wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kfz">KFZ</SelectItem>
                      <SelectItem value="haus">Haus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="glassType">Glasart</Label>
                  <Select
                    value={form.watch("glassType") || ""}
                    onValueChange={(value) => form.setValue("glassType", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Glasart wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {form.watch("glassArea") === "kfz" ? (
                        <>
                          <SelectItem value="front">Frontscheibe</SelectItem>
                          <SelectItem value="seite">Seitenscheibe</SelectItem>
                          <SelectItem value="heck">Heckscheibe</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="fenster">Fenster</SelectItem>
                          <SelectItem value="tuer">Glastür</SelectItem>
                          <SelectItem value="dusche">Dusche</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">Größe/Riss (optional)</Label>
                  <Input
                    id="size"
                    {...form.register("size")}
                    placeholder="z.B. 30cm Riss"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="strittig"
                    checked={form.watch("strittig") || false}
                    onCheckedChange={(checked) => form.setValue("strittig", checked as boolean)}
                  />
                  <Label htmlFor="strittig" className="cursor-pointer text-sm">
                    Strittiger Fall (Haftpflicht relevant)
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
                    <SelectTrigger>
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
                  />
                  <Label htmlFor="austrittAktiv" className="cursor-pointer text-sm">
                    Austritt noch aktiv? Notfall?
                  </Label>
                </div>
                {form.watch("austrittAktiv") && (
                  <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertDescription className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Notfall:</strong> Schließen Sie bitte den Hauptwasserhahn. Strom im betroffenen Bereich ausschalten. Bei Gefahr <strong>112</strong>.
                    </AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label htmlFor="ortImGebaeude">Ort im Gebäude (optional)</Label>
                  <Input
                    id="ortImGebaeude"
                    {...form.register("ortImGebaeude")}
                    placeholder="z.B. Küche, Bad, Keller"
                  />
                </div>
              </>
            )}

            {type === "feuer" && (
              <>
                <div>
                  <Label htmlFor="fireType">Art des Feuerschadens</Label>
                  <Select
                    value={form.watch("fireType") || ""}
                    onValueChange={(value) => form.setValue("fireType", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Art wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand">Brand</SelectItem>
                      <SelectItem value="rauch">Rauchschaden</SelectItem>
                      <SelectItem value="elektro">Elektro</SelectItem>
                      <SelectItem value="kamin">Kamin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="betroffenerBereich">Betroffener Bereich (optional)</Label>
                  <Input
                    id="betroffenerBereich"
                    {...form.register("betroffenerBereich")}
                    placeholder="z.B. Küche, Elektro, Kamin"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="fireDepartment"
                    checked={form.watch("fireDepartment") || false}
                    onCheckedChange={(checked) => form.setValue("fireDepartment", checked as boolean)}
                  />
                  <Label htmlFor="fireDepartment" className="cursor-pointer text-sm">Feuerwehr im Einsatz</Label>
                </div>
              </>
            )}

            {type === "sturm" && (
              <>
                <div>
                  <Label htmlFor="stormType">Art des Sturmschadens</Label>
                  <Select
                    value={form.watch("stormType") || ""}
                    onValueChange={(value) => form.setValue("stormType", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Art wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hagel">Hagel</SelectItem>
                      <SelectItem value="sturm">Sturm</SelectItem>
                      <SelectItem value="gewitter">Gewitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stormStrength">Sturmstärke (optional)</Label>
                  <Input
                    id="stormStrength"
                    {...form.register("stormStrength")}
                    placeholder="z.B. Windböen bis 120 km/h"
                  />
                </div>
              </>
            )}

            {type === "recht" && (
              <>
                <div>
                  <Label htmlFor="legalIssue">Worum geht&apos;s?</Label>
                  <Select
                    value={form.watch("legalIssue") || ""}
                    onValueChange={(value) => form.setValue("legalIssue", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Anliegen wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schadenersatz">Schadenersatz</SelectItem>
                      <SelectItem value="regress">Regress</SelectItem>
                      <SelectItem value="auseinandersetzung">Auseinandersetzung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="gegenseiteKnown"
                    checked={form.watch("gegenseite")?.name ? true : false}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        form.setValue("gegenseite", { name: "", versicherung: "" })
                      }
                    }}
                  />
                  <Label htmlFor="gegenseiteKnown" className="cursor-pointer text-sm">
                    Gegenseite bekannt
                  </Label>
                </div>
                {form.watch("gegenseite")?.name && (
                  <>
                    <div>
                      <Label htmlFor="gegenseiteName">Name der Gegenseite (optional)</Label>
                      <Input
                        id="gegenseiteName"
                        {...form.register("gegenseite.name")}
                        placeholder="Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gegenseiteVersicherung">Versicherung (optional)</Label>
                      <Input
                        id="gegenseiteVersicherung"
                        {...form.register("gegenseite.versicherung")}
                        placeholder="Versicherungsgesellschaft"
                      />
                    </div>
                  </>
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
                />
                {type === "sonstiges" && (form.formState.errors as any).freeText && (
                  <p className="text-xs sm:text-sm text-destructive mt-1">
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
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="occurredAt">Wann ist es passiert? *</Label>
                <Input
                  id="occurredAt"
                  type="datetime-local"
                  value={form.watch("occurredAt") ? new Date(form.watch("occurredAt")).toISOString().slice(0, 16) : ""}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value) {
                      const isoString = new Date(value).toISOString()
                      form.setValue("occurredAt", isoString)
                    } else {
                      form.setValue("occurredAt", "")
                    }
                  }}
                />
                {form.formState.errors.occurredAt && (
                  <p className="text-xs sm:text-sm text-destructive mt-1">
                    {form.formState.errors.occurredAt.message as string}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="noticedAt">Bemerkt am (optional)</Label>
                <Input
                  id="noticedAt"
                  type="datetime-local"
                  value={form.watch("noticedAt") ? new Date(form.watch("noticedAt")!).toISOString().slice(0, 16) : ""}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value) {
                      const isoString = new Date(value).toISOString()
                      form.setValue("noticedAt", isoString)
                    } else {
                      form.setValue("noticedAt", undefined)
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="plz">PLZ *</Label>
                <Input
                  id="plz"
                  {...form.register("plz")}
                  placeholder="12345"
                  maxLength={5}
                />
                {form.formState.errors.plz && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.plz.message as string}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="locationText">Ort/Adresse *</Label>
                <p className="text-xs text-muted-foreground mb-2">Wo ist der Schaden entstanden oder sichtbar?</p>
                <Input
                  id="locationText"
                  {...form.register("locationText")}
                  placeholder="Musterstraße 1, Musterstadt"
                />
                {form.formState.errors.locationText && (
                  <p className="text-xs sm:text-sm text-destructive mt-1">
                    {form.formState.errors.locationText.message as string}
                  </p>
                )}
              </div>
              {type === "kfz" && (
                <div>
                  <Label htmlFor="vehiclePlate">Fahrzeugkennzeichen (optional)</Label>
                  <Input
                    id="vehiclePlate"
                    {...form.register("vehiclePlate")}
                    placeholder="B-AB 1234"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 sm:pt-4 border-t space-y-3 sm:space-y-4">
              {/* Schuldfrage nur bei relevanten Typen */}
              {(type === "kfz" || type === "recht" || (type === "glas" && form.watch("strittig")) || (type === "gebaeude" && form.watch("fremdverschulden"))) && (
                <div>
                  <Label>Wer war schuld? *</Label>
                  <div className="mt-2 space-y-2">
                    {(["ich", "andere", "unklar"] as const).map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <Checkbox
                          id={`guilt-${option}`}
                          checked={form.watch("guilt") === option}
                          onCheckedChange={() => form.setValue("guilt", option)}
                        />
                        <Label htmlFor={`guilt-${option}`} className="cursor-pointer text-sm">
                          {option === "ich" && "Ich war schuld"}
                          {option === "andere" && "Andere Person war schuld"}
                          {option === "unklar" && "Unklar"}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.guilt && (
                    <p className="text-xs sm:text-sm text-destructive mt-1">
                      {form.formState.errors.guilt.message as string}
                    </p>
                  )}
                </div>
              )}
              
              {/* Wunschabwicklung mit typ-spezifischen Optionen */}
              <WishOptions form={form} type={type} />
              
              {/* Werkstattbindung-Hinweis bei KFZ - unter den Auswahlfeldern */}
              {type === "kfz" && form.watch("werkstattbindung") && (
                <div className="mt-2 rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                  Bei Werkstattbindung wird die Partnerwahl in der Regel im Rahmen der Abwicklung abgestimmt. Wir unterstützen Sie bei der Vorbereitung.
                </div>
              )}
              
              {/* Rechtsbeistand-Option in relevanten Flows */}
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
                  />
                  <Label htmlFor="rechtsbeistand" className="cursor-pointer text-sm">
                    Rechtsbeistand gewünscht?
                  </Label>
                </div>
              )}
            </div>
          </div>
        ),
        validate: () => {
          const occurredAt = form.watch("occurredAt")
          const plz = form.watch("plz")
          const locationText = form.watch("locationText")
          const wish = form.watch("wish")
          const needsGuilt = type === "kfz" || type === "recht" || (type === "glas" && form.watch("strittig")) || (type === "gebaeude" && form.watch("fremdverschulden"))
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
          <div className="space-y-4 sm:space-y-6">
            <ContactFields form={form} />
            
            <div className="pt-3 sm:pt-4 border-t">
              <Label className="mb-2 sm:mb-3 block text-sm sm:text-base">Fotos (optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Optional: 1 Übersicht + 2–3 Details (max. 10 Bilder). Unsere Partner begutachten bei Bedarf vor Ort.
              </p>
              <PhotoUploader
                value={form.watch("photos") || []}
                onChange={(urls) => {
                  form.setValue("photos", urls)
                  // Analytics: Photo upload
                  if (typeof window !== "undefined" && urls.length > 0) {
                    console.log(`📊 Analytics: photo_upload`, { count: urls.length, type })
                  }
                }}
              />
            </div>

            <div className="pt-3 sm:pt-4 border-t">
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
            contact.phone.trim().length > 0 &&
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
    
    // Analytics: Step change
    if (typeof window !== "undefined") {
      console.log(`📊 Analytics: step_change`, { stepIndex: currentStep, type })
    }
    
    // Validate current step
    if (!currentStepData.validate()) {
      toast({
        title: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      })
      
      // Trigger validation to show errors
      let fieldsToValidate: string[] = []
      if (currentStep === 0) {
        fieldsToValidate = ["description"]
        if (type === "sonstiges") fieldsToValidate.push("freeText")
      } else if (currentStep === 1) {
        fieldsToValidate = ["occurredAt", "plz", "locationText", "wish"]
        const needsGuilt = type === "kfz" || type === "recht" || (type === "glas" && form.watch("strittig")) || (type === "gebaeude" && form.watch("fremdverschulden"))
        if (needsGuilt) fieldsToValidate.push("guilt")
      } else if (currentStep === 2) {
        fieldsToValidate = ["contact.name", "contact.email", "contact.phone", "contact.preferredContactMethod", "consents.partner"]
      }
      
      await form.trigger(fieldsToValidate as any)
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
    
    // Trim E-Mail-Adresse (falls Whitespace vorhanden)
    if (data.contact?.email) {
      data.contact.email = data.contact.email.trim()
    }
    
    // Analytics: Submit
    const regionPrefix = data.plz ? data.plz.substring(0, 2) : ""
    const hasWorkshopBinding = type === "kfz" && (data as any).werkstattbindung === true
    const onlyCallback = data.wish.includes("nur_rueckruf")
    
    if (typeof window !== "undefined") {
      console.log(`📊 Analytics: submit`, {
        type,
        wish: data.wish,
        regionPrefix,
        hasWorkshopBinding,
        onlyCallback,
      })
    }
    
    try {
      // Referral-Code: zuerst aus URL, sonst aus sessionStorage (falls beim Navigieren verloren)
      const refCode = getRefForClaim(searchParams.get("ref"))
      const apiUrl = refCode ? `/api/claim?ref=${encodeURIComponent(refCode)}` : "/api/claim"
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        clearRefAfterSubmit()
        // Verwende redirectUrl von API, falls vorhanden, sonst Standard
        const redirectPath = result.redirectUrl || `/danke?ticket=${result.ticketId}`
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
    <div className="min-h-screen bg-background">
      <div className="w-full mx-auto px-4 md:px-12 lg:px-16 xl:px-24 py-6 md:py-10">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 text-primary hover:underline text-sm sm:text-base">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Zurück
          </Link>
          <ThemeToggle />
        </div>

        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6 md:p-8">
            <CardTitle className="text-lg sm:text-xl md:text-3xl lg:text-4xl">
              Schaden melden: {type.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <Wizard
              steps={totalSteps}
              currentStep={currentStep}
              onNext={currentStep === totalSteps - 1 ? handleSubmit : handleNext}
              onBack={handleBack}
              canProceed={!isSubmitting}
              isLastStep={currentStep === totalSteps - 1}
              lastStepLabel="Fertig"
              isSubmitting={isSubmitting}
            >
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">{steps[currentStep].title}</h3>
                {steps[currentStep].component}
              </div>
            </Wizard>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
