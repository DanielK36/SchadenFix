import { NextRequest, NextResponse } from "next/server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * GET /api/partner/commissions/payouts
 * Returns payouts list (placeholder until payouts are implemented)
 */
export async function GET(request: NextRequest) {
  try {
    await requirePartner(request)
    return NextResponse.json({ success: true, payouts: [] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
