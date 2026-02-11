import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireProUser } from "@/lib/server/requireProUser"

/**
 * PUT /api/pro/operations/zip-areas/[id]
 * DELETE /api/pro/operations/zip-areas/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireProUser(request)
    const body = await request.json()
    const id = params.id

    const updates: Record<string, any> = {}
    if (typeof body.zipRange === "string") updates.zip_range = body.zipRange
    if (typeof body.active === "boolean") updates.active = body.active
    if (typeof body.load === "string") updates.load = body.load

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("pro_zip_areas")
      .update(updates)
      .eq("id", id)
      .eq("profile_id", userId)
      .select("id, zip_range, active, load")
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Failed to update zip area", details: error?.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      area: {
        id: data.id,
        zipRange: data.zip_range,
        active: data.active,
        load: data.load,
      },
    })
  } catch (error: any) {
    const status = error?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireProUser(request)
    const id = params.id

    const { error } = await supabaseServer
      .from("pro_zip_areas")
      .delete()
      .eq("id", id)
      .eq("profile_id", userId)

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to delete zip area", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const status = error?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status })
  }
}
