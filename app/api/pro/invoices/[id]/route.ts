import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireProUser } from "@/lib/server/requireProUser"

/**
 * GET /api/pro/invoices/[id]
 * PUT /api/pro/invoices/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireProUser(request)
    const { id: invoiceId } = await params

    const { data: invoice, error } = await supabaseServer
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single()

    if (error || !invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireProUser(request)
    const { id: invoiceId } = await params
    const body = await request.json()

    const updates: Record<string, any> = {}
    if (typeof body.status === "string") updates.status = body.status
    if (typeof body.pdf_url === "string") updates.pdf_url = body.pdf_url
    if (typeof body.description === "string") updates.description = body.description
    if (typeof body.due_date === "string") updates.due_date = body.due_date

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      )
    }

    const { data: invoice, error } = await supabaseServer
      .from("invoices")
      .update(updates)
      .eq("id", invoiceId)
      .select("*")
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to update invoice", details: error.message },
        { status: 500 }
      )
    }

    // Rechnung als bezahlt markiert → Auftrag automatisch auf "abgeschlossen"
    if (updates.status === "paid" && invoice?.order_id) {
      const now = new Date().toISOString()
      await supabaseServer
        .from("orders")
        .update({ status: "abgeschlossen", updated_at: now })
        .eq("id", invoice.order_id)
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
