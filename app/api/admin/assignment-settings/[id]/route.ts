import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/server/requireAdmin"

/**
 * PATCH /api/admin/assignment-settings/:id
 * DELETE /api/admin/assignment-settings/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = await request.json()

    const updates: Record<string, any> = {}
    if (typeof body.profession === "string") updates.profession = body.profession
    if (typeof body.zip_prefix === "string") updates.zip_prefix = body.zip_prefix || null
    if (body.zip_prefix === null) updates.zip_prefix = null
    if (body.mode === "manual" || body.mode === "auto" || body.mode === "broadcast") updates.mode = body.mode
    if (typeof body.broadcast_partner_count === "number") updates.broadcast_partner_count = body.broadcast_partner_count
    if (body.fallback_behavior === "internal_only" || body.fallback_behavior === "manual") updates.fallback_behavior = body.fallback_behavior
    if (typeof body.active === "boolean") updates.active = body.active

    const { error } = await supabaseServer.from("assignment_settings").update(updates).eq("id", id)
    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to update assignment setting", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error", details: error?.details },
      { status }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const { error } = await supabaseServer.from("assignment_settings").delete().eq("id", id)
    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to delete assignment setting", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error", details: error?.details },
      { status }
    )
  }
}

