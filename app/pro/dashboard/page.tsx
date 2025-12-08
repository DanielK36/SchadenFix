"use client"

import Link from "next/link"
import { ProStatus, DamageType } from "@/lib/types/pro"
import { TrendingUp, Check, FileText, ChevronRight, CheckCircle2, XCircle } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { RevenueChart } from "@/components/pro/RevenueChart"
import { AnimatedNumber } from "@/components/pro/AnimatedNumber"
import { AnimatedButton } from "@/components/pro/AnimatedButton"
import { RoutingRadar } from "@/components/pro/RoutingRadar"
import { getOrdersByCompany, getOrdersByStatus } from "@/services/orderService"
import { mapSupabaseOrderToProOrder } from "@/lib/mappers/orderMapper"
import type { ProOrder } from "@/lib/types/pro"

type AvailabilityStatus = "AVAILABLE" | "LIMITED" | "UNAVAILABLE"

// Mock performance data (can be replaced later with real data)
const mockPerformance = {
  averageRating: 4.8,
  averageResponseTime: 45,
}

const statusLabels: Record<ProStatus, string> = {
  NEW: "Neu",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Fertig",
  CANCELLED: "Storniert",
}

export default function ProDashboardPage() {
  const [availability, setAvailability] = useState<AvailabilityStatus>("AVAILABLE")
  const [orders, setOrders] = useState<ProOrder[]>([])
  const [loading, setLoading] = useState(true)

  // Load orders from Supabase
  useEffect(() => {
    async function loadOrders() {
      try {
        const supabaseOrders = await getOrdersByCompany()
        const mappedOrders = supabaseOrders.map(mapSupabaseOrderToProOrder)
        setOrders(mappedOrders)
      } catch (error) {
        console.error("Failed to load orders:", error)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const openOrders = useMemo(() => {
    return orders.filter((o) => o.status === "NEW")
  }, [orders])

  const todayScheduled = useMemo(() => {
    return orders.filter((order) => {
      if (!order.scheduledAt) return false
      const scheduled = new Date(order.scheduledAt)
      const today = new Date()
      return (
        scheduled.getDate() === today.getDate() &&
        scheduled.getMonth() === today.getMonth() &&
        scheduled.getFullYear() === today.getFullYear()
      )
    })
  }, [orders])

  const currentMonthRevenue = 8500.0
  const previousMonthRevenue = 7583.33
  const revenueTrend = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100

  // Get top 5 most urgent orders
  const topOrders = useMemo(() => {
    const allOpen = orders.filter((o) => o.status === "NEW" || o.status === "IN_PROGRESS")
    return allOpen
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 5)
  }, [orders])

  // Mock routing leads for dashboard widget
  const routingLeads = [
    {
      id: "lead-1",
      orderId: "12345",
      trade: "Maler",
      status: "accepted" as const,
      partnerName: "Malerbetrieb Müller",
      partnerRating: 4.8,
      distance: 2.5,
    },
    {
      id: "lead-2",
      orderId: "12346",
      trade: "Trocknung",
      status: "found" as const,
      partnerName: "Trocknungsexperten GmbH",
      partnerRating: 4.6,
      distance: 5.2,
    },
    {
      id: "lead-3",
      orderId: "12347",
      trade: "Gutachter",
      status: "searching" as const,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Desktop: Single Grid Layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 h-full">
        {/* Left Column: Main Content (2/3 width) */}
        <div className="md:col-span-2 flex flex-col space-y-6 h-full">
          {/* Monatsumsatz & Trend */}
          <div className="pro-card">
            <p className="pro-body-small text-slate-500 mb-2">Monatsumsatz</p>
            <p className="text-[48px] font-bold text-slate-900 mb-2">
              <AnimatedNumber
                value={currentMonthRevenue}
                duration={1.2}
                prefix="€ "
                decimals={0}
              />
            </p>
            <div className="mt-4 h-20">
              <RevenueChart
                data={[
                  { day: "Mo", revenue: 1200 },
                  { day: "Di", revenue: 1500 },
                  { day: "Mi", revenue: 1100 },
                  { day: "Do", revenue: 1800 },
                  { day: "Fr", revenue: 1400 },
                  { day: "Sa", revenue: 900 },
                  { day: "So", revenue: 600 },
                ]}
                height={80}
              />
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#22C55E]" />
              <span className="pro-body-small text-[#22C55E]">
                +{revenueTrend.toFixed(0)}% vs. Vormonat
              </span>
            </div>
          </div>

          {/* Dringendste Aufträge */}
          <div className="pro-card flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="pro-h2">Dringendste Aufträge</h2>
              <Link href="/pro/orders" className="text-sm text-[#3B82F6] hover:underline">
                Alle anzeigen
              </Link>
            </div>
            <div className="overflow-x-auto flex-1">
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
                  {topOrders.map((order) => (
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
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            order.status === "NEW"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "IN_PROGRESS"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Status Widgets (1/3 width) */}
        <div className="md:col-span-1 space-y-6">
          {/* Status & Quick-Stats (Kombiniert) */}
          <div className="pro-card">
            {/* Verfügbarkeit - Oben mit Hintergrund */}
            <div className="bg-slate-50 p-3 rounded-lg mb-4">
              <h3 className="pro-h2 mb-3">Verfügbarkeit</h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setAvailability("AVAILABLE")}
                  className={`py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    availability === "AVAILABLE"
                      ? "bg-green-500 text-white shadow-md scale-[1.02]"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verfügbar</span>
                  </div>
                </button>
                <button
                  onClick={() => setAvailability("LIMITED")}
                  className={`py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    availability === "LIMITED"
                      ? "bg-orange-500 text-white shadow-md scale-[1.02]"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <XCircle className="w-4 h-4" />
                    <span>Eingeschränkt</span>
                  </div>
                </button>
                <button
                  onClick={() => setAvailability("UNAVAILABLE")}
                  className={`py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    availability === "UNAVAILABLE"
                      ? "bg-red-500 text-white shadow-md scale-[1.02]"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
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

          {/* Performance Widget */}
          <div className="pro-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="pro-h2">Performance</h3>
              <Link href="/pro/performance" className="text-sm text-[#3B82F6] hover:underline">
                Details
              </Link>
            </div>
            <div className="space-y-3">
              <div>
                <p className="pro-body-small text-slate-500 mb-1">Bewertung</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-slate-900">
                    <AnimatedNumber value={mockPerformance.averageRating} duration={1.2} decimals={1} />
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={
                          star <= mockPerformance.averageRating ? "text-yellow-400" : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="pro-body-small text-slate-500 mb-1">Reaktionszeit</p>
                <p className="text-xl font-bold text-slate-900">
                  {Math.floor(mockPerformance.averageResponseTime / 60)} Std.{" "}
                  {mockPerformance.averageResponseTime % 60} Min.
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
              data={[
                { day: "Mo", revenue: 1200 },
                { day: "Di", revenue: 1500 },
                { day: "Mi", revenue: 1100 },
                { day: "Do", revenue: 1800 },
                { day: "Fr", revenue: 1400 },
                { day: "Sa", revenue: 900 },
                { day: "So", revenue: 600 },
              ]}
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
            onClick={() => (window.location.href = "/pro/orders")}
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

        {/* Offene Aufträge Liste - Modern Clean SaaS */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">Offene Aufträge</h3>
          {topOrders.map((order) => (
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
                            ? "bg-yellow-100 text-yellow-700"
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
          ))}
        </div>
      </div>
    </div>
  )
}
