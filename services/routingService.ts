import { supabase } from "@/lib/supabase"

export interface RoutingRule {
  id: string
  zip_prefix: string
  profession: string
  preferred_assignee_id: string | null
  assignee_type: 'partner' | 'handwerker' | null
  priority: number
  active: boolean
  created_at: string
  partner?: {
    id: string
    company_name: string
    rating: number
  }
  handwerker?: {
    id: string
    company_name: string
    role: string
  }
}

export interface Partner {
  id: string
  company_name: string
  profession: string
  email?: string
  rating: number
  zip_codes?: string[]
  is_verified: boolean
  assignee_type?: 'partner' | 'handwerker' // Neu: Unterscheidung zwischen Partner und Handwerker
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Get all routing rules
 */
export async function getRoutingRules(): Promise<RoutingRule[]> {
  const headers = await getAuthHeaders()
  const res = await fetch("/api/admin/routing-rules", { headers })
  const json = await res.json().catch(() => null)
  if (!json?.success) {
    throw new Error(json?.details || json?.error || "Failed to load routing rules")
  }
  return (json.rules || []) as RoutingRule[]
}

/**
 * Create a new routing rule
 */
export async function createRoutingRule(data: {
  zip_prefix: string
  profession: string
  preferred_assignee_id: string | null
  assignee_type: 'partner' | 'handwerker' | null
  priority: number
  active?: boolean
}): Promise<RoutingRule> {
  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
  }
  const res = await fetch("/api/admin/routing-rules", {
    method: "POST",
    headers,
    body: JSON.stringify({
      zip_prefix: data.zip_prefix,
      profession: data.profession,
      preferred_assignee_id: data.preferred_assignee_id,
      assignee_type: data.assignee_type,
      priority: data.priority,
      active: data.active !== undefined ? data.active : true,
    }),
  })
  const json = await res.json().catch(() => null)
  if (!json?.success) {
    throw new Error(json?.details || json?.error || "Failed to create routing rule")
  }
  return json.rule as RoutingRule
}

/**
 * Update a routing rule
 */
export async function updateRoutingRule(
  id: string,
  updates: Partial<{
    zip_prefix: string
    profession: string
    preferred_assignee_id: string | null
    assignee_type: 'partner' | 'handwerker' | null
    priority: number
    active: boolean
  }>
): Promise<void> {
  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
  }
  const res = await fetch(`/api/admin/routing-rules/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(updates),
  })
  const json = await res.json().catch(() => null)
  if (!json?.success) {
    throw new Error(json?.details || json?.error || "Failed to update routing rule")
  }
}

/**
 * Delete a routing rule
 */
export async function deleteRoutingRule(id: string): Promise<void> {
  const headers = await getAuthHeaders()
  const res = await fetch(`/api/admin/routing-rules/${id}`, { method: "DELETE", headers })
  const json = await res.json().catch(() => null)
  if (!json?.success) {
    throw new Error(json?.details || json?.error || "Failed to delete routing rule")
  }
}

/**
 * Search assignees (partners + handwerker) by profession and zip
 * Returns both Partner (Vermittler) and Handwerker (Pro Network)
 */
export async function searchAssignees(params: {
  profession?: string
  zip?: string
  query?: string
}): Promise<Partner[]> {
  const headers = await getAuthHeaders()
  const results: Partner[] = []

  // 1. Suche Partner (Vermittler) aus partners Tabelle
  try {
    const partnersRes = await fetch("/api/admin/partners", { headers })
    const partnersJson = await partnersRes.json().catch(() => null)
    if (partnersJson?.success) {
      const partners = (partnersJson.partners || []) as any[]
      const filtered = partners
        .filter((p) => {
          if (params.profession && p.profession !== params.profession) return false
          if (params.zip) {
            const arr = Array.isArray(p.zip_codes) ? p.zip_codes : []
            if (!arr.includes(params.zip)) return false
          }
          if (params.query) {
            const q = params.query.trim().toLowerCase()
            const name = String(p.company_name || "").toLowerCase()
            const email = String(p.email || "").toLowerCase()
            if (!name.includes(q) && !email.includes(q)) return false
          }
          return true
        })
        .map((p) => ({
          id: String(p.id),
          company_name: String(p.company_name || ""),
          profession: String(p.profession || ""),
          email: p.email ? String(p.email) : undefined,
          rating: typeof p.rating === "number" ? p.rating : Number(p.rating || 0),
          zip_codes: Array.isArray(p.zip_codes) ? p.zip_codes : undefined,
          is_verified: !!p.is_verified,
          assignee_type: 'partner' as const,
        }))
      results.push(...filtered)
    }
  } catch (err) {
    console.warn("Failed to load partners:", err)
  }

  // 2. Suche Handwerker (Pro Network) aus profiles mit role IN ('chef', 'azubi')
  try {
    const handwerkerRes = await fetch("/api/admin/pro-network", { headers })
    const handwerkerJson = await handwerkerRes.json().catch(() => null)
    if (handwerkerJson?.success) {
      const handwerker = (handwerkerJson.proNetwork || []) as any[]
      const filtered = handwerker
        .filter((h) => {
          if (params.query) {
            const q = params.query.trim().toLowerCase()
            const name = String(h.company_name || "").toLowerCase()
            const email = String(h.email || "").toLowerCase()
            if (!name.includes(q) && !email.includes(q)) return false
          }
          return true
        })
        .map((h) => ({
          id: String(h.id),
          company_name: String(h.company_name || "—"),
          profession: params.profession || "", // Profession kommt aus Routing Rule, nicht aus Handwerker-Profil
          email: h.email ? String(h.email) : undefined,
          rating: 4.5, // Default rating für Handwerker
          zip_codes: undefined,
          is_verified: true, // Handwerker sind automatisch verifiziert (haben Account)
          assignee_type: 'handwerker' as const,
        }))
      results.push(...filtered)
    }
  } catch (err) {
    console.warn("Failed to load handwerker:", err)
  }

  // Sortiere nach Rating (höchste zuerst)
  return results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
}

/**
 * Search partners by profession and zip
 * @deprecated Use searchAssignees() instead for unified search
 */
export async function searchPartners(params: {
  profession?: string
  zip?: string
  query?: string
}): Promise<Partner[]> {
  // For admin UI, prefer server-side admin API (stable auth + bypasses RLS pitfalls).
  const headers = await getAuthHeaders()
  const res = await fetch("/api/admin/partners", { headers })
  const json = await res.json().catch(() => null)
  if (!json?.success) {
    throw new Error(json?.details || json?.error || "Failed to load partners")
  }

  const partners = (json.partners || []) as any[]
  const q = (params.query || "").trim().toLowerCase()
  const zip = (params.zip || "").trim()

  const filtered = partners
    .filter((p) => {
      if (params.profession && p.profession !== params.profession) return false
      if (zip) {
        const arr = Array.isArray(p.zip_codes) ? p.zip_codes : []
        if (!arr.includes(zip)) return false
      }
      if (q) {
        const name = String(p.company_name || "").toLowerCase()
        const email = String(p.email || "").toLowerCase()
        if (!name.includes(q) && !email.includes(q)) return false
      }
      return true
    })
    .map((p) => ({
      id: String(p.id),
      company_name: String(p.company_name || ""),
      profession: String(p.profession || ""),
      email: p.email ? String(p.email) : undefined,
      rating: typeof p.rating === "number" ? p.rating : Number(p.rating || 0),
      zip_codes: Array.isArray(p.zip_codes) ? p.zip_codes : undefined,
      is_verified: !!p.is_verified,
    }))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))

  return filtered
}

