import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/server/requireAdmin"

/**
 * GET /api/admin/invoices - Get invoices (admin only, bypasses RLS)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { data: invoices, error } = await supabaseServer
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch invoices", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, invoices: invoices || [] })
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error", details: error?.details },
      { status }
    )
  }
}

