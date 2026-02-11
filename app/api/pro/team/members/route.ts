import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireProUser } from "@/lib/server/requireProUser"

/**
 * GET /api/pro/team/members
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, profile } = await requireProUser(request)

    if (profile.role === "chef") {
      const { data, error } = await supabaseServer
        .from("pro_team_members")
        .select("id, member_id, role, created_at, profiles:member_id(id, company_name, email)")
        .eq("company_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        return NextResponse.json(
          { success: false, error: "Failed to load team members", details: error.message },
          { status: 500 }
        )
      }

      const members = (data || []).map((m: any) => ({
        id: m.member_id,
        name: m.profiles?.company_name || "—",
        email: m.profiles?.email || null,
        joinedAt: m.created_at,
        role: m.role,
      }))

      return NextResponse.json({ success: true, members })
    }

    // azubi: return their company link if exists
    const { data: link } = await supabaseServer
      .from("pro_team_members")
      .select("company_id, created_at")
      .eq("member_id", userId)
      .maybeSingle()

    return NextResponse.json({ success: true, members: link ? [link] : [] })
  } catch (error: any) {
    const status = error?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status })
  }
}
