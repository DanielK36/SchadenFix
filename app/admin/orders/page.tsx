"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { mockAdminOrders } from "@/lib/mock/adminData"
import { supabase } from "@/lib/supabase"

const statusLabels: Record<string, string> = {
  neu: "Neu",
  bearbeitung: "In Bearbeitung",
  angebot: "KVA versendet",
  genehmigt: "Vom Kunden angenommen",
  abgeschlossen: "Abgeschlossen",
  storniert: "Storniert",
}

export default function AdminOrdersPage() {
  const { isDemoMode } = useDemoMode()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoadError(null)
        if (isDemoMode) {
          // Use mock data in demo mode
          setOrders(mockAdminOrders)
        } else {
          const { data: sessionData } = await supabase.auth.getSession()
          const token = sessionData.session?.access_token
          const response = await fetch("/api/admin/orders", {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          })
          const data = await response.json()

          if (!data.success) {
            throw new Error(data.error || "Failed to load orders")
          }

          setOrders(data.orders || [])
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to load orders"
        console.error("Failed to load orders:", error)
        setLoadError(msg)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [isDemoMode])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Alle Aufträge</h1>
        <p className="text-slate-600 mt-2">Systemweite Übersicht aller Orders</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Lade Aufträge...</div>
        ) : loadError ? (
          <div className="p-12 text-center">
            <p className="text-slate-900 font-medium mb-2">Aufträge konnten nicht geladen werden</p>
            <p className="text-sm text-red-600">{loadError}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-2">Keine Aufträge gefunden</p>
            <p className="text-sm text-slate-400">Erstelle eine Schadenmeldung um Aufträge zu sehen</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-mono">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Kunde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Erstellt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Aktion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {orders.map((order) => {
                  const customerData = order.customer_data as any
                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-slate-900">{order.id.slice(0, 8)}...</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{order.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {customerData?.name || "Unbekannt"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "abgeschlossen" ? "bg-green-100 text-green-800" :
                          order.status === "storniert" ? "bg-red-100 text-red-800" :
                          order.status === "neu" ? "bg-blue-100 text-blue-800" :
                          "bg-slate-100 text-slate-800"
                        }`}>
                          {statusLabels[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(order.created_at).toLocaleDateString("de-DE")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

