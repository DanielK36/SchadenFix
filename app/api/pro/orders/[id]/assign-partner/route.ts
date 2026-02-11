import { NextRequest, NextResponse } from "next/server"
import { assignPartnerDirect } from "@/services/assignmentService"
import { requireProUser } from "@/lib/server/requireProUser"

/**
 * POST /api/pro/orders/[id]/assign-partner
 * Assign a partner to an order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    await requireProUser(request)

    const { id: orderId } = await params
    const body = await request.json()
    const { partnerId } = body

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Auftrags-ID fehlt" },
        { status: 400 }
      )
    }

    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: "Partner-ID fehlt" },
        { status: 400 }
      )
    }

    // Assign the partner
    await assignPartnerDirect({
      orderId,
      partnerId,
    })

    return NextResponse.json({
      success: true,
      message: "Partner erfolgreich zugewiesen",
    })
  } catch (error: any) {
    console.error("Error assigning partner:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Fehler beim Zuweisen des Partners",
      },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    )
  }
}
