"use client"

import Link from "next/link"
import { ProStatus } from "@/lib/types/pro"
import { TrendingUp, Check, FileText, ChevronRight, CheckCircle2, XCircle } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { RevenueChart } from "@/components/pro/RevenueChart"
import { AnimatedNumber } from "@/components/pro/AnimatedNumber"
import { AnimatedButton } from "@/components/pro/AnimatedButton"
import { RoutingRadar } from "@/components/pro/RoutingRadar"
import { getOrdersByCompany } from "@/services/orderService"
import { mapSupabaseOrderToProOrder } from "@/lib/mappers/orderMapper"
import type { ProOrder } from "@/lib/types/pro"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { mockOrders } from "@/lib/mock/proData"
import { supabase } from "@/lib/supabase"

type AvailabilityStatus = "AVAILABLE" | "LIMITED" | "UNAVAILABLE"

const statusLabels: Record<ProStatus, string> = {
  NEW: "Neu",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Fertig",
  CANCELLED: "Storniert",
}

const DEMO_ROUTING_LEADS = [
  { id: "lead-1", orderId: "12345", trade: "Maler", status: "accepted" as const, partnerName: "Malerbetrieb Müller", partnerRating: 4.8, distance: 2.5 },
  { id: "lead-2", orderId: "12346", trade: "Trocknung", status: "found" as const, partnerName: "Trocknungsexperten GmbH", partnerRating: 4.6, distance: 5.2 },
  { id: "lead-3", orderId: "12347", trade: "Gutachter", status: "searching" as const },
]

const DEMO_CHART = [
  { day: "Mo", revenue: 1200 },
  { day: "Di", revenue: 1500 },
  { day: "Mi", revenue: 1100 },
  { day: "Do", revenue: 1800 },
  { day: "Fr", revenue: 1400 },
  { day: "Sa", revenue: 900 },
  { day: "So", revenue: 600 },
]

const DAY_NAMES = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

function buildChartFromInvoices(invoices: { created_at: string; gross_amount: number }[]): { day: string; revenue: number }[] {
  const today = new Date()
  const out: { day: string; revenue: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dayStr = d.toISOString().split("T")[0]
    const sum = (invoices || [])
      .filter((inv) => (inv.created_at || "").startsWith(dayStr))
      .reduce((s, inv) => s + Number(inv.gross_amount || 0), 0)
    out.push({ day: DAY_NAMES[d.getDay()], revenue: sum })
  }
  return out
}

export default function ProDashboardPage() {
  const { isDemoMode } = useDemoMode()
  const [availability, setAvailability] = useState<AvailabilityStatus>("AVAILABLE")
  const [orders, setOrders] = useState<ProOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0)
  const [previousMonthRevenue, setPreviousMonthRevenue] = useState(0)
  const [revenueChartData, setRevenueChartData] = useState<{ day: string; revenue: number }[]>([])
  const [routingLeads, setRoutingLeads] = useState<typeof DEMO_ROUTING_LEADS>([])

  useEffect(() => {
    async function load() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const hasSession = Boolean(token)

        // Mock nur bei Demo ohne Login. Mit Session immer echte Daten (Monatsumsatz, Radar, Verfügbarkeit).
        if (isDemoMode && !hasSession) {
          setOrders(mockOrders)
          setCurrentMonthRevenue(8500)
          setPreviousMonthRevenue(7583.33)
          setRevenueChartData(DEMO_CHART)
          setRoutingLeads(DEMO_ROUTING_LEADS)
          setAvailability("AVAILABLE")
          setLoading(false)
          return
        }

        const [ordersRes, invoicesRes, availabilityRes] = await Promise.all([
          (async () => {
            const list = await getOrdersByCompany()
            return list.map((o: any) => mapSupabaseOrderToProOrder(o))
          })(),
          fetch("/api/pro/invoices", { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then((r) => r.json()),
          fetch("/api/pro/operations/availability", { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then((r) => r.json()),
        ])

        setOrders(Array.isArray(ordersRes) ? ordersRes : [])

        const invoices = (invoicesRes?.invoices || []) as { created_at: string; gross_amount: number }[]
        const now = new Date()
        const curYear = now.getFullYear()
        const curMonth = now.getMonth()
        const prevMonth = curMonth === 0 ? 11 : curMonth - 1
        const prevYear = curMonth === 0 ? curYear - 1 : curYear
        let curSum = 0
        let prevSum = 0
        invoices.forEach((inv) => {
          const d = new Date(inv.created_at)
          const amt = Number(inv.gross_amount || 0)
          if (d.getFullYear() === curYear && d.getMonth() === curMonth) curSum += amt
          if (d.getFullYear() === prevYear && d.getMonth() === prevMonth) prevSum += amt
        })
        setCurrentMonthRevenue(curSum)
        setPreviousMonthRevenue(prevSum)
        setRevenueChartData(buildChartFromInvoices(invoices))

        if (availabilityRes?.success && availabilityRes.status) {
          setAvailability(availabilityRes.status as AvailabilityStatus)
        }
        setRoutingLeads([])
      } catch (error) {
        console.error("Failed to load dashboard:", error)
        if (!isDemoMode) {
          setOrders([])
          setCurrentMonthRevenue(0)
          setPreviousMonthRevenue(0)
          setRevenueChartData([])
          setRoutingLeads([])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isDemoMode])

  const openOrders = useMemo(() => orders.filter((o) => o.status === "NEW"), [orders])
  const todayScheduled = useMemo(() => {
    const today = new Date()
    return orders.filter((order) => {
      if (!order.scheduledAt) return false
      const s = new Date(order.scheduledAt)
      return s.getDate() === today.getDate() && s.getMonth() === today.getMonth() && s.getFullYear() === today.getFullYear()
    })
  }, [orders])

  const revenueTrend = previousMonthRevenue ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0
  const activeOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === "NEW" || o.status === "IN_PROGRESS")
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [orders]
  )

  const setAvailabilityAndSave = async (status: AvailabilityStatus) => {
    setAvailability(status)
    if (isDemoMode) return
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      await fetch("/api/pro/operations/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status }),
      })
    } catch (e) {
      console.warn("Failed to save availability", e)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10">
      {/* Desktop: Single Grid Layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 h-full">
        {/* Left Column: Main Content (2/3 width) */}
        <div className="md:col-span-2 flex flex-col space-y-6 h-full">
          {/* Monatsumsatz & Trend - Premium */}
          <div className="pro-card bg-gradient-to-br from-white via-slate-50/30 to-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#B8903A]/5 to-transparent rounded-full blur-3xl"></div>
            <div className="relative">
              <p className="pro-body-small text-slate-500 mb-4 font-semibold uppercase tracking-wider text-xs">Monatsumsatz</p>
              <p className="pro-kpi-large mb-6">
                <AnimatedNumber
                  value={currentMonthRevenue}
                  duration={1.2}
                  prefix="€ "
                  decimals={0}
                />
              </p>
              <div className="mt-6 h-24">
                <RevenueChart
                  data={revenueChartData.length ? revenueChartData : DAY_NAMES.map((d) => ({ day: d, revenue: 0 }))}
                  height={96}
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                </div>
                <span className="pro-body-small text-[#10B981] font-semibold">
                  {revenueTrend >= 0 ? "+" : ""}{revenueTrend.toFixed(0)}% vs. Vormonat
                </span>
              </div>
            </div>
          </div>

          {/* Aktive Aufträge */}
          <div className="pro-card flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="pro-h2">Aktive Aufträge</h2>
              <Link href="/pro/orders" className="text-sm text-[#3B82F6] hover:underline">
                Alle anzeigen
              </Link>
            </div>
            <div className="overflow-x-auto flex-1">
              {activeOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">Keine aktiven Aufträge</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#EAEAEA]">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#6B7280] uppercase">
                        Kunde
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#6B7280] uppercase">
                        Aufgabe
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#6B7280] uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="pro-table-row border-b border-[#EAEAEA] cursor-pointer"
                      onClick={() => (window.location.href = `/pro/orders/${order.id}`)}
                    >
                      <td className="py-3 px-3">
                        <span className="pro-body font-medium text-slate-900">{order.customerName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="pro-body-small text-slate-500 line-clamp-1">
                          {order.description}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm border ${
                            order.status === "NEW"
                              ? "bg-blue-50 text-blue-700 border-blue-200/50"
                              : order.status === "IN_PROGRESS"
                                ? "bg-amber-50 text-amber-700 border-amber-200/50"
                                : "bg-green-50 text-green-700 border-green-200/50"
                          }`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status Widgets (1/3 width) */}
        <div className="md:col-span-1 space-y-6">
          {/* Status & Quick-Stats (Kombiniert) */}
          <div className="pro-card">
            {/* Verfügbarkeit - Premium Design */}
            <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl mb-6 border border-slate-100">
              <h3 className="pro-h2 mb-4">Verfügbarkeit</h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setAvailabilityAndSave("AVAILABLE")}
                  className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    availability === "AVAILABLE"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-[1.02]"
                      : "bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verfügbar</span>
                  </div>
                </button>
                <button
                  onClick={() => setAvailabilityAndSave("LIMITED")}
                  className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    availability === "LIMITED"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]"
                      : "bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <XCircle className="w-4 h-4" />
                    <span>Eingeschränkt</span>
                  </div>
                </button>
                <button
                  onClick={() => setAvailabilityAndSave("UNAVAILABLE")}
                  className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    availability === "UNAVAILABLE"
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 scale-[1.02]"
                      : "bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <XCircle className="w-4 h-4" />
                    <span>Pause</span>
                  </div>
                </button>
              </div>
            </div>
            {/* Quick-Stats - Unten */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#EAEAEA]">
              <div>
                <p className="text-xs uppercase text-slate-400 mb-2 tracking-wide">Offene</p>
                <p className="text-3xl font-bold text-slate-900">
                  <AnimatedNumber value={openOrders.length} duration={1.2} decimals={0} />
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400 mb-2 tracking-wide">Heute</p>
                <p className="text-3xl font-bold text-slate-900">
                  <AnimatedNumber value={todayScheduled.length} duration={1.2} decimals={0} />
                </p>
              </div>
            </div>
          </div>

          {/* Vermittlungs-Radar Widget */}
          <RoutingRadar leads={routingLeads} />
        </div>
      </div>

      {/* Mobile: Layout v4 */}
      <div className="md:hidden space-y-4">
        {/* Verfügbarkeits-Anzeige */}
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
          <span className="text-sm font-medium text-slate-900">Verfügbar</span>
        </div>

        {/* Umsatztrend-Chart - Modern Clean SaaS */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-1">Umsatztrend</h3>
          <p className="text-xs text-slate-500 mb-3">(letzte 7 Tage)</p>
          <div className="h-32">
            <RevenueChart
              data={revenueChartData.length ? revenueChartData : DAY_NAMES.map((d) => ({ day: d, revenue: 0 }))}
              height={128}
            />
          </div>
        </div>

        {/* KPI-Karten - Modern Clean SaaS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-4xl font-bold text-slate-900 mb-1">
              <AnimatedNumber value={openOrders.length} duration={1.2} decimals={0} />
            </p>
            <p className="text-sm text-slate-500 font-normal">Offene Aufträge</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-4xl font-bold text-slate-900 mb-1">
              <AnimatedNumber value={todayScheduled.length} duration={1.2} decimals={0} />
            </p>
            <p className="text-sm text-slate-500 font-normal">Heute fällig</p>
          </div>
        </div>

        {/* Action-Buttons - Modern Clean SaaS */}
        <div className="grid grid-cols-2 gap-3">
          <AnimatedButton
            onClick={async () => {
              // Find first available order (NEW status, not assigned)
              const availableOrder = activeOrders.find(o => o.status === "NEW" && !o.assigned_to)
              if (availableOrder) {
                try {
                  const res = await fetch(`/api/pro/orders/${availableOrder.id}/accept`, {
                    method: "POST",
                  })
                  const data = await res.json()
                  if (data.success) {
                    window.location.href = `/pro/orders/${availableOrder.id}`
                  } else {
                    alert(data.error || "Fehler beim Annehmen des Auftrags")
                  }
                } catch (error) {
                  console.error("Error accepting order:", error)
                  alert("Fehler beim Annehmen des Auftrags")
                }
              } else {
                // No available orders, go to orders page
                window.location.href = "/pro/orders"
              }
            }}
            className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors min-h-[44px] shadow-sm"
          >
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Auftrag annehmen</span>
          </AnimatedButton>
          <AnimatedButton
            onClick={() => (window.location.href = "/pro/invoices/new")}
            className="bg-white border-2 border-slate-200 text-slate-900 rounded-xl p-4 flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors min-h-[44px] shadow-sm"
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">Rechnung erstellen</span>
          </AnimatedButton>
        </div>

        {/* Aktive Aufträge Liste - Modern Clean SaaS */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">Aktive Aufträge</h3>
          {activeOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">Keine aktiven Aufträge</p>
            </div>
          ) : (
            activeOrders.map((order) => (
            <Link
              key={order.id}
              href={`/pro/orders/${order.id}`}
              className="block bg-white rounded-xl p-3 shadow-sm border border-slate-200 active:scale-[0.98] transition-transform hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{order.customerName}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        order.status === "NEW"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {order.description} • {new Date(order.createdAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
              </div>
            </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
