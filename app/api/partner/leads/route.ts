import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * GET /api/partner/leads
 * Returns leads derived from orders assigned to partner
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requirePartner(request)

    const { data: orders, error } = await supabaseServer
      .from("orders")
      .select("id, created_at, status, customer_data")
      .eq("assigned_partner_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to load leads", details: error.message },
        { status: 500 }
      )
    }

    const orderIds = (orders || []).map((o: any) => o.id)
    const { data: commissions } = await supabaseServer
      .from("partner_commissions")
      .select("order_id, amount, status")
      .in("order_id", orderIds.length ? orderIds : ["00000000-0000-0000-0000-000000000000"])

    const commissionByOrder = new Map(
      (commissions || []).map((c: any) => [c.order_id, c])
    )

    const statusMap: Record<string, string> = {
      neu: "KONTAKT_AUFGENOMMEN",
      bearbeitung: "ANGEBOT_ERSTELLT",
      angebot: "AUFTRAG_ERTEILT", // Angebot versendet
      warte_auf_kunde: "AUFTRAG_ERTEILT", // Angebot versendet, wartet auf Kunde
      genehmigt: "AUFTRAG_ERTEILT", // Angebot vom Kunden angenommen/unterzeichnet
      abgeschlossen: "ABGESCHLOSSEN",
      storniert: "ABGESCHLOSSEN", // Storniert = auch abgeschlossen
    }

    const leads = (orders || []).map((order: any) => {
      const commission = commissionByOrder.get(order.id)
      return {
        id: order.id,
        customerName: order.customer_data?.name || "Unbekannt",
        createdAt: order.created_at,
        status: statusMap[order.status] || "KONTAKT_AUFGENOMMEN",
        expectedCommission: commission?.amount || 0,
        receivedCommission: commission?.status === "PAID" ? commission?.amount : undefined,
      }
    })

    return NextResponse.json({ success: true, leads })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
