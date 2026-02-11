import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * GET /api/partner/leads/[id]
 * Returns a single lead (order) assigned to partner
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requirePartner(request)
    const leadId = params.id

    const { data: order, error } = await supabaseServer
      .from("orders")
      .select("id, created_at, status, customer_data, description")
      .eq("id", leadId)
      .eq("assigned_partner_id", userId)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      )
    }

    const { data: commission } = await supabaseServer
      .from("partner_commissions")
      .select("amount, status, commission_rate")
      .eq("partner_id", userId)
      .eq("order_id", leadId)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      lead: {
        id: order.id,
        createdAt: order.created_at,
        status: order.status,
        customer: {
          name: order.customer_data?.name || "Unbekannt",
          email: order.customer_data?.email || null,
          phone: order.customer_data?.phone || null,
          address: order.customer_data?.address || null,
        },
        description: order.description || "",
        commission: commission || null,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
