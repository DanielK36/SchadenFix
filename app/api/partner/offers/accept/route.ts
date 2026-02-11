import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

/**
 * POST /api/partner/offers/accept
 * Body: { offerId?: string, token?: string }
 *
 * Race-safe (best-effort): only accepts if offer is still 'sent' and order is still unassigned.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const offerId = body?.offerId as string | undefined
    const token = body?.token as string | undefined

    if (!offerId && !token) {
      return NextResponse.json({ success: false, error: "Missing offerId or token" }, { status: 400 })
    }

    // Resolve partner identity: either logged-in (portal) or token-based (no auth)
    let partnerId: string | null = null

    const authHeader = request.headers.get("authorization") || ""
    const bearer = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null

    if (bearer) {
      const { data: userData, error: userError } = await supabaseServer.auth.getUser(bearer)
      if (!userError && userData.user) {
        // Ensure partner role
        const { data: profile } = await supabaseServer
          .from("profiles")
          .select("role, roles")
          .eq("id", userData.user.id)
          .maybeSingle()
        const roles = Array.isArray(profile?.roles) ? profile?.roles : []
        if (profile?.role === "partner" || roles.includes("partner")) {
          partnerId = userData.user.id
        }
      }
    }

    // Load offer
    let offerQuery = supabaseServer.from("partner_offers").select("*")
    if (offerId) offerQuery = offerQuery.eq("id", offerId)
    if (!offerId && token) offerQuery = offerQuery.eq("token_hash", token) // token is already hash in MVP

    const { data: offer, error: offerError } = await offerQuery.single()
    if (offerError || !offer) {
      return NextResponse.json({ success: false, error: "Offer not found" }, { status: 404 })
    }

    if (!partnerId) {
      // token-based accept: partnerId must match offer.partner_id
      if (!token) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
      }
      partnerId = offer.partner_id
    }

    // Partner mismatch guard (portal accept must match offer.partner_id)
    if (partnerId !== offer.partner_id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    // 1) mark offer accepted if still sent
    const { data: updatedOffer, error: updErr } = await supabaseServer
      .from("partner_offers")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", offer.id)
      .eq("status", "sent")
      .select("*")
      .single()

    if (updErr || !updatedOffer) {
      return NextResponse.json(
        { success: false, error: "Offer already handled" },
        { status: 409 }
      )
    }

    // 2) assign partner if order still unassigned
    const { data: updatedOrder, error: orderErr } = await supabaseServer
      .from("orders")
      .update({ assigned_partner_id: partnerId })
      .eq("id", offer.order_id)
      .is("assigned_partner_id", null)
      .select("id, assigned_partner_id")
      .single()

    if (orderErr || !updatedOrder) {
      // someone else won; expire this offer
      await supabaseServer
        .from("partner_offers")
        .update({ status: "expired" })
        .eq("id", offer.id)
      return NextResponse.json(
        { success: false, error: "Order already assigned" },
        { status: 409 }
      )
    }

    // 3) expire other offers
    await supabaseServer
      .from("partner_offers")
      .update({ status: "expired" })
      .eq("order_id", offer.order_id)
      .neq("id", offer.id)
      .eq("status", "sent")

    return NextResponse.json({ success: true, order: updatedOrder, offer: updatedOffer })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Internal server error", details: error?.message },
      { status: 500 }
    )
  }
}

