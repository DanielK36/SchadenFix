import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * GET /api/partner/commissions/[id]
 * Returns a single commission detail
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requirePartner(request)
    const commissionId = params.id

    const { data: commission, error } = await supabaseServer
      .from("partner_commissions")
      .select("id, order_id, amount, status, created_at, commission_rate")
      .eq("id", commissionId)
      .eq("partner_id", userId)
      .single()

    if (error || !commission) {
      return NextResponse.json(
        { success: false, error: "Commission not found" },
        { status: 404 }
      )
    }

    const { data: order } = await supabaseServer
      .from("orders")
      .select("id, customer_data, description")
      .eq("id", commission.order_id)
      .single()

    return NextResponse.json({
      success: true,
      commission: {
        id: commission.id,
        orderId: commission.order_id,
        amount: commission.amount,
        status: commission.status,
        createdAt: commission.created_at,
        commissionRate: commission.commission_rate,
        customerName: order?.customer_data?.name || "Unbekannt",
        description: order?.description || "",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
