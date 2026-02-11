import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * GET /api/partner/commissions
 * Returns commissions for partner
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requirePartner(request)

    const { data: commissions, error } = await supabaseServer
      .from("partner_commissions")
      .select("id, order_id, amount, status, created_at")
      .eq("partner_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to load commissions", details: error.message },
        { status: 500 }
      )
    }

    // Load related orders for customer names
    const orderIds = (commissions || []).map((c: any) => c.order_id)
    const { data: orders } = await supabaseServer
      .from("orders")
      .select("id, customer_data")
      .in("id", orderIds.length ? orderIds : ["00000000-0000-0000-0000-000000000000"])

    const orderMap = new Map((orders || []).map((o: any) => [o.id, o]))

    const formatted = (commissions || []).map((c: any) => ({
      id: c.id,
      customerName: orderMap.get(c.order_id)?.customer_data?.name || "Unbekannt",
      amount: c.amount,
      createdAt: c.created_at,
      status: c.status,
    }))

    return NextResponse.json({ success: true, commissions: formatted })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
