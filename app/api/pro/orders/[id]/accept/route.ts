import { NextRequest, NextResponse } from "next/server"
import { requireProUser } from "@/lib/server/requireProUser"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireProUser(request)
    const { id: orderId } = await params

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Auftrags-ID fehlt" },
        { status: 400 }
      )
    }

    // Prüfen, ob Auftrag existiert – maybeSingle() statt single(), damit 0 Zeilen keinen JSON-Coerce-Fehler werfen
    const { data: order, error: orderError } = await supabaseServer
      .from("orders")
      .select("id, assigned_to, status")
      .eq("id", orderId)
      .maybeSingle()

    if (orderError) {
      console.error("Accept order – select error:", orderError)
      return NextResponse.json(
        { success: false, error: "Auftrag konnte nicht geladen werden" },
        { status: 500 }
      )
    }
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Auftrag nicht gefunden" },
        { status: 404 }
      )
    }

    // Zuweisen und Status setzen (Server-Client wegen RLS)
    const { error: updateError } = await supabaseServer
      .from("orders")
      .update({
        assigned_to: userId,
        status: "bearbeitung",
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Accept order – update error:", updateError)
      return NextResponse.json(
        { success: false, error: "Auftrag konnte nicht übernommen werden" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Auftrag erfolgreich angenommen",
    })
  } catch (error: any) {
    console.error("Error accepting order:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Fehler beim Annehmen des Auftrags",
      },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    )
  }
}
