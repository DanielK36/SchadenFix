import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/requireAdmin"
import { supabaseServer } from "@/lib/supabase-server"
import { findMatchingPartners, getAssignmentSettings, mapOrderTypeToProfession } from "@/services/assignmentService"

/**
 * POST /api/admin/assign
 * Body:
 *  - mode: "auto" | "bulk" | "broadcast"
 *  - orderId?: string
 *  - options?: any
 *
 * Implementation is completed in assignmentService.ts (next todo).
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()

    const mode = body?.mode as string | undefined

    if (mode === "auto") {
      const orderId = body?.orderId as string | undefined
      if (!orderId) {
        return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 })
      }

      const { data: order, error } = await supabaseServer
        .from("orders")
        .select("id, type, customer_data")
        .eq("id", orderId)
        .single()

      if (error || !order) {
        return NextResponse.json(
          { success: false, error: "Order not found", details: error?.message },
          { status: 404 }
        )
      }

      const zip = (order.customer_data as any)?.zip || null
      const zipPrefix2 = zip ? String(zip).slice(0, 2) : null
      const profession = mapOrderTypeToProfession(order.type as any)

      const settings = await getAssignmentSettings({ profession, zipPrefix2 })
      if (!settings) {
        return NextResponse.json(
          { success: false, error: "No assignment setting configured", details: { profession, zipPrefix2 } },
          { status: 409 }
        )
      }
      if (!settings.active || settings.mode !== "auto") {
        return NextResponse.json(
          { success: false, error: "Auto mode is not enabled", details: { mode: settings.mode, active: settings.active } },
          { status: 409 }
        )
      }

      const partners = await findMatchingPartners({
        profession,
        zip,
        limit: 1,
      })

      if (partners.length === 0) {
        return NextResponse.json({ success: false, error: "No matching partners found" }, { status: 404 })
      }

      const { error: updateError } = await supabaseServer
        .from("orders")
        .update({ assigned_to: partners[0].id, status: "bearbeitung" })
        .eq("id", order.id)

      if (updateError) {
        return NextResponse.json(
          { success: false, error: "Failed to assign order", details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, assigned_to: partners[0].id })
    }

    return NextResponse.json(
      { success: false, error: "Not implemented yet", received: body },
      { status: 501 }
    )
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error", details: error?.details },
      { status }
    )
  }
}

