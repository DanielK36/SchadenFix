import { supabase } from "@/lib/supabase"

export interface RoutingRule {
  id: string
  zip_prefix: string
  profession: string
  preferred_partner_id: string | null
  priority: number
  active: boolean
  created_at: string
  partner?: {
    id: string
    company_name: string
    rating: number
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
}

/**
 * Get all routing rules
 */
export async function getRoutingRules(): Promise<RoutingRule[]> {
  const { data, error } = await supabase
    .from("routing_rules")
    .select(
      `
      *,
      partner:partners (
        id,
        company_name,
        rating
      )
    `
    )
    .order("zip_prefix", { ascending: true })
    .order("priority", { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Create a new routing rule
 */
export async function createRoutingRule(data: {
  zip_prefix: string
  profession: string
  preferred_partner_id: string | null
  priority: number
  active?: boolean
}): Promise<RoutingRule> {
  const { data: rule, error } = await supabase
    .from("routing_rules")
    .insert({
      zip_prefix: data.zip_prefix,
      profession: data.profession,
      preferred_partner_id: data.preferred_partner_id,
      priority: data.priority,
      active: data.active !== undefined ? data.active : true,
    })
    .select(
      `
      *,
      partner:partners (
        id,
        company_name,
        rating
      )
    `
    )
    .single()

  if (error) throw error
  return rule
}

/**
 * Update a routing rule
 */
export async function updateRoutingRule(
  id: string,
  updates: Partial<{
    zip_prefix: string
    profession: string
    preferred_partner_id: string | null
    priority: number
    active: boolean
  }>
): Promise<void> {
  const { error } = await supabase
    .from("routing_rules")
    .update(updates)
    .eq("id", id)

  if (error) throw error
}

/**
 * Delete a routing rule
 */
export async function deleteRoutingRule(id: string): Promise<void> {
  const { error } = await supabase.from("routing_rules").delete().eq("id", id)

  if (error) throw error
}

/**
 * Search partners by profession and zip
 */
export async function searchPartners(params: {
  profession?: string
  zip?: string
  query?: string
}): Promise<Partner[]> {
  let query = supabase.from("partners").select("*")

  if (params.profession) {
    query = query.eq("profession", params.profession)
  }

  if (params.zip) {
    query = query.contains("zip_codes", [params.zip])
  }

  if (params.query) {
    query = query.ilike("company_name", `%${params.query}%`)
  }

  const { data, error } = await query.order("rating", { ascending: false })

  if (error) throw error
  return data || []
}

