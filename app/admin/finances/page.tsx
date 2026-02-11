"use client"

import { useEffect, useMemo, useState } from "react"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { mockAdminInvoices } from "@/lib/mock/adminData"
import { supabase } from "@/lib/supabase"

export default function AdminFinancesPage() {
  const { isDemoMode } = useDemoMode()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const totals = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid")
    const pending = invoices.filter((i) => i.status !== "paid")
    const sumPaid = paid.reduce((s, i) => s + (parseFloat(i.gross_amount || "0") || 0), 0)
    const sumAll = invoices.reduce((s, i) => s + (parseFloat(i.gross_amount || "0") || 0), 0)
    return { sumPaid, sumAll, paidCount: paid.length, pendingCount: pending.length }
  }, [invoices])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        if (isDemoMode) {
          setInvoices(mockAdminInvoices)
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch("/api/admin/invoices", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!data?.success) throw new Error(data?.error || "Failed to load invoices")
        setInvoices(data.invoices || [])
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load invoices"
        console.warn("Could not load invoices:", e)
        setLoadError(msg)
        setInvoices([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isDemoMode])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Finanzen</h1>
        <p className="text-slate-600 mt-2">Provisionen und Umsatzübersicht</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600">Paid Umsatz</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {loading ? "..." : `${totals.sumPaid.toFixed(2)} €`}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600">Rechnungen</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {loading ? "..." : invoices.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600">Offen</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {loading ? "..." : totals.pendingCount}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Lade Rechnungen...</div>
        ) : loadError ? (
          <div className="p-12 text-center">
            <p className="text-slate-900 font-medium mb-2">Rechnungen konnten nicht geladen werden</p>
            <p className="text-sm text-red-600">{loadError}</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-2">Keine Rechnungen gefunden</p>
            <p className="text-sm text-slate-400">Sobald Aufträge abgerechnet werden, erscheinen sie hier.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-mono">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-mono">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Betrag (brutto)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-mono text-slate-900">{String(inv.id).slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-700">{String(inv.order_id || "").slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{parseFloat(inv.gross_amount || "0").toFixed(2)} €</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          inv.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {inv.created_at ? new Date(inv.created_at).toLocaleDateString("de-DE") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

