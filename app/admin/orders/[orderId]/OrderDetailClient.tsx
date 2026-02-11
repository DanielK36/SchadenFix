"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { mockAdminOrders } from "@/lib/mock/adminData"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

const statusLabels: Record<string, string> = {
  neu: "Neu",
  bearbeitung: "In Bearbeitung",
  angebot: "KVA versendet",
  genehmigt: "Vom Kunden angenommen",
  abgeschlossen: "Abgeschlossen",
  storniert: "Storniert",
}

type AnyOrder = any

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const { isDemoMode } = useDemoMode()
  const [order, setOrder] = useState<AnyOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assigning, setAssigning] = useState(false)

  const customer = useMemo(() => (order?.customer_data as any) || null, [order])
  // Single source of truth: orders.customer_data.claim (no fallback needed)
  const claim = useMemo(() => {
    return (customer as any)?.claim || null
  }, [customer])
  // Photos are stored in customer_data.photos or customer_data.claim.photos
  const claimPhotos = useMemo(() => {
    if (customer?.photos && Array.isArray(customer.photos)) {
      return customer.photos
    }
    if ((claim as any)?.photos && Array.isArray((claim as any).photos)) {
      return (claim as any).photos
    }
    return []
  }, [customer, claim])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (!orderId) {
          throw new Error("Missing orderId")
        }

        if (isDemoMode) {
          const found = mockAdminOrders.find((o) => o.id === orderId) || null
          setOrder(found)
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!data?.success) {
          throw new Error(data?.error || "Failed to load order")
        }
        console.log("📦 Order data loaded:", {
          orderId: data.order?.id,
          assigned_to: data.order?.assigned_to,
          assigned_partner_id: data.order?.assigned_partner_id,
          assigned_profile: data.order?.assigned_profile,
          assigned_partner: data.order?.assigned_partner,
        })
        setOrder(data.order || null)
      } catch (e: any) {
        setError(e?.message || "Unbekannter Fehler")
        // In real mode, don't silently fall back to mock data (it hides auth/data issues).
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isDemoMode, orderId])

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-slate-600">
          Lade Auftrag...
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Auftrag nicht gefunden</h1>
          <p className="text-slate-600 mt-1">ID: <span className="font-mono">{orderId}</span></p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <p className="text-slate-700">Der Auftrag existiert nicht oder du hast keine Berechtigung.</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <Link href="/admin/orders" className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium">
            ← Zurück zur Liste
          </Link>
        </div>
      </div>
    )
  }

  async function autoAssign() {
    if (isDemoMode) {
      alert("Demo: Auto-Zuweisung ist deaktiviert.")
      return
    }
    setAssigning(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch("/api/admin/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ mode: "auto", orderId: order.id }),
      })
      const data = await res.json()
      if (!data?.success) throw new Error(data?.error || "Auto-Assign failed")
      setOrder((prev: any) => (prev ? { ...prev, assigned_partner_id: data.assigned_partner_id } : prev))
      alert("Partner automatisch zugewiesen.")
    } catch (e: any) {
      alert(e?.message || "Fehler bei Auto-Zuweisung")
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order Detail</h1>
          <p className="text-slate-600 mt-2">
            ID: <span className="font-mono">{order.id}</span>
          </p>
          {error && <p className="text-sm text-amber-700 mt-2">Hinweis: {error} (Fallback aktiv)</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/orders" className="text-slate-600 hover:text-slate-900">
            ← Liste
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900">Kunde</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Name</p>
              <p className="text-slate-900">{customer?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Kontakt</p>
              <p className="text-slate-900">{customer?.email || customer?.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">PLZ</p>
              <p className="text-slate-900 font-mono">{claim?.plz || customer?.zip || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Adresse</p>
              <p className="text-slate-900">{claim?.locationText || customer?.address || "—"}</p>
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mt-8">Auftrag</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Typ</p>
              <p className="text-slate-900">{order.type}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Status</p>
              <p className="text-slate-900">{statusLabels[order.status] ?? order.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Eingang</p>
              <p className="text-slate-900">
                {order.created_at ? new Date(order.created_at).toLocaleString("de-DE") : "—"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-slate-500">Beschreibung</p>
            <p className="text-slate-900 mt-1 whitespace-pre-wrap">{order.description || "—"}</p>
          </div>

          {(order as any).order_quote && (
            <>
              <h2 className="text-lg font-bold text-slate-900 mt-8">Angebot / KVA</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">KVA versendet</p>
                  <p className="text-slate-900">
                    {(order as any).order_quote.offer_sent_at
                      ? new Date((order as any).order_quote.offer_sent_at).toLocaleString("de-DE")
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Vom Kunden angenommen</p>
                  <p className="text-slate-900">
                    {(order as any).order_quote.customer_accepted_at
                      ? new Date((order as any).order_quote.customer_accepted_at).toLocaleString("de-DE")
                      : "—"}
                  </p>
                </div>
              </div>
            </>
          )}

          {(order as any).order_invoices && (order as any).order_invoices.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-slate-900 mt-8">Rechnungen</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-slate-600">Erstellt</th>
                      <th className="text-right py-2 text-slate-600">Betrag</th>
                      <th className="text-left py-2 text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((order as any).order_invoices as any[]).map((inv: any) => (
                      <tr key={inv.id} className="border-b border-slate-100">
                        <td className="py-2 text-slate-900">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString("de-DE") : "—"}
                        </td>
                        <td className="py-2 text-right text-slate-900">
                          {inv.gross_amount != null ? Number(inv.gross_amount).toLocaleString("de-DE", { style: "currency", currency: "EUR" }) : "—"}
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            inv.status === "paid" ? "bg-green-100 text-green-800" :
                            inv.status === "sent" ? "bg-amber-100 text-amber-800" :
                            "bg-slate-100 text-slate-800"
                          }`}>
                            {inv.status === "paid" ? "Bezahlt" : inv.status === "sent" ? "Versendet" : "Entwurf"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h2 className="text-lg font-bold text-slate-900 mt-8">Schadenmeldung (Formular)</h2>
          {!claim ? (
            <div className="mt-4">
              <p className="text-slate-600">Keine Formular-Daten gefunden.</p>
              <p className="text-xs text-slate-500 mt-2">
                Erwartet: <code className="bg-slate-100 px-1 rounded">orders.customer_data.claim</code>
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Ticket</p>
                  <p className="font-mono text-slate-900">{claim.ticketId || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Schadentyp</p>
                  <p className="text-slate-900">{claim.type || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Zeitpunkt</p>
                  <p className="text-slate-900">
                    {claim.occurredAt ? new Date(claim.occurredAt).toLocaleString("de-DE") : "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">PLZ</p>
                  <p className="font-mono text-slate-900">{claim.plz || "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Ort/Adresse</p>
                  <p className="text-slate-900">{claim.locationText || "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Wunsch</p>
                <p className="text-slate-900">
                  {Array.isArray(claim.wish) && claim.wish.length > 0 ? claim.wish.join(", ") : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Fotos</p>
                <p className="text-slate-900">
                  {Array.isArray(claimPhotos) && claimPhotos.length > 0 ? `${claimPhotos.length} Datei(en)` : "—"}
                </p>
              </div>

              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-900">
                  Rohdaten anzeigen (JSON)
                </summary>
                <pre className="mt-3 text-xs bg-slate-50 border border-slate-200 rounded-md p-3 overflow-auto">
                  {JSON.stringify(claim, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900">Zuweisung</h2>
          <p className="text-sm text-slate-600 mt-1">
            Die 3 Modi (Auto, Bulk, Broadcast) hängen wir im nächsten Schritt an die echten Admin-APIs.
          </p>

          <div className="mt-4 space-y-2">
            <Button
              onClick={autoAssign}
              disabled={isDemoMode || assigning}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Auto zuweisen
            </Button>
            <Button disabled variant="outline" className="w-full">
              Broadcast starten
            </Button>
            <Button disabled variant="outline" className="w-full">
              Manuell wählen
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">assigned_to (intern)</p>
              {order?.assigned_profile ? (
                <div className="mt-1">
                  <p className="text-slate-900 font-medium">{order.assigned_profile.company_name || "—"}</p>
                  <p className="text-xs text-slate-500 font-mono">{order.assigned_to}</p>
                  {order.assigned_profile.role && (
                    <p className="text-xs text-slate-500">Rolle: {order.assigned_profile.role === "chef" ? "Chef" : order.assigned_profile.role === "azubi" ? "Azubi" : order.assigned_profile.role}</p>
                  )}
                </div>
              ) : order?.assigned_to ? (
                <div className="mt-1">
                  <p className="text-slate-500 font-mono text-sm">{order.assigned_to}</p>
                  <p className="text-xs text-slate-400 mt-1">Profil nicht gefunden</p>
                </div>
              ) : (
                <p className="text-slate-500 mt-1">—</p>
              )}
            </div>
            
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">assigned_partner_id (extern)</p>
              {order?.assigned_partner ? (
                <div className="mt-1">
                  <p className="text-slate-900 font-medium">{order.assigned_partner.company_name || "—"}</p>
                  <p className="text-xs text-slate-500 font-mono">{order.assigned_partner_id}</p>
                  {order.assigned_partner.email && (
                    <p className="text-xs text-slate-500">{order.assigned_partner.email}</p>
                  )}
                </div>
              ) : order?.assigned_partner_id ? (
                <div className="mt-1">
                  <p className="text-slate-500 font-mono text-sm">{order.assigned_partner_id}</p>
                  <p className="text-xs text-slate-400 mt-1">Partner nicht gefunden</p>
                </div>
              ) : (
                <p className="text-slate-500 mt-1">—</p>
              )}
            </div>
            
            {/* Debug Info */}
            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 pt-4 border-t border-slate-200">
                <summary className="text-xs text-slate-400 cursor-pointer">Debug Info</summary>
                <pre className="mt-2 text-xs bg-slate-50 p-2 rounded overflow-auto">
                  {JSON.stringify({
                    assigned_to: order?.assigned_to,
                    assigned_partner_id: order?.assigned_partner_id,
                    assigned_profile: order?.assigned_profile,
                    assigned_partner: order?.assigned_partner,
                  }, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

