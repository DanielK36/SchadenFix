import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

/**
 * POST /api/partner/enable
 * Enable partner (affiliate) access for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabaseServer.auth.getUser(token)
    if (userError || !userData.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Try to select profile with roles, but fallback to without roles if column doesn't exist
    let profile: any = null
    let profileError: any = null
    
    // First try with roles column
    const { data: profileWithRoles, error: errorWithRoles } = await supabaseServer
      .from("profiles")
      .select("id, role, roles, company_name")
      .eq("id", userData.user.id)
      .maybeSingle()
    
    if (errorWithRoles && errorWithRoles.code === "42703") {
      // Column doesn't exist (42703 = undefined_column), try without roles
      const { data: profileWithoutRoles, error: errorWithoutRoles } = await supabaseServer
        .from("profiles")
        .select("id, role, company_name")
        .eq("id", userData.user.id)
        .maybeSingle()
      
      profile = profileWithoutRoles
      profileError = errorWithoutRoles
    } else {
      profile = profileWithRoles
      profileError = errorWithRoles
    }

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is OK if profile doesn't exist yet
      console.error("Profile error:", profileError)
      return NextResponse.json(
        { success: false, error: "Failed to load profile", details: profileError.message },
        { status: 500 }
      )
    }

    // If roles column doesn't exist, warn but still proceed
    const existingRoles = Array.isArray(profile?.roles) ? profile?.roles : []
    const hasPartnerRole = profile?.role === "partner"
    const hasPartnerInRoles = existingRoles.includes("partner")
    
    if (hasPartnerRole || hasPartnerInRoles) {
      return NextResponse.json({ success: true, message: "Partner access already enabled" })
    }

    if (profile?.roles === undefined && profile) {
      console.warn("Roles column not found. Please run migration_profile_roles.sql to enable multi-role support.")
    }

    // Prepare update payload
    const upsertPayload: any = {
      id: userData.user.id,
      company_name: profile?.company_name || userData.user.user_metadata?.company_name || null,
    }

    // If roles column exists (we got it in the select), use it
    if (profile?.roles !== undefined) {
      upsertPayload.roles = [...existingRoles, "partner"]
      upsertPayload.role = profile?.role || "partner" // Keep existing role
    } else {
      // Roles column doesn't exist, just set role to partner
      // But keep existing role if user is a chef/azubi
      if (profile?.role && (profile.role === "chef" || profile.role === "azubi")) {
        // Can't have multiple roles without roles column, so we'll set role to partner
        // This means they lose their pro access - user should run migration first
        upsertPayload.role = "partner"
      } else {
        upsertPayload.role = "partner"
      }
    }

    const { error: updateError } = await supabaseServer
      .from("profiles")
      .upsert(upsertPayload, { onConflict: "id" })

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to enable partner access", 
          details: updateError.message,
          code: updateError.code 
        },
        { status: 500 }
      )
    }

    // Ensure partners row exists
    const { error: partnerRowError } = await supabaseServer
      .from("partners")
      .upsert(
        {
          id: userData.user.id,
          company_name:
            profile?.company_name || userData.user.user_metadata?.company_name || null,
          email: userData.user.email || null,
        },
        { onConflict: "id" }
      )

    if (partnerRowError) {
      console.error("Partner row error:", partnerRowError)
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to provision partner", 
          details: partnerRowError.message,
          code: partnerRowError.code 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Internal server error", details: error?.message },
      { status: 500 }
    )
  }
}
