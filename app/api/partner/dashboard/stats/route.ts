import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * GET /api/partner/dashboard/stats
 * Returns dashboard KPIs for affiliate partners
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requirePartner(request)

    const { data: leads, error: leadsError } = await supabaseServer
      .from("orders")
      .select("id, created_at, status, customer_data")
      .eq("assigned_partner_id", userId)
      .order("created_at", { ascending: false })

    if (leadsError) {
      return NextResponse.json(
        { success: false, error: "Failed to load leads", details: leadsError.message },
        { status: 500 }
      )
    }

    const { data: commissions, error: commissionsError } = await supabaseServer
      .from("partner_commissions")
      .select("id, order_id, amount, status, created_at")
      .eq("partner_id", userId)
      .order("created_at", { ascending: false })

    if (commissionsError) {
      return NextResponse.json(
        { success: false, error: "Failed to load commissions", details: commissionsError.message },
        { status: 500 }
      )
    }

    const totalLeads = leads?.length || 0
    const totalCommissions = (commissions || []).reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0)
    const pendingCommissions = (commissions || []).filter((c: any) => c.status === "PENDING")
    const pendingAmount = pendingCommissions.reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0)
    
    // Calculate monthly commissions (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const monthlyCommissions = (commissions || [])
      .filter((c: any) => new Date(c.created_at) >= thirtyDaysAgo)
      .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0)

    // Generate activities from leads and commissions
    const activities: any[] = []
    
    // Add recent leads (last 10)
    const recentLeads = (leads || []).slice(0, 10)
    recentLeads.forEach((lead: any) => {
      const customerName = lead.customer_data?.name || lead.customer_data?.claim?.contact?.name || "Unbekannt"
      activities.push({
        id: `lead-${lead.id}`,
        type: "LEAD",
        title: `Neuer Kunde: ${customerName}`,
        createdAt: lead.created_at,
      })
    })
    
    // Add recent commissions (last 10)
    const recentCommissions = (commissions || []).slice(0, 10)
    recentCommissions.forEach((commission: any) => {
      const amount = Number(commission.amount || 0)
      if (amount > 0) {
        activities.push({
          id: `comm-${commission.id || commission.order_id}`,
          type: "COMMISSION",
          title: `Neue Provision: ${amount.toFixed(2)} €`,
          createdAt: commission.created_at,
          amount: amount,
        })
      }
    })
    
    // Sort by date (newest first) and limit to 20
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const recentActivities = activities.slice(0, 20)

    // Generate chart data (last 7 days of commissions)
    const chartData: { day: string; revenue: number }[] = []
    const today = new Date()
    const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = dayNames[date.getDay()]
      const dateStr = date.toISOString().split("T")[0]
      
      const dayCommissions = (commissions || []).filter((c: any) => {
        const commDate = new Date(c.created_at).toISOString().split("T")[0]
        return commDate === dateStr
      })
      
      const dayTotal = dayCommissions.reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0)
      chartData.push({
        day: dayName,
        revenue: dayTotal,
      })
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalLeads,
        totalCommissions,
        monthlyCommissions,
        pendingCommissions: pendingCommissions.length,
        pendingAmount,
      },
      activities: recentActivities,
      chartData,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
