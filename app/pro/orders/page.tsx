"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProStatus, DamageType } from "@/lib/types/pro"
import { CarFront, SquareStack, Waves, Flame, Building, Scale, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/pro/EmptyState"
import { getOrdersByCompany } from "@/services/orderService"
import { mapSupabaseOrderToProOrder } from "@/lib/mappers/orderMapper"
import type { ProOrder } from "@/lib/types/pro"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { mockOrders } from "@/lib/mock/proData"

const damageTypeIcons: Record<DamageType, typeof CarFront> = {
  KFZ: CarFront,
  GLAS: SquareStack,
  WASSER: Waves,
  FEUER: Flame,
  GEBAEUDE: Building,
  RECHTSFALL: Scale,
}

const damageTypeColors: Record<DamageType, string> = {
  KFZ: "text-[#B8903A]",
  GLAS: "text-cyan-500",
  WASSER: "text-blue-500",
  FEUER: "text-orange-500",
  GEBAEUDE: "text-purple-500",
  RECHTSFALL: "text-gray-600",
}

/** Schritt-Labels (DB-Status → Anzeige), abgestimmt auf den automatischen Status-Flow */
const stepLabels: Record<string, string> = {
  neu: "Neu",
  bearbeitung: "In Bearbeitung",
  angebot: "KVA versendet",
  warte_auf_kunde: "KVA versendet",
  genehmigt: "Vom Kunden angenommen",
  abgeschlossen: "Abgeschlossen",
  storniert: "Storniert",
}

const stepColors: Record<string, string> = {
  neu: "bg-blue-100 text-blue-700",
  bearbeitung: "bg-amber-100 text-amber-800",
  angebot: "bg-sky-100 text-sky-700",
  warte_auf_kunde: "bg-sky-100 text-sky-700",
  genehmigt: "bg-emerald-100 text-emerald-700",
  abgeschlossen: "bg-green-100 text-green-700",
  storniert: "bg-red-100 text-red-700",
}

/** Offene Schritte (für Tab „Offene Aufträge“) – „kva“ fasst angebot + warte_auf_kunde zusammen */
const OPEN_STEPS = ["neu", "bearbeitung", "kva", "genehmigt"] as const
/** Abgeschlossene Schritte (für Tab „Abgeschlossene Aufträge“) */
const CLOSED_STEPS = ["abgeschlossen", "storniert"] as const

stepLabels["kva"] = "KVA versendet"
stepColors["kva"] = "bg-sky-100 text-sky-700"

function getOrderStep(order: ProOrder): string {
  if (order.statusDb) return order.statusDb
  // Fallback für Mock-Daten (ProStatus → DB-Schritt)
  const map: Record<ProStatus, string> = {
    NEW: "neu",
    IN_PROGRESS: "bearbeitung",
    DONE: "abgeschlossen",
    CANCELLED: "storniert",
  }
  return map[order.status] ?? "neu"
}

export default function ProOrdersPage() {
  const router = useRouter()
  const { isDemoMode } = useDemoMode()
  const [selectedSteps, setSelectedSteps] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<DamageType[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [orders, setOrders] = useState<ProOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [listTab, setListTab] = useState<"offen" | "abgeschlossen">("offen")

  // Load orders: real data from Supabase when not in demo mode; mock only in demo
  useEffect(() => {
    async function loadOrders() {
      try {
        if (isDemoMode) {
          setOrders(mockOrders)
          return
        }
        const supabaseOrders = await getOrdersByCompany()
        const mappedOrders = supabaseOrders.map(mapSupabaseOrderToProOrder)
        setOrders(mappedOrders)
      } catch (error) {
        console.error("Failed to load orders:", error)
        if (!isDemoMode) {
          setOrders([])
        }
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [isDemoMode])

  // Beim Tab-Wechsel nur Schritte beibehalten, die zum Tab passen
  useEffect(() => {
    const stepsForTab = listTab === "offen" ? OPEN_STEPS : CLOSED_STEPS
    setSelectedSteps((prev) => prev.filter((s) => (stepsForTab as readonly string[]).includes(s)))
  }, [listTab])

  const filteredOrders = orders.filter((order) => {
    const step = getOrderStep(order)
    const isAbgeschlossen = step === "abgeschlossen" || step === "storniert"
    if (listTab === "offen") {
      if (isAbgeschlossen) return false
    } else {
      if (!isAbgeschlossen) return false
    }
    if (selectedSteps.length > 0) {
      const stepMatches = selectedSteps.some((s) =>
        s === "kva" ? (step === "angebot" || step === "warte_auf_kunde") : s === step
      )
      if (!stepMatches) return false
    }
    if (selectedTypes.length > 0 && !selectedTypes.includes(order.damageType)) return false
    if (dateFrom) {
      const orderDate = new Date(order.createdAt)
      if (orderDate < new Date(dateFrom)) return false
    }
    if (dateTo) {
      const orderDate = new Date(order.createdAt)
      const toEnd = new Date(dateTo)
      toEnd.setHours(23, 59, 59, 999)
      if (orderDate > toEnd) return false
    }
    return true
  })

  const toggleStep = (step: string) => {
    setSelectedSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    )
  }

  const toggleType = (type: DamageType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  return (
    <div className="space-y-8 md:space-y-10 lg:space-y-12 max-w-[1600px] mx-auto">
      <div>
        <h1 className="pro-h1">Aufträge</h1>
        <p className="pro-body-small mt-1 text-slate-500">Alle Aufträge verwalten und bearbeiten</p>
      </div>

      {/* Tabs: Offene / Abgeschlossene Aufträge */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setListTab("offen")}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            listTab === "offen" ? "bg-white border border-b-0 border-slate-200 text-slate-900 -mb-px" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Offene Aufträge
        </button>
        <button
          type="button"
          onClick={() => setListTab("abgeschlossen")}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            listTab === "abgeschlossen" ? "bg-white border border-b-0 border-slate-200 text-slate-900 -mb-px" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Abgeschlossene Aufträge
        </button>
      </div>

      {/* Filters - Mobile: Collapsible, kompakt */}
      <div className="md:hidden">
        <details className="pro-card py-2 px-3">
          <summary className="text-sm font-semibold text-slate-700 cursor-pointer list-none flex items-center justify-between py-1">
            <span>Filter</span>
            <span className="text-xs text-[#6B7280]">▼</span>
          </summary>
          <div className="mt-2 space-y-2 pt-2 border-t border-[#EAEAEA]">
            <div>
              <label className="text-xs font-medium text-[#1A1A1A] block mb-1">Schritt</label>
              <div className="flex flex-wrap gap-2">
                {(listTab === "offen" ? OPEN_STEPS : CLOSED_STEPS).map((step) => (
                  <button
                    key={step}
                    onClick={() => toggleStep(step)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                      selectedSteps.includes(step)
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-[#F7F7F7] text-[#6B7280]"
                    }`}
                  >
                    {stepLabels[step] ?? step}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1A1A] block mb-1">Typ</label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries({
                  KFZ: "KFZ",
                  GLAS: "Glas",
                  WASSER: "Wasser",
                  FEUER: "Feuer",
                  GEBAEUDE: "Gebäude",
                  RECHTSFALL: "Rechtsfall",
                }).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type as DamageType)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                      selectedTypes.includes(type as DamageType)
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-[#F7F7F7] text-[#6B7280]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[#6B7280] block mb-0.5">Von</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white text-xs h-8"
                />
              </div>
              <div>
                <label className="text-xs text-[#6B7280] block mb-0.5">Bis</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white text-xs h-8"
                />
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Filters - Desktop: eingeklappt, kompakt */}
      <details className="hidden md:block pro-card group/details py-2 px-4">
        <summary className="text-sm font-semibold text-slate-700 cursor-pointer list-none flex items-center justify-between py-1">
          <span>Filter</span>
          <span className="text-slate-500 text-xs transition-transform group-open/details:rotate-180">▼</span>
        </summary>
        <div className="mt-2 space-y-2 pt-2 border-t border-[#EAEAEA]">
          <div>
            <label className="text-xs font-medium text-[#1A1A1A] block mb-1">Schritt</label>
            <div className="flex flex-wrap gap-1.5">
              {(listTab === "offen" ? OPEN_STEPS : CLOSED_STEPS).map((step) => (
                <button
                  key={step}
                  onClick={() => toggleStep(step)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                    selectedSteps.includes(step)
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-[#F7F7F7] text-[#6B7280] hover:bg-[#EAEAEA]"
                  }`}
                >
                  {stepLabels[step] ?? step}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#1A1A1A] block mb-1">Typ</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries({
                KFZ: "KFZ",
                GLAS: "Glas",
                WASSER: "Wasser",
                FEUER: "Feuer",
                GEBAEUDE: "Gebäude",
                RECHTSFALL: "Rechtsfall",
              }).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => toggleType(type as DamageType)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                    selectedTypes.includes(type as DamageType)
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-[#F7F7F7] text-[#6B7280] hover:bg-[#EAEAEA]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-[#6B7280] block mb-0.5">Von</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-white text-sm h-9"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B7280] block mb-0.5">Bis</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-white text-sm h-9"
              />
            </div>
          </div>
        </div>
      </details>

      {/* Orders List - Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="pro-card">
            <EmptyState
              title="Noch keine Aufträge"
              subtitle="Sobald neue Aufträge eingehen, erscheinen sie hier."
            />
          </div>
        ) : (
          filteredOrders.map((order) => {
          const Icon = damageTypeIcons[order.damageType]
          const iconColor = damageTypeColors[order.damageType]
          const step = getOrderStep(order)
          const isUrgent = step === "neu" && new Date(order.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
          return (
            <Link
              key={order.id}
              href={`/pro/orders/${order.id}`}
              className="block pro-card p-4 active:scale-[0.98] transition-transform relative z-10"
            >
              {isUrgent && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EF4444] rounded-l-lg" />
              )}
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 rounded-lg bg-[#F7F7F7] flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate mb-1">{order.customerName}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-2">{order.description}</p>
                    </div>
                    <span
                      className={`pro-badge ml-2 flex-shrink-0 ${stepColors[step] ?? "bg-slate-100 text-slate-700"}`}
                    >
                      {stepLabels[step] ?? step}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium">{order.zip} {order.city}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })
        )}
      </div>

      {/* Orders Table - Desktop */}
      <div className="hidden md:block pro-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F7F7F7]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  PLZ / Ort
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Eingangsdatum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Schritt
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Aktion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <EmptyState
                      title="Noch keine Aufträge"
                      subtitle="Sobald neue Aufträge eingehen, erscheinen sie hier."
                    />
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                const Icon = damageTypeIcons[order.damageType]
                const iconColor = damageTypeColors[order.damageType]
                const step = getOrderStep(order)
                return (
                  <tr
                    key={order.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/pro/orders/${order.id}`)}
                    onKeyDown={(e) => e.key === "Enter" && router.push(`/pro/orders/${order.id}`)}
                    className="pro-table-row group hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{order.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">
                        {order.zip} {order.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("de-DE")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`pro-badge ${stepColors[step] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {stepLabels[step] ?? step}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/pro/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="h-9">
                          <Eye className="w-4 h-4 mr-2" />
                          Details öffnen
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
