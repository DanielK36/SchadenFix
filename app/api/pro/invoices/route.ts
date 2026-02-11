import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireProUser } from "@/lib/server/requireProUser"

/**
 * GET /api/pro/invoices - list invoices for company
 * POST /api/pro/invoices - create invoice
 */
export async function GET(request: NextRequest) {
  try {
    const { profile } = await requireProUser(request)
    const companyId = profile.role === "chef" ? profile.id : profile.id

    const { data: orders } = await supabaseServer
      .from("orders")
      .select("id")
      .eq("company_id", companyId)

    const orderIds = (orders || []).map((o: any) => o.id)
    const { data: invoices, error } = await supabaseServer
      .from("invoices")
      .select("*")
      .in("order_id", orderIds.length ? orderIds : ["00000000-0000-0000-0000-000000000000"])
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to load invoices", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, invoices: invoices || [] })
  } catch (error: any) {
    const status = error?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireProUser(request)
    const body = await request.json()

    const { order_id, net_amount, vat_rate, description, due_date } = body || {}
    if (!order_id || typeof net_amount !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing order_id or net_amount" },
        { status: 400 }
      )
    }

    const rate = typeof vat_rate === "number" ? vat_rate : 19
    const gross = Number(net_amount) * (1 + rate / 100)

    const { data: invoice, error } = await supabaseServer
      .from("invoices")
      .insert({
        order_id,
        net_amount: net_amount,
        vat_rate: rate,
        gross_amount: gross,
        description: description || null,
        due_date: due_date || null,
        status: "draft",
      })
      .select("*")
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to create invoice", details: error.message },
        { status: 500 }
      )
    }

    // Rechnung erstellt → Auftrag in "Abgeschlossene Aufträge"
    const now = new Date().toISOString()
    await supabaseServer
      .from("orders")
      .update({ status: "abgeschlossen", updated_at: now })
      .eq("id", order_id)

    // Update or create commission for affiliate partner if order has assigned_partner_id
    const { data: order } = await supabaseServer
      .from("orders")
      .select("assigned_partner_id")
      .eq("id", order_id)
      .single()

    if (order?.assigned_partner_id) {
      const commissionRate = 10.0
      const commissionAmount = gross * (commissionRate / 100)
      await supabaseServer
        .from("partner_commissions")
        .upsert(
          {
            partner_id: order.assigned_partner_id,
            order_id,
            amount: commissionAmount,
            commission_rate: commissionRate,
            status: "PENDING",
          },
          { onConflict: "order_id" }
        )
    }

    return NextResponse.json({ success: true, invoice })
  } catch (error: any) {
    const status = error?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status }
    )
  }
}
