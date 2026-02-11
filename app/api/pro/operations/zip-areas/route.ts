import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireProUser } from "@/lib/server/requireProUser"

/**
 * GET /api/pro/operations/zip-areas
 * POST /api/pro/operations/zip-areas
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireProUser(request)

    const { data, error } = await supabaseServer
      .from("pro_zip_areas")
      .select("id, zip_range, active, load")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to load zip areas", details: error.message },
        { status: 500 }
      )
    }

    const areas = (data || []).map((a: any) => ({
      id: a.id,
      zipRange: a.zip_range,
      active: a.active,
      load: a.load,
    }))

    return NextResponse.json({ success: true, areas })
  } catch (error: any) {
    const status = error?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireProUser(request)
    const body = await request.json()

    const zipRange = body?.zipRange as string | undefined
    const active = typeof body?.active === "boolean" ? body.active : true
    const load = body?.load || "GREEN"

    if (!zipRange) {
      return NextResponse.json({ success: false, error: "zipRange is required" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("pro_zip_areas")
      .insert({
        profile_id: userId,
        zip_range: zipRange,
        active,
        load,
      })
      .select("id, zip_range, active, load")
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to create zip area", details: error.message },
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
