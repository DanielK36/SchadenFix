import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * GET /api/partner/team/stats
 * Returns team members and commission stats
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requirePartner(request)

    const { data: teamMembers, error } = await supabaseServer
      .from("profiles")
      .select("id, company_name, created_at")
      .eq("role", "partner")
      .eq("parent_partner_id", userId)

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to load team", details: error.message },
        { status: 500 }
      )
    }

    const memberIds = (teamMembers || []).map((m: any) => m.id)
    const { data: commissions } = await supabaseServer
      .from("partner_commissions")
      .select("partner_id, amount, created_at")
      .in("partner_id", memberIds.length ? memberIds : ["00000000-0000-0000-0000-000000000000"])

    const commissionsByMember = new Map<string, number>()
    ;(commissions || []).forEach((c: any) => {
      const prev = commissionsByMember.get(c.partner_id) || 0
      commissionsByMember.set(c.partner_id, prev + Number(c.amount || 0))
    })

    const members = (teamMembers || []).map((m: any) => ({
      id: m.id,
      name: m.company_name || "Unbekannt",
      joinedAt: m.created_at,
      totalCommissions: commissionsByMember.get(m.id) || 0,
      monthlyCommissions: commissionsByMember.get(m.id) || 0,
    }))

    return NextResponse.json({
      success: true,
      teamMembers: members,
      totalTeamCommissions: members.reduce((sum: number, m: any) => sum + m.monthlyCommissions, 0),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
