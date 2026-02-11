import { NextRequest } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

/**
 * Require Partner (Affiliate) authentication in API routes
 * Returns the authenticated user ID and profile
 * Throws an error if not authenticated or not a Partner user
 */
export async function requirePartner(
  request: NextRequest
): Promise<{ userId: string; profile: { id: string; role: string; company_name?: string | null } }> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: No authorization header")
  }

  const token = authHeader.substring(7)

  const {
    data: { user },
    error: authError,
  } = await supabaseServer.auth.getUser(token)

  if (authError || !user) {
    throw new Error("Unauthorized: Invalid token")
  }

  // Try to select profile with roles, but fallback to without roles if column doesn't exist
  let profile: any = null
  let profileError: any = null
  
  // First try with roles column
  const { data: profileWithRoles, error: errorWithRoles } = await supabaseServer
    .from("profiles")
    .select("id, role, roles, company_name")
    .eq("id", user.id)
    .maybeSingle()
  
  if (errorWithRoles && errorWithRoles.code === "42703") {
    // Column doesn't exist (42703 = undefined_column), try without roles
    const { data: profileWithoutRoles, error: errorWithoutRoles } = await supabaseServer
      .from("profiles")
      .select("id, role, company_name")
      .eq("id", user.id)
      .maybeSingle()
    
    profile = profileWithoutRoles
    profileError = errorWithoutRoles
  } else {
    profile = profileWithRoles
    profileError = errorWithRoles
  }

  if (profileError && profileError.code !== "PGRST116") {
    // PGRST116 = no rows returned, which is OK if profile doesn't exist yet
    throw new Error(`Unauthorized: Profile not found - ${profileError.message}`)
  }

  if (!profile) {
    throw new Error("Unauthorized: Profile not found")
  }

  const roles = Array.isArray(profile?.roles) ? profile.roles : []
  if (profile.role !== "partner" && !roles.includes("partner")) {
    throw new Error("Unauthorized: User is not a partner")
  }

  return {
    userId: user.id,
    profile: {
      id: profile.id,
      role: profile.role,
      company_name: profile.company_name,
    },
  }
}
