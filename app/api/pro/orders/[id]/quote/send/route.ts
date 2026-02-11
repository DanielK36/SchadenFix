import { NextRequest, NextResponse } from "next/server"
import { requireProUser } from "@/lib/server/requireProUser"
import { supabaseServer } from "@/lib/supabase-server"
import { sendOfferToCustomer } from "@/lib/email"
import { randomBytes } from "crypto"

/**
 * POST /api/pro/orders/[id]/quote/send
 * Generiert offer_token, setzt offer_sent_at in order_quotes.
 * KVA-Items müssen vorher per PUT .../quote gespeichert sein.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireProUser(request)
    const { id: orderId } = await params
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Auftrags-ID fehlt" }, { status: 400 })
    }

    const { data: order } = await supabaseServer
      .from("orders")
      .select("id, company_id, assigned_to")
      .eq("id", orderId)
      .maybeSingle()

    if (!order || (order.company_id !== profile.id && order.assigned_to !== profile.id)) {
      return NextResponse.json({ success: false, error: "Auftrag nicht gefunden" }, { status: 404 })
    }

    const { data: existing } = await supabaseServer
      .from("order_quotes")
      .select("id, items")
      .eq("order_id", orderId)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Bitte zuerst KVA speichern („Fertig“ oder Positionen anlegen)" },
        { status: 400 }
      )
    }

    const offerToken = randomBytes(24).toString("base64url")
    const now = new Date().toISOString()

    const { data: updated, error } = await supabaseServer
      .from("order_quotes")
      .update({
        offer_token: offerToken,
        offer_sent_at: now,
        updated_at: now,
      })
      .eq("order_id", orderId)
      .select("offer_token, offer_sent_at")
      .single()

    if (error) {
      console.error("Quote send error:", error)
      return NextResponse.json({ success: false, error: "Angebot konnte nicht freigegeben werden" }, { status: 500 })
    }

    // Auftragsstatus automatisch auf "angebot" (KVA versendet)
    await supabaseServer
      .from("orders")
      .update({ status: "angebot", updated_at: now })
      .eq("id", orderId)

    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.headers.get("x-forwarded-proto") && request.headers.get("host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("host")}`
        : null) ||
      "http://localhost:3000"
    const offerUrl = `${base.replace(/\/$/, "")}/offer/${encodeURIComponent(updated?.offer_token ?? offerToken)}`

    const { data: orderForEmail } = await supabaseServer
      .from("orders")
      .select("customer_data")
      .eq("id", orderId)
      .maybeSingle()
    const cd = (orderForEmail?.customer_data as any) || {}
    const customerEmail = cd.email || cd.claim?.contact?.email
    const customerName = cd.name || cd.claim?.contact?.name || "Kunde"
    if (customerEmail) {
      sendOfferToCustomer(customerEmail, customerName, offerUrl, orderId).catch((e) =>
        console.error("Offer-to-customer email failed:", e)
      )
    }

    return NextResponse.json({
      success: true,
      offerToken: updated?.offer_token ?? offerToken,
      offerUrl,
      offerSentAt: updated?.offer_sent_at ?? now,
    })
  } catch (e: any) {
    const status = e?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ success: false, error: e?.message ?? "Fehler" }, { status })
  }
}
