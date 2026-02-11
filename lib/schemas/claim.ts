import { z } from "zod"

// Schadentypen (ohne "rechtschutz" als Hauptkategorie - wird als separater Pfad oder Option behandelt)
export const claimTypeSchema = z.enum([
  "kfz",
  "glas",
  "wasser",
  "gebaeude",
  "sturm",
  "feuer",
  "recht", // Rechtsfall melden (separater Pfad)
  "sonstiges",
])

// Wunschabwicklung - typ-spezifisch
export const wishSchema = z.enum([
  "werkstatt",      // Nur KFZ
  "sanitaer",       // Wasser
  "trocknung",      // Wasser
  "dach",           // Gebäude/Sturm
  "glaser",         // Glas
  "brandsanierung", // Feuer
  "gutachter",
  "anwalt",
  "nur_rueckruf",
])

// Schuldfrage nur wo relevant
export const guiltSchema = z.enum(["ich", "andere", "unklar"])

export const statusSchema = z.enum([
  "eingegangen",
  "weitergeleitet",
  "in_bearbeitung",
  "abgeschlossen",
])

export const preferredContactMethodSchema = z.enum(["whatsapp", "telefon", "email"])

export const contactSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  email: z.string().trim().min(1, "E-Mail-Adresse ist erforderlich").email("Ungültige E-Mail-Adresse"),
  phone: z.string().regex(/^[\d\s\+\-\(\)]+$/, "Ungültige Telefonnummer").min(6, "Telefonnummer ist erforderlich"),
  preferredContactMethod: preferredContactMethodSchema,
})

// Einwilligungen
export const consentsSchema = z.object({
  partner: z.boolean().refine((val) => val === true, {
    message: "Einwilligung zur Weitergabe an Partner ist erforderlich",
    path: ["partner"],
  }),
  agent: z.boolean().optional(), // Optional: Vermittler darf einsehen
})

// Base-Schema ohne refine (für extend verwendbar)
const claimBaseSchemaRaw = z.object({
  type: claimTypeSchema,
  description: z.string().min(5, "Bitte beschreiben Sie den Schaden (mind. 5 Zeichen)").max(1000, "Beschreibung zu lang (max. 1000 Zeichen)"),
  occurredAt: z.string().min(1, "Datum und Uhrzeit sind erforderlich"),
  noticedAt: z.string().optional(), // "Bemerkt am"
  locationText: z.string().min(3, "Ort ist erforderlich"),
  plz: z.string().regex(/^\d{5}$/, "PLZ muss genau 5-stellig sein"),
  guilt: guiltSchema.optional(), // Nur bei relevanten Typen
  wish: z.array(wishSchema).min(1, "Bitte wählen Sie mindestens eine Option"),
  contact: contactSchema,
  photos: z.array(z.string().url()).max(10).optional(), // Optional, max 10
  consents: consentsSchema,
  rechtsbeistand: z.boolean().optional(), // Option "Rechtsbeistand gewünscht?"
})

// Base-Schema mit refine (für Validierung)
export const claimBaseSchema = claimBaseSchemaRaw.refine((data) => {
  // Datum nicht in Zukunft
  if (data.occurredAt) {
    const date = new Date(data.occurredAt)
    const now = new Date()
    return date <= now
  }
  return true
}, {
  message: "Das Schadensdatum darf nicht in der Zukunft liegen",
  path: ["occurredAt"],
})

// KFZ-spezifische Felder
export const kfzClaimSchema = claimBaseSchemaRaw.extend({
  type: z.literal("kfz"),
  damageType: z.enum(["unfall", "parkrempler", "wild", "hagel", "glasbruch", "vandalismus"]).optional(),
  vehiclePlate: z.string().optional(),
  fahrunfaehig: z.boolean().optional(),
  werkstattbindung: z.boolean().optional(),
}).refine((data) => {
  // Datum nicht in Zukunft
  if (data.occurredAt) {
    const date = new Date(data.occurredAt)
    const now = new Date()
    return date <= now
  }
  return true
}, {
  message: "Das Schadensdatum darf nicht in der Zukunft liegen",
  path: ["occurredAt"],
})

// Glas-spezifische Felder
export const glasClaimSchema = claimBaseSchemaRaw.extend({
  type: z.literal("glas"),
  glassType: z.enum(["front", "seite", "heck", "fenster", "tuer", "dusche"]).optional(),
  glassArea: z.enum(["kfz", "haus"]).optional(), // KFZ oder Haus
  size: z.string().optional(),
  strittig: z.boolean().optional(), // Nur bei Haftpflicht relevant für Schuldfrage
}).refine((data) => {
  // Datum nicht in Zukunft
  if (data.occurredAt) {
    const date = new Date(data.occurredAt)
    const now = new Date()
    return date <= now
  }
  return true
}, {
  message: "Das Schadensdatum darf nicht in der Zukunft liegen",
  path: ["occurredAt"],
})

// Wasser-spezifische Felder
export const wasserClaimSchema = claimBaseSchemaRaw.extend({
  type: z.literal("wasser"),
  issueType: z.enum(["rohrbruch", "feuchtigkeit", "rueckstau", "ueberschwemmung", "unbekannt"]).optional(),
  austrittAktiv: z.boolean().optional(), // Notfall?
  notfall: z.boolean().optional(),
  ortImGebaeude: z.string().optional(),
}).refine((data) => {
  // Datum nicht in Zukunft
  if (data.occurredAt) {
    const date = new Date(data.occurredAt)
    const now = new Date()
    if (date > now) return false
  }
  // Schuldfrage nicht bei Wasserschäden
  return !data.guilt
}, (data) => {
  if (data.occurredAt && new Date(data.occurredAt) > new Date()) {
    return {
      message: "Das Schadensdatum darf nicht in der Zukunft liegen",
      path: ["occurredAt"],
    }
  }
  return {
    message: "Schuldfrage ist bei Wasserschäden nicht relevant",
    path: ["guilt"],
  }
})

// Gebäude-spezifische Felder
export const gebaeudeClaimSchema = claimBaseSchemaRaw.extend({
  type: z.literal("gebaeude"),
  buildingPart: z.enum(["dach", "fassade", "keller", "fliesen", "malerarbeiten", "fenster"]).optional(),
  damageType: z.enum(["sturm", "hagel", "alterung", "unklar"]).optional(),
  dachOffen: z.boolean().optional(), // Eilbedürftigkeit
  fremdverschulden: z.boolean().optional(), // Nur dann Schuldfrage
}).refine((data) => {
  // Datum nicht in Zukunft
  if (data.occurredAt) {
    const date = new Date(data.occurredAt)
    const now = new Date()
    if (date > now) return false
  }
  // Nur bei Fremdverschulden Schuldfrage
  if (data.guilt && !data.fremdverschulden) {
    return false
  }
  return true
}, (data) => {
  if (data.occurredAt && new Date(data.occurredAt) > new Date()) {
    return {
      message: "Das Schadensdatum darf nicht in der Zukunft liegen",
      path: ["occurredAt"],
    }
  }
  return {
    message: "Schuldfrage ist nur bei Fremdverschulden relevant",
    path: ["guilt"],
  }
})

// Sturm/Elementar-spezifische Felder
export const sturmClaimSchema = claimBaseSchemaRaw.extend({
  type: z.literal("sturm"),
  stormType: z.enum(["hagel", "sturm", "gewitter"]).optional(),
  stormStrength: z.string().optional(),
}).refine((data) => {
  // Datum nicht in Zukunft
  if (data.occurredAt) {
    const date = new Date(data.occurredAt)
    const now = new Date()
    if (date > now) return false
  }
  // Schuldfrage nicht bei Elementarschäden
  return !data.guilt
}, (data) => {
  if (data.occurredAt && new Date(data.occurredAt) > new Date()) {
    return {
      message: "Das Schadensdatum darf nicht in der Zukunft liegen",
      path: ["occurredAt"],
    }
  }
  return {
    message: "Schuldfrage ist bei Elementarschäden nicht relevant",
    path: ["guilt"],
  }
})

// Feuer-spezifische Felder
export const feuerClaimSchema = claimBaseSchemaRaw.extend({
  type: z.literal("feuer"),
  fireType: z.enum(["brand", "rauch", "elektro", "kamin"]).optional(),
  betroffenerBereich: z.string().optional(), // Küche, Elektro, Kamin
  fireDepartment: z.boolean().optional(),
}).refine((data) => {
  // Datum nicht in Zukunft
  if (data.occurredAt) {
    const date = new Date(data.occurredAt)
    const now = new Date()
    if (date > now) return false
  }
  // Schuldfrage nicht bei Feuerschäden
  return !data.guilt
}, (data) => {
  if (data.occurredAt && new Date(data.occurredAt) > new Date()) {
    return {
      message: "Das Schadensdatum darf nicht in der Zukunft liegen",
      path: ["occurredAt"],
    }
  }
  return {
    message: "Schuldfrage ist bei Feuerschäden nicht relevant",
    path: ["guilt"],
  }
})

// Rechtsfall-spezifische Felder
export const rechtClaimSchema = claimBaseSchemaRaw.extend({
  type: z.literal("recht"),
  legalIssue: z.enum(["schadenersatz", "regress", "auseinandersetzung"]).optional(),
  gegenseite: z.object({
    name: z.string().optional(),
    versicherung: z.string().optional(),
  }).optional(),
}).refine((data) => {
  // Datum nicht in Zukunft
  if (data.occurredAt) {
    const date = new Date(data.occurredAt)
    const now = new Date()
    return date <= now
  }
  return true
}, {
  message: "Das Schadensdatum darf nicht in der Zukunft liegen",
  path: ["occurredAt"],
})

// Sonstiges
export const sonstigesClaimSchema = claimBaseSchemaRaw.extend({
  type: z.literal("sonstiges"),
  category: z.string().optional(),
  freeText: z.string().min(10, "Bitte beschreiben Sie den Schaden genauer"),
}).refine((data) => {
  // Datum nicht in Zukunft
  if (data.occurredAt) {
    const date = new Date(data.occurredAt)
    const now = new Date()
    return date <= now
  }
  return true
}, {
  message: "Das Schadensdatum darf nicht in der Zukunft liegen",
  path: ["occurredAt"],
})

export type ClaimType = z.infer<typeof claimTypeSchema>
export type WishType = z.infer<typeof wishSchema>
export type ClaimInput = z.infer<typeof claimBaseSchema> &
  (
    | z.infer<typeof kfzClaimSchema>
    | z.infer<typeof glasClaimSchema>
    | z.infer<typeof wasserClaimSchema>
    | z.infer<typeof gebaeudeClaimSchema>
    | z.infer<typeof sturmClaimSchema>
    | z.infer<typeof feuerClaimSchema>
    | z.infer<typeof rechtClaimSchema>
    | z.infer<typeof sonstigesClaimSchema>
  )

// Union aller Claim-Schemas (ohne discriminatedUnion, da refine verwendet wird)
export const claimSchema = z.union([
  kfzClaimSchema,
  glasClaimSchema,
  wasserClaimSchema,
  gebaeudeClaimSchema,
  sturmClaimSchema,
  feuerClaimSchema,
  rechtClaimSchema,
  sonstigesClaimSchema,
])
