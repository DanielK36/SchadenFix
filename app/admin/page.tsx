"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, TrendingUp, Users, DollarSign, Package } from "lucide-react"
import { getOrdersByCompany } from "@/services/orderService"
import { supabase } from "@/lib/supabase"

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState({
    openOrders: 0,
    activePartners: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
  })
  const [problemOrders, setProblemOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Load all orders (not just company-specific)
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("status", "neu")
          .order("created_at", { ascending: true })

        if (ordersError) throw ordersError

        // Count open orders
        const openOrders = orders?.length || 0

        // Count active partners
        const { data: partners, error: partnersError } = await supabase
          .from("partners")
          .select("id")
          .eq("is_verified", true)

        if (partnersError) throw partnersError
        const activePartners = partners?.length || 0

        // Calculate monthly revenue (from invoices)
        const { data: invoices, error: invoicesError } = await supabase
          .from("invoices")
          .select("gross_amount")
          .eq("status", "paid")
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

        if (invoicesError) throw invoicesError
        const monthlyRevenue = invoices?.reduce((sum, inv) => sum + (parseFloat(inv.gross_amount) || 0), 0) || 0

        // Calculate conversion rate (approved / total offers)
        const { data: approvedOrders } = await supabase
          .from("orders")
          .select("id")
          .eq("status", "genehmigt")

        const { data: totalOffers } = await supabase
          .from("orders")
          .select("id")
          .eq("status", "angebot")

        const conversionRate = totalOffers && totalOffers.length > 0
          ? ((approvedOrders?.length || 0) / totalOffers.length) * 100
          : 0

        setKpis({
          openOrders,
          activePartners,
          monthlyRevenue,
          conversionRate: Math.round(conversionRate),
        })

        // Find problem orders (new for > 24h)
        const now = new Date()
        const problemOrdersList = (orders || []).filter((order) => {
          const createdAt = new Date(order.created_at)
          const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
          return hoursDiff > 24
        })

        setProblemOrders(problemOrdersList)
      } catch (error) {
        console.error("Failed to load admin data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">Systemübersicht & Problem-Monitor</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Offene Aufträge</span>
            <Package className={`w-5 h-5 ${kpis.openOrders > 5 ? "text-red-500" : "text-slate-400"}`} />
          </div>
          <p className={`text-3xl font-bold font-mono ${kpis.openOrders > 5 ? "text-red-600" : "text-slate-900"}`}>
            {loading ? "..." : kpis.openOrders}
          </p>
          {kpis.openOrders > 5 && (
            <p className="text-xs text-red-600 mt-2">⚠️ Action Required</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Aktive Partner</span>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-slate-900">
            {loading ? "..." : kpis.activePartners}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Umsatz diesen Monat</span>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-slate-900">
            {loading ? "..." : `${kpis.monthlyRevenue.toFixed(2)} €`}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Conversion Rate</span>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-slate-900">
            {loading ? "..." : `${kpis.conversionRate}%`}
          </p>
        </div>
      </div>

      {/* Problem Monitor */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-slate-900">Problem-Monitor</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Aufträge im Status "Neu" seit mehr als 24 Stunden ohne Partner-Zuweisung
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-slate-500">Lade Daten...</p>
          ) : problemOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">✅ Keine Probleme gefunden</p>
              <p className="text-sm text-slate-400 mt-2">Alle Aufträge sind zugewiesen</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-mono">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Typ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Kunde
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Eingang
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Alter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Aktion
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {problemOrders.map((order) => {
                    const createdAt = new Date(order.created_at)
                    const hoursDiff = Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60))
                    const customerData = order.customer_data as any
                    return (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-mono text-slate-900">{order.id.slice(0, 8)}...</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{order.type}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{customerData?.name || "Unbekannt"}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {createdAt.toLocaleDateString("de-DE")} {createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600 font-medium">{hoursDiff} Std.</td>
                        <td className="px-4 py-3 text-sm">
                          <button className="text-blue-600 hover:text-blue-800 font-medium">
                            Zuweisen →
                          </button>
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
    </div>
  )
}

