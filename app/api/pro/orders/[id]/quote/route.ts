import { NextRequest, NextResponse } from "next/server"
import { requireProUser } from "@/lib/server/requireProUser"
import { supabaseServer } from "@/lib/supabase-server"

/**
 * GET /api/pro/orders/[id]/quote – gespeicherte KVA-Positionen laden
 * PUT /api/pro/orders/[id]/quote – KVA-Positionen speichern (Body: { items: { id, description, quantity, unit, unitPrice, total }[] })
 */
export async function GET(
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

    const { data: quote, error } = await supabaseServer
      .from("order_quotes")
      .select("id, items, offer_token, offer_sent_at, customer_accepted_at")
      .eq("order_id", orderId)
      .maybeSingle()

    if (error) {
      console.error("Quote GET error:", error)
      const isMissingTable = (error as any)?.code === "PGRST205" || (error as any)?.message?.includes("order_quotes")
      const message = isMissingTable
        ? "Die Tabelle für Angebote (order_quotes) existiert noch nicht. Bitte führen Sie die Migration in Supabase aus: Supabase Dashboard → SQL Editor → Inhalt von supabase/migration_order_quotes.sql ausführen."
        : "Angebot konnte nicht geladen werden"
      return NextResponse.json({ success: false, error: message, details: (error as any)?.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      quote: quote
        ? {
            items: quote.items ?? [],
            offerToken: quote.offer_token ?? null,
            offerSentAt: quote.offer_sent_at ?? null,
            customerAcceptedAt: quote.customer_accepted_at ?? null,
          }
        : null,
    })
  } catch (e: any) {
    const status = e?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ success: false, error: e?.message ?? "Fehler" }, { status })
  }
}

export async function PUT(
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

    const body = await request.json().catch(() => ({}))
    const items = Array.isArray(body.items) ? body.items : []

    const { data: quote, error } = await supabaseServer
      .from("order_quotes")
      .upsert(
        {
          order_id: orderId,
          items,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "order_id" }
      )
      .select("id, items")
      .single()

    if (error) {
      console.error("Quote PUT error:", error)
      const isMissingTable = (error as any)?.code === "PGRST205" || (error as any)?.message?.includes("order_quotes")
      const message = isMissingTable
        ? "Die Tabelle für Angebote (order_quotes) existiert noch nicht. Bitte führen Sie die Migration in Supabase aus: Supabase Dashboard → SQL Editor → Inhalt von supabase/migration_order_quotes.sql ausführen."
        : "Angebot konnte nicht gespeichert werden"
      return NextResponse.json({ success: false, error: message, details: (error as any)?.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, quote: { items: quote?.items ?? items } })
  } catch (e: any) {
    const status = e?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ success: false, error: e?.message ?? "Fehler" }, { status })
  }
}
