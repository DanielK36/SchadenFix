import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/server/requireAdmin"

/**
 * GET /api/admin/partners - Get partners (admin only, bypasses RLS)
 * PATCH /api/admin/partners - Update partner fields (admin only)
 * 
 * Architecture:
 * - Partners are stored in `profiles` table with `role='partner'`
 * - partners table exists only for FK usage
 * - Magic Links: profiles.parent_partner_id links partner hierarchy
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Get all partners from profiles table where role='partner'
    const { data: partners, error } = await supabaseServer
      .from("profiles")
      .select("id, company_name, email, parent_partner_id, created_at, updated_at")
      .eq("role", "partner")
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) {
      console.error("❌ Error fetching partners:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch partners", details: error.message, code: error.code },
        { status: 500 }
      )
    }

    // Transform to expected format
    const formattedPartners = (partners || []).map((p: any) => ({
      id: p.id,
      company_name: p.company_name || "Unbekannt",
      email: p.email || null,
      parent_partner_id: p.parent_partner_id || null,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }))

    return NextResponse.json({ success: true, partners: formattedPartners })
  } catch (error: any) {
    console.error("❌ GET /api/admin/partners error:", error)
    const status = error?.status || 500
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || "Internal server error", 
        details: error?.details || error?.stack || String(error),
      },
      { status }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const id = body?.id as string | undefined

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400 }
      )
    }

    const updates: Record<string, any> = {}
    if (typeof body.company_name === "string") {
      updates.company_name = body.company_name
    }
    if (typeof body.email === "string") {
      updates.email = body.email
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      )
    }

    const { error } = await supabaseServer
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .eq("role", "partner") // Ensure we're only updating partners

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to update partner", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error", details: error?.details },
      { status }
    )
  }
}

