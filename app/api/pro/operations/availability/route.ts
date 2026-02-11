import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireProUser } from "@/lib/server/requireProUser"

/**
 * GET /api/pro/operations/availability
 * PUT /api/pro/operations/availability
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireProUser(request)

    const { data, error } = await supabaseServer
      .from("pro_availability")
      .select("status")
      .eq("profile_id", userId)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to load availability", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      status: data?.status || "AVAILABLE",
    })
  } catch (error: any) {
    const status = error?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await requireProUser(request)
    const body = await request.json()
    const status = body?.status as string | undefined

    if (!status || !["AVAILABLE", "LIMITED", "UNAVAILABLE"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      )
    }

    const { error } = await supabaseServer
      .from("pro_availability")
      .upsert({ profile_id: userId, status }, { onConflict: "profile_id" })

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to update availability", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const status = error?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status })
  }
}
