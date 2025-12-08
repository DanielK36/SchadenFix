import type { Order as SupabaseOrder } from "@/services/orderService"
import type { ProOrder, ProStatus, DamageType } from "@/lib/types/pro"

/**
 * Maps Supabase Order to ProOrder format
 */
export function mapSupabaseOrderToProOrder(order: SupabaseOrder): ProOrder {
  const customerData = order.customer_data as any

  // Map status
  const statusMap: Record<string, ProStatus> = {
    neu: "NEW",
    bearbeitung: "IN_PROGRESS",
    angebot: "DONE",
    warte_auf_kunde: "IN_PROGRESS",
    genehmigt: "DONE",
    abgeschlossen: "DONE",
    storniert: "CANCELLED",
  }

  // Map type
  const typeMap: Record<string, DamageType> = {
    wasser: "WASSER",
    feuer: "FEUER",
    kfz: "KFZ",
    glas: "GLAS",
    gebaeude: "GEBAEUDE",
    rechtsfall: "RECHTSFALL",
  }

  return {
    id: order.id,
    damageType: typeMap[order.type] || "WASSER",
    customerName: customerData.name || "Unbekannt",
    customerPhone: customerData.phone || "",
    customerEmail: customerData.email || "",
    customerAddress: customerData.address || "",
    zip: customerData.zip || "",
    city: customerData.city || "",
    createdAt: order.created_at,
    scheduledAt: order.scheduled_at || undefined,
    status: statusMap[order.status] || "NEW",
    description: order.description || "",
    photos: order.order_wizard_data?.photos || [],
    internalNotes: order.order_wizard_data?.internal_notes
      ? [
          {
            id: order.order_wizard_data.id,
            content: order.order_wizard_data.internal_notes,
            createdAt: order.order_wizard_data.created_at,
            createdBy: "System",
          },
        ]
      : [],
  }
}

