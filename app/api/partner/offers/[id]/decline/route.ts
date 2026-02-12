import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * POST /api/partner/offers/[id]/decline
 * Declines an offer if still pending
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requirePartner(request)
    const { id: offerId } = await params

    const { data: offer, error } = await supabaseServer
      .from("partner_offers")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("id", offerId)
      .eq("partner_id", userId)
      .eq("status", "sent")
      .select("id, status")
      .single()

    if (error || !offer) {
      return NextResponse.json(
        { success: false, error: "Offer not found or already handled" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, offer })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
