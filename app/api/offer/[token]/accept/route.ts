import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { sendOfferAcceptedToPro } from "@/lib/email"

/**
 * POST /api/offer/[token]/accept
 * Kunde nimmt Angebot an: Signatur und optional rechtliche Bestätigungen.
 * Body: { signatureDataUrl?: string, agbAccepted?: boolean, privacyAccepted?: boolean }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    if (!token) {
      return NextResponse.json({ success: false, error: "Token fehlt" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const signatureDataUrl = typeof body.signatureDataUrl === "string" ? body.signatureDataUrl : undefined
    const agbAccepted = !!body.agbAccepted
    const privacyAccepted = !!body.privacyAccepted

    const { data: quote, error: quoteError } = await supabaseServer
      .from("order_quotes")
      .select("id, order_id, customer_accepted_at")
      .eq("offer_token", token)
      .maybeSingle()

    if (quoteError || !quote) {
      return NextResponse.json({ success: false, error: "Angebot nicht gefunden" }, { status: 404 })
    }

    if (quote.customer_accepted_at) {
      return NextResponse.json({ success: false, error: "Angebot wurde bereits angenommen" }, { status: 409 })
    }

    const now = new Date().toISOString()

    const { error: updateQuoteError } = await supabaseServer
      .from("order_quotes")
      .update({
        customer_accepted_at: now,
        customer_signature_url: signatureDataUrl || null,
        updated_at: now,
      })
      .eq("id", quote.id)

    if (updateQuoteError) {
      console.error("order_quotes accept update error:", updateQuoteError)
      return NextResponse.json({ success: false, error: "Annahme konnte nicht gespeichert werden" }, { status: 500 })
    }

    const { error: orderUpdateError } = await supabaseServer
      .from("orders")
      .update({ status: "genehmigt", updated_at: now })
      .eq("id", quote.order_id)

    if (orderUpdateError) {
      console.error("orders status update error:", orderUpdateError)
    }

    const { data: order } = await supabaseServer
      .from("orders")
      .select("company_id, assigned_to, customer_data")
      .eq("id", quote.order_id)
      .maybeSingle()
    const cd = (order?.customer_data as any) || {}
    const customerName = cd.name || cd.claim?.contact?.name || "Kunde"
    const proId = order?.assigned_to || order?.company_id
    if (proId) {
      const { data: profile } = await supabaseServer.from("profiles").select("email").eq("id", proId).maybeSingle()
      const proEmail = (profile as any)?.email
      if (proEmail) {
        sendOfferAcceptedToPro(proEmail, customerName, quote.order_id).catch((e) =>
          console.error("Offer-accepted-to-pro email failed:", e)
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Angebot angenommen",
      acceptedAt: now,
      legalConfirmations: { agbAccepted, privacyAccepted },
    })
  } catch (e: any) {
    console.error("POST /api/offer/[token]/accept", e)
    return NextResponse.json({ success: false, error: "Fehler beim Annehmen" }, { status: 500 })
  }
}
