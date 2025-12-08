import partnersData from "@/data/partners.json"
import { ClaimInput, WishType } from "@/lib/schemas/claim"

export interface Partner {
  name: string
  email: string
  whatsapp?: string
  regions: string[]
}

interface PartnersData {
  [key: string]: Partner[]
}

const partners = partnersData as PartnersData

export interface RoutingResult {
  partners: Partner[]
  internalOnly: boolean
}

export function routePartnerFromPayload(payload: ClaimInput): RoutingResult {
  // Wenn "Nur Rückruf" gewählt, keine Partner-Weiterleitung
  if (payload.wish.includes("nur_rueckruf")) {
    return {
      partners: [],
      internalOnly: true,
    }
  }

  // Keine Partner-Weiterleitung ohne Einwilligung
  if (!payload.consents.partner) {
    return {
      partners: [],
      internalOnly: true,
    }
  }

  const region = payload.plz ? payload.plz.substring(0, 2) : ""
  const matchedPartners: Partner[] = []

  // Hilfsfunktion: Partner nach Region finden
  const addPartner = (key: string) => {
    const list = partners[key] || []
    const match = list.find((p) => p.regions?.includes(region)) || list[0]
    if (match && !matchedPartners.find((p) => p.email === match.email)) {
      matchedPartners.push({ ...match })
    }
  }

  // Typ-spezifisches Routing gemäß Matrix
  switch (payload.type) {
    case "glas":
      // Glas → Glaser (wenn gewünscht, Standard)
      if (payload.wish.includes("glaser")) {
        addPartner("glaser")
      }
      // Gutachter nur wenn strittig
      if (payload.wish.includes("gutachter") && "strittig" in payload && payload.strittig) {
        addPartner("gutachter")
      }
      break

    case "wasser":
      // Wasser → Sanitärbetrieb (wenn gewünscht)
      if (payload.wish.includes("sanitaer")) {
        addPartner("sanitaer")
      }
      // Trocknung bei Feuchtigkeit/Überschwemmung oder wenn gewünscht
      if (payload.wish.includes("trocknung") || 
          ("issueType" in payload && (payload.issueType === "feuchtigkeit" || payload.issueType === "ueberschwemmung"))) {
        addPartner("trocknung")
      }
      if (payload.wish.includes("gutachter")) {
        addPartner("gutachter")
      }
      break

    case "gebaeude":
    case "sturm":
      // Gebäude/Sturm → Dachdecker/Handwerker
      if (payload.wish.includes("dach")) {
        addPartner("dach")
      }
      if (payload.wish.includes("gutachter")) {
        addPartner("gutachter")
      }
      break

    case "kfz":
      // KFZ → Werkstatt (wenn gewünscht)
      if (payload.wish.includes("werkstatt")) {
        addPartner("werkstatt")
      }
      // Bei fahrunfähig zusätzlich Abschlepp-Hinweis (könnte später erweitert werden)
      if ("fahrunfaehig" in payload && payload.fahrunfaehig) {
        // Abschlepp-Service könnte hier geroutet werden
      }
      if (payload.wish.includes("gutachter")) {
        addPartner("gutachter")
      }
      break

    case "feuer":
      // Feuer → Brandsanierung/Handwerker
      if (payload.wish.includes("brandsanierung")) {
        addPartner("brandsanierung")
      }
      if (payload.wish.includes("gutachter")) {
        addPartner("gutachter")
      }
      break

    case "recht":
      // Rechtsfall → Anwalt
      if (payload.wish.includes("anwalt")) {
        addPartner("anwalt")
      }
      break

    case "sonstiges":
      // Inferiere aus Wunsch-Optionen
      payload.wish.forEach((w) => {
        if (w === "werkstatt") addPartner("werkstatt")
        if (w === "sanitaer") addPartner("sanitaer")
        if (w === "trocknung") addPartner("trocknung")
        if (w === "dach") addPartner("dach")
        if (w === "glaser") addPartner("glaser")
        if (w === "brandsanierung") addPartner("brandsanierung")
        if (w === "gutachter") addPartner("gutachter")
        if (w === "anwalt") addPartner("anwalt")
      })
      break
  }

  // Rechtsbeistand als zusätzliche Option - nur bei Einwilligung
  if ((payload.rechtsbeistand || payload.wish.includes("anwalt")) && payload.consents.partner) {
    addPartner("anwalt")
  }

  // Fallback: Wenn keine Partner gefunden, interne Inbox
  if (matchedPartners.length === 0) {
    console.log(
      `⚠️ Keine Partner gefunden für ${payload.type} (PLZ ${payload.plz}), verwende interne Inbox`
    )
    return {
      partners: [],
      internalOnly: true,
    }
  }

  console.log(
    `✅ Partner geroutet für ${payload.type} (PLZ ${payload.plz}):`,
    matchedPartners.map((p) => p.name).join(", ")
  )

  return {
    partners: matchedPartners,
    internalOnly: false,
  }
}
