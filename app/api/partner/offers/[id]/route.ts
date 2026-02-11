import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * GET /api/partner/offers/[id]
 * Returns a single offer with order details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requirePartner(request)
    const offerId = params.id

    const { data: offer, error } = await supabaseServer
      .from("partner_offers")
      .select("id, order_id, status, created_at, responded_at")
      .eq("id", offerId)
      .eq("partner_id", userId)
      .single()

    if (error || !offer) {
      return NextResponse.json(
        { success: false, error: "Offer not found" },
        { status: 404 }
      )
    }

    const { data: order } = await supabaseServer
      .from("orders")
      .select("id, type, description, customer_data, created_at")
      .eq("id", offer.order_id)
      .single()

    return NextResponse.json({
      success: true,
      offer: {
        ...offer,
        order: order || null,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
