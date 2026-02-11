import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/server/requireAdmin"

/**
 * GET /api/admin/pro-network - Get Pro Network handwerker (chef/azubi roles)
 * Admin only, bypasses RLS
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Get all profiles with chef or azubi role (Pro Network)
    const { data: profiles, error } = await supabaseServer
      .from("profiles")
      .select("id, role, company_name, created_at, updated_at")
      .in("role", ["chef", "azubi"])
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) {
      console.error("❌ Error fetching pro network:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch pro network", details: error.message },
        { status: 500 }
      )
    }

    // Get emails from auth.users for each profile
    const proNetwork = await Promise.all(
      (profiles || []).map(async (p: any) => {
        // Get email from auth.users using admin API
        const { data: authUser } = await supabaseServer.auth.admin.getUserById(p.id)
        return {
          id: p.id,
          role: p.role,
          company_name: p.company_name || "—",
          email: authUser?.user?.email || null,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }
      })
    )

    return NextResponse.json({ success: true, proNetwork })
  } catch (error: any) {
    console.error("❌ GET /api/admin/pro-network error:", error)
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
