"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { mockAdminOrders } from "@/lib/mock/adminData"
import { supabase } from "@/lib/supabase"

export default function AdminRadarPage() {
  const { isDemoMode } = useDemoMode()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        if (isDemoMode) {
          setOrders(mockAdminOrders)
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch("/api/admin/orders", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!data?.success) throw new Error(data?.error || "Failed to load orders")
        setOrders(data.orders || [])
      } catch (e) {
        console.warn("Could not load orders, falling back to mock.", e)
        setOrders(mockAdminOrders)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isDemoMode])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Live Radar</h1>
        <p className="text-slate-600 mt-2">Kartenansicht aller aktiven Aufträge</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <p className="text-sm text-slate-600">
            Fürs MVP: Live-Liste (PLZ/Ort) – Mapbox/Leaflet kommt später, ohne die Datenstruktur nochmal umbauen zu müssen.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Lade Radar...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-2">Keine Aufträge gefunden</p>
            <p className="text-sm text-slate-400">Sobald Schadenmeldungen eingehen, erscheinen sie hier.</p>
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
                    PLZ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Ort
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Aktion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {orders.map((o) => {
                  const c = (o.customer_data as any) || {}
                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">{String(o.id).slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{o.type}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-700">{c.zip || "—"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{c.city || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <Link
                          href={`/admin/orders/${o.id}`}
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

