import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

/**
 * GET /api/partner/offers - list offers for logged-in partner
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabaseServer.auth.getUser(token)
    if (userError || !userData.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Ensure partner role
    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("role, roles")
      .eq("id", userData.user.id)
      .maybeSingle()

    const roles = Array.isArray(profile?.roles) ? profile?.roles : []
    if (!profile || (profile.role !== "partner" && !roles.includes("partner"))) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { data: offers, error } = await supabaseServer
      .from("partner_offers")
      .select("*")
      .eq("partner_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch offers", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, offers: offers || [] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Internal server error", details: error?.message },
      { status: 500 }
    )
  }
}

