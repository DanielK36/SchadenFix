"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProStatus, DamageType } from "@/lib/types/pro"
import { CarFront, SquareStack, Waves, Flame, Building, Scale, MoreVertical, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/pro/EmptyState"
import { getOrdersByCompany } from "@/services/orderService"
import { mapSupabaseOrderToProOrder } from "@/lib/mappers/orderMapper"
import type { ProOrder } from "@/lib/types/pro"

const damageTypeIcons: Record<DamageType, typeof CarFront> = {
  KFZ: CarFront,
  GLAS: SquareStack,
  WASSER: Waves,
  FEUER: Flame,
  GEBAEUDE: Building,
  RECHTSFALL: Scale,
}

const damageTypeColors: Record<DamageType, string> = {
  KFZ: "text-[#FFD700]",
  GLAS: "text-cyan-500",
  WASSER: "text-blue-500",
  FEUER: "text-orange-500",
  GEBAEUDE: "text-purple-500",
  RECHTSFALL: "text-gray-600",
}

const statusLabels: Record<ProStatus, string> = {
  NEW: "Neu",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Fertig",
  CANCELLED: "Storniert",
}

export default function ProOrdersPage() {
  const router = useRouter()
  const [selectedStatuses, setSelectedStatuses] = useState<ProStatus[]>([])
  const [selectedTypes, setSelectedTypes] = useState<DamageType[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
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

  const filteredOrders = orders.filter((order) => {
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(order.status)) return false
    if (selectedTypes.length > 0 && !selectedTypes.includes(order.damageType)) return false
    return true
  })

  const toggleStatus = (status: ProStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const toggleType = (type: DamageType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="pro-h1">Aufträge</h1>
        <p className="pro-body-small mt-1 text-slate-500">Alle Aufträge verwalten und bearbeiten</p>
      </div>

      {/* Filters - Mobile: Collapsible */}
      <div className="md:hidden">
        <details className="pro-card">
          <summary className="pro-h2 cursor-pointer list-none flex items-center justify-between">
            <span>Filter</span>
            <span className="text-sm text-[#6B7280]">▼</span>
          </summary>
          <div className="mt-4 space-y-4 pt-4 border-t border-[#EAEAEA]">
            <div>
              <label className="pro-body-small font-semibold text-[#1A1A1A] block mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusLabels).map(([status, label]) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status as ProStatus)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                      selectedStatuses.includes(status as ProStatus)
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-[#F7F7F7] text-[#6B7280]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="pro-body-small font-semibold text-[#1A1A1A] block mb-2">Typ</label>
              <div className="flex flex-wrap gap-2">
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
                        : "bg-[#F7F7F7] text-[#6B7280]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Filters - Desktop */}
      <div className="hidden md:block pro-card space-y-3">
        <h2 className="pro-h2">Filter</h2>

        <div>
          <label className="pro-body-small font-semibold text-[#1A1A1A] block mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusLabels).map(([status, label]) => (
              <button
                key={status}
                onClick={() => toggleStatus(status as ProStatus)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                  selectedStatuses.includes(status as ProStatus)
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F7F7F7] text-[#6B7280] hover:bg-[#EAEAEA]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="pro-body-small font-semibold text-[#1A1A1A] block mb-2">Typ</label>
          <div className="flex flex-wrap gap-2">
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
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[#374151] block mb-2">Von</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#374151] block mb-2">Bis</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>
      </div>

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
          const isUrgent = order.status === "NEW" && new Date(order.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
          return (
            <Link
              key={order.id}
              href={`/pro/orders/${order.id}`}
              className="block pro-card p-4 active:scale-[0.98] transition-transform"
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
                      className={`pro-badge ml-2 flex-shrink-0 ${
                        order.status === "NEW"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "IN_PROGRESS"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "DONE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {statusLabels[order.status]}
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
                  Status
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
                return (
                  <tr
                    key={order.id}
                    className="pro-table-row group hover:bg-slate-50 transition-colors"
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
                        className={`pro-badge ${
                          order.status === "NEW"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "IN_PROGRESS"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.status === "DONE"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-3">
                        <Link href={`/pro/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="h-9">
                            <Eye className="w-4 h-4 mr-2" />
                            Details öffnen
                          </Button>
                        </Link>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(openMenuId === order.id ? null : order.id)
                            }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                          {openMenuId === order.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuId(null)
                                }}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
                                <div className="py-1">
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Mark as done logic
                                      setOpenMenuId(null)
                                    }}
                                  >
                                    Als erledigt markieren
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Edit logic
                                      setOpenMenuId(null)
                                    }}
                                  >
                                    Bearbeiten
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Delete logic
                                      setOpenMenuId(null)
                                    }}
                                  >
                                    Löschen
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
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
