import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/server/requireAdmin"

/**
 * PATCH /api/admin/routing-rules/:id - update rule (admin only)
 * DELETE /api/admin/routing-rules/:id - delete rule (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const updates = await request.json()

    const { id } = await params

    const { error } = await supabaseServer
      .from("routing_rules")
      .update(updates)
      .eq("id", id)

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to update rule", details: error.message },
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

    const { error } = await supabaseServer
      .from("routing_rules")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to delete rule", details: error.message },
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

