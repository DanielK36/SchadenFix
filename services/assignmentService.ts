import { supabaseServer } from "@/lib/supabase-server"
import type { Order } from "@/services/orderService"

export type AssignmentMode = "auto" | "bulk" | "broadcast"

/**
 * Orders are categorized by "damage type" (wasser/feuer/...) but partners/routing rules
 * use "craft" professions (trocknung/maler/...). This maps order types to a primary craft.
 */
export function mapOrderTypeToProfession(orderType: Order["type"]): string {
  switch (orderType) {
    case "wasser":
      return "trocknung"
    case "feuer":
      return "maler"
    case "gebaeude":
      return "gutachter"
    case "kfz":
      return "kfz"
    case "glas":
      return "glas"
    case "rechtsfall":
      return "rechtsfall"
    default:
      return String(orderType)
  }
}

export interface AssignmentSettingsRow {
  id: string
  profession: string
  zip_prefix: string | null
  mode: "manual" | "auto" | "broadcast"
  broadcast_partner_count: number
  fallback_behavior: "internal_only" | "manual"
  active: boolean
}

export interface PartnerRow {
  id: string
  company_name: string
  email: string | null
  profession: string | null
  zip_codes: string[] | null
  rating: number
  is_verified: boolean
}

export interface RoutingRuleRow {
  id: string
  zip_prefix: string
  profession: string
  preferred_partner_id: string | null
  priority: number
  active: boolean
}

export async function getAssignmentSettings(params: {
  profession: string
  zipPrefix2?: string | null
}): Promise<AssignmentSettingsRow | null> {
  // Prefer zip-specific over global
  if (params.zipPrefix2) {
    const { data: specific, error: specificError } = await supabaseServer
      .from("assignment_settings")
      .select("*")
      .eq("profession", params.profession)
      .eq("zip_prefix", params.zipPrefix2)
      .eq("active", true)
      .limit(1)
    
    if (specificError) {
      console.warn(`⚠️ Fehler bei zip-spezifischer Assignment Settings Abfrage:`, specificError)
    } else if (specific && specific.length > 0) {
      console.log(`✅ Zip-spezifische Assignment Settings gefunden:`, { profession: params.profession, zip_prefix: params.zipPrefix2, mode: specific[0].mode })
      return specific[0] as any
    }
  }

  // Fallback: Global settings (zip_prefix IS NULL)
  const { data: global, error: globalError } = await supabaseServer
    .from("assignment_settings")
    .select("*")
    .eq("profession", params.profession)
    .is("zip_prefix", null)
    .eq("active", true)
    .limit(1)
  
  if (globalError) {
    console.warn(`⚠️ Fehler bei globaler Assignment Settings Abfrage:`, globalError)
  } else if (global && global.length > 0) {
    console.log(`✅ Globale Assignment Settings gefunden:`, { profession: params.profession, mode: global[0].mode })
    return global[0] as any
  }
  
  console.warn(`⚠️ Keine Assignment Settings gefunden für Profession: ${params.profession}, ZIP-Prefix: ${params.zipPrefix2 || "global"}`)
  return null
}

export async function findMatchingPartners(params: {
  profession: string
  zip?: string | null
  limit: number
}): Promise<PartnerRow[]> {
  const zipPrefix2 = params.zip ? params.zip.slice(0, 2) : null
  const results: PartnerRow[] = []

  // 1) routing_rules: if there's an active preferred assignee for zip_prefix+profession, pick it first
  if (zipPrefix2) {
    const { data: rules } = await supabaseServer
      .from("routing_rules")
      .select("*")
      .eq("active", true)
      .eq("profession", params.profession)
      .eq("zip_prefix", zipPrefix2)
      .order("priority", { ascending: true })
      .limit(5)

    if (rules && rules.length > 0) {
      const preferredHandwerkerIds: string[] = []

      for (const rule of rules) {
        if (rule.preferred_assignee_id && rule.assignee_type === "handwerker") {
          preferredHandwerkerIds.push(rule.preferred_assignee_id)
        }
      }

      // Lade bevorzugte Handwerker
      if (preferredHandwerkerIds.length > 0) {
        const { data: preferredHandwerker } = await supabaseServer
          .from("profiles")
          .select("id, company_name, role, professions")
          .in("id", preferredHandwerkerIds)
          .in("role", ["chef", "azubi"])

        if (preferredHandwerker) {
          // Filtere Handwerker nach Gewerk: prüfe ob professions Array das benötigte Gewerk enthält
          const filtered = preferredHandwerker.filter((h: any) => {
            const professions = Array.isArray(h.professions) ? h.professions : []
            return professions.includes(params.profession)
          })

          const sorted = [...filtered].sort(
            (a, b) => preferredHandwerkerIds.indexOf(a.id) - preferredHandwerkerIds.indexOf(b.id)
          )
          // Transformiere Handwerker zu PartnerRow-Format
          const handwerkerRows = sorted.map((h: any) => ({
            id: h.id,
            company_name: h.company_name || "—",
            email: null,
            profession: params.profession, // Profession kommt aus Routing Rule
            zip_codes: null,
            rating: 4.5, // Default rating
            is_verified: true,
          }))
          results.push(...handwerkerRows)
        }
      }

      if (results.length > 0) {
        return results.slice(0, params.limit)
      }
    }
  }

  // 2) fallback: Handwerker (chef/azubi) mit passendem Gewerk
  // Verwende JSONB-Query um Handwerker zu finden, deren professions Array das benötigte Gewerk enthält
  // Supabase PostgREST: professions @> '["glas"]'::jsonb wird mit .contains() gemacht
  try {
    // Versuche zuerst mit .contains() - sollte funktionieren für JSONB Arrays
    let handwerkerQuery = supabaseServer
      .from("profiles")
      .select("id, company_name, role, professions")
      .in("role", ["chef", "azubi"])

    // JSONB contains: professions @> '["glas"]'::jsonb
    // Versuche verschiedene Syntax-Varianten
    const { data: handwerker, error: handwerkerError } = await handwerkerQuery
      .contains("professions", JSON.stringify([params.profession]))
      .limit(params.limit)

    if (handwerkerError) {
      console.warn("⚠️ Fehler bei Handwerker-Suche (contains):", handwerkerError)
      // Fallback: Lade alle Handwerker und filtere client-seitig
      const { data: allHandwerker } = await supabaseServer
        .from("profiles")
        .select("id, company_name, role, professions")
        .in("role", ["chef", "azubi"])
        .limit(100)

      if (allHandwerker) {
        const filtered = allHandwerker.filter((h: any) => {
          const professions = Array.isArray(h.professions) ? h.professions : []
          return professions.includes(params.profession)
        })

        if (filtered.length > 0) {
          console.log(`✅ ${filtered.length} Handwerker gefunden (client-seitig gefiltert) für Profession: ${params.profession}`)
          const handwerkerRows = filtered.slice(0, params.limit).map((h: any) => ({
            id: h.id,
            company_name: h.company_name || "—",
            email: null,
            profession: params.profession,
            zip_codes: null,
            rating: 4.5,
            is_verified: true,
          }))
          return handwerkerRows.slice(0, params.limit)
        }
      }
    } else if (handwerker && handwerker.length > 0) {
      console.log(`✅ ${handwerker.length} Handwerker gefunden für Profession: ${params.profession}`)
      const handwerkerRows = handwerker.map((h: any) => ({
        id: h.id,
        company_name: h.company_name || "—",
        email: null,
        profession: params.profession,
        zip_codes: null,
        rating: 4.5,
        is_verified: true,
      }))
      // Kombiniere Partner und Handwerker, Partner zuerst (höhere Priorität)
      return handwerkerRows.slice(0, params.limit)
    } else {
      console.log(`ℹ️ Keine Handwerker gefunden für Profession: ${params.profession}`)
    }
  } catch (err) {
    console.warn("⚠️ Exception bei Handwerker-Suche:", err)
  }

  return []
}

export async function assignPartnerDirect(params: {
  orderId: string
  partnerId: string
}): Promise<void> {
  const { error } = await supabaseServer
    .from("orders")
    .update({ assigned_partner_id: params.partnerId })
    .eq("id", params.orderId)

  if (error) throw error
}

export async function autoAssignOnCreate(params: { order: Pick<Order, "id" | "type" | "customer_data"> }) {
  // ZIP kann in customer_data.zip oder customer_data.claim.plz sein
  const customerData = params.order.customer_data as any
  const zip = customerData?.zip || customerData?.claim?.plz || null
  const zipPrefix2 = zip ? String(zip).slice(0, 2) : null

  const profession = mapOrderTypeToProfession(params.order.type)

  console.log(`🔍 Auto-Assignment: Order ${params.order.id}, Type: ${params.order.type}, Profession: ${profession}, ZIP: ${zip}, ZIP-Prefix: ${zipPrefix2}`)
  console.log(`📦 Customer Data Structure:`, {
    hasZip: !!customerData?.zip,
    hasClaimPlz: !!customerData?.claim?.plz,
    zipValue: customerData?.zip,
    claimPlzValue: customerData?.claim?.plz,
  })

  const settings = await getAssignmentSettings({
    profession,
    zipPrefix2,
  })

  console.log(`📋 Assignment Settings:`, settings ? { mode: settings.mode, active: settings.active } : "Nicht gefunden")

  if (!settings || settings.mode !== "auto") {
    console.log(`⚠️ Auto-Assignment übersprungen:`, { reason: !settings ? "no_settings" : "mode_not_auto" })
    return { applied: false as const, reason: (!settings ? "no_settings" : "mode_not_auto") as const }
  }

  const assignees = await findMatchingPartners({
    profession,
    zip,
    limit: 1,
  })

  console.log(`👥 Gefundene Assignees:`, assignees.length, assignees.map(a => ({ id: a.id, name: a.company_name, type: a.is_verified ? "handwerker" : "partner" })))

  if (assignees.length === 0) {
    console.log(`⚠️ Keine Assignees gefunden für Profession: ${profession}`)
    return { applied: false as const, reason: "no_assignees" as const }
  }

  const assignee = assignees[0]

  // Prüfe, ob es ein Handwerker ist (aus profiles mit role IN ('chef', 'azubi'))
  // Handwerker haben kein profession-Feld in profiles, daher prüfen wir über die ID
  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("id, role, professions")
    .eq("id", assignee.id)
    .in("role", ["chef", "azubi"])
    .single()

  console.log(`🔍 Profile Check für Assignee ${assignee.id}:`, profile ? { role: profile.role, professions: profile.professions } : "Nicht gefunden (ist Partner)")

  if (profile) {
    // Es ist ein Handwerker -> assigned_to setzen
    console.log(`✅ Weise Handwerker zu: ${assignee.id} (${assignee.company_name})`)
    console.log(`📝 Update Order ${params.order.id} mit assigned_to: ${assignee.id}`)
    const { data: updatedOrder, error } = await supabaseServer
      .from("orders")
      .update({ assigned_to: assignee.id })
      .eq("id", params.order.id)
      .select("id, assigned_to")
      .single()

    if (error) {
      console.error(`❌ Fehler beim Setzen von assigned_to:`, error)
      throw error
    }
    console.log(`✅ assigned_to erfolgreich gesetzt. Verifiziert:`, updatedOrder)
    return { applied: true as const, assigneeId: assignee.id, assigneeType: "handwerker" as const }
  } else {
    // Es ist ein Partner -> assigned_partner_id setzen
    console.log(`✅ Weise Partner zu: ${assignee.id} (${assignee.company_name})`)
    console.log(`📝 Update Order ${params.order.id} mit assigned_partner_id: ${assignee.id}`)
    const { data: updatedOrder, error } = await supabaseServer
      .from("orders")
      .update({ assigned_partner_id: assignee.id })
      .eq("id", params.order.id)
      .select("id, assigned_partner_id")
      .single()

    if (error) {
      console.error(`❌ Fehler beim Setzen von assigned_partner_id:`, error)
      throw error
    }
    console.log(`✅ assigned_partner_id erfolgreich gesetzt. Verifiziert:`, updatedOrder)
    return { applied: true as const, assigneeId: assignee.id, assigneeType: "partner" as const }
  }
}

