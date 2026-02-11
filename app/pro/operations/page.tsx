"use client"

import { useEffect, useState } from "react"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { SkillMatrix } from "@/components/pro/SkillMatrix"
import { RoutingRadar } from "@/components/pro/RoutingRadar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { mockZipAreas } from "@/lib/mock/proData"
import type { ProZipArea } from "@/lib/types/pro"
import { supabase } from "@/lib/supabase"
import { availableProfessions, professionLabels } from "@/lib/constants/professions"

type AvailabilityStatus = "AVAILABLE" | "LIMITED" | "UNAVAILABLE"

const tradeDescriptions: Record<string, string> = {
  maler: "Malerarbeiten, Lackierungen, Tapezierarbeiten",
  trocknung: "Bautrocknung, Wasserschadensanierung",
  gutachter: "Schadensgutachten, Bewertungen",
  bodenleger: "Parkett, Laminat, Fliesen",
  sanitaer: "Klempnerarbeiten, Installationen",
  dachdecker: "Dachsanierung, Reparaturen",
  kfz: "KFZ-Schäden und Werkstatt",
  glas: "Glas- und Fensterschäden",
  rechtsfall: "Rechtsfälle / Anwalt",
}

export default function OperationsPage() {
  const { isDemoMode } = useDemoMode()
  const [globalAvailability, setGlobalAvailability] = useState<AvailabilityStatus>("AVAILABLE")
  const [zipAreas, setZipAreas] = useState<ProZipArea[]>([])
  const [trades, setTrades] = useState(
    availableProfessions.map((key) => ({
      id: key,
      name: professionLabels[key] || key,
      description: tradeDescriptions[key] || "",
      coveredInternally: false,
    }))
  )
  const [loading, setLoading] = useState(true)
  const [routingLeads, setRoutingLeads] = useState<any[]>([])

  useEffect(() => {
    async function loadOperations() {
      setLoading(true)
      try {
        if (isDemoMode) {
          setZipAreas(mockZipAreas)
          setRoutingLeads([
            {
              id: "lead-1",
              orderId: "12345",
              trade: "Maler",
              status: "accepted",
              partnerName: "Malerbetrieb Müller",
              partnerRating: 4.8,
              distance: 2.5,
            },
            {
              id: "lead-2",
              orderId: "12346",
              trade: "Trocknung",
              status: "found",
              partnerName: "Trocknungsexperten GmbH",
              partnerRating: 4.6,
              distance: 5.2,
            },
            {
              id: "lead-3",
              orderId: "12347",
              trade: "Gutachter",
              status: "searching",
            },
          ])
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token

        const [availabilityRes, zipRes] = await Promise.all([
          fetch("/api/pro/operations/availability", {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
          fetch("/api/pro/operations/zip-areas", {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
        ])

        const availabilityData = await availabilityRes.json()
        const zipData = await zipRes.json()

        if (availabilityData?.success) {
          setGlobalAvailability(availabilityData.status || "AVAILABLE")
        }
        if (zipData?.success) {
          setZipAreas(zipData.areas || [])
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("professions")
          .eq("id", sessionData.session?.user?.id || "")
          .single()

        const professions = Array.isArray(profile?.professions) ? profile?.professions : []
        setTrades((prev) =>
          prev.map((trade) => ({
            ...trade,
            coveredInternally: professions.includes(trade.id),
          }))
        )
        setRoutingLeads([])
      } catch (error) {
        console.warn("Failed to load operations data:", error)
        if (!isDemoMode) {
          setZipAreas([])
          setRoutingLeads([])
        }
      } finally {
        setLoading(false)
      }
    }

    loadOperations()
  }, [isDemoMode])

  const handleAddZipArea = async () => {
    if (isDemoMode) {
      const newArea: ProZipArea = {
        id: `zip-${Date.now()}`,
        zipRange: "",
        active: true,
        load: "GREEN",
      }
      setZipAreas([...zipAreas, newArea])
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const res = await fetch("/api/pro/operations/zip-areas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ zipRange: "", active: true, load: "GREEN" }),
    })
    const data = await res.json()
    if (data?.success && data.area) {
      setZipAreas((prev) => [data.area, ...prev])
    }
  }

  const handleDeleteZipArea = async (id: string) => {
    if (isDemoMode) {
      setZipAreas(zipAreas.filter((area) => area.id !== id))
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const res = await fetch(`/api/pro/operations/zip-areas/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    const data = await res.json()
    if (data?.success) {
      setZipAreas(zipAreas.filter((area) => area.id !== id))
    }
  }

  const handleUpdateZipArea = async (id: string, updates: Partial<ProZipArea>) => {
    setZipAreas(
      zipAreas.map((area) => (area.id === id ? { ...area, ...updates } : area))
    )

    if (isDemoMode) return
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    await fetch(`/api/pro/operations/zip-areas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updates),
    })
  }

  const handleToggle = async (tradeId: string, covered: boolean) => {
    let nextTrades: typeof trades = []
    setTrades((prev) => {
      nextTrades = prev.map((trade) =>
        trade.id === tradeId ? { ...trade, coveredInternally: covered } : trade
      )
      return nextTrades
    })

    if (isDemoMode) return
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id
    if (!userId) return

    const professions = nextTrades.filter((t) => t.coveredInternally).map((t) => t.id)
    await supabase.from("profiles").update({ professions }).eq("id", userId)
  }

  const getLoadColor = (load: string) => {
    switch (load) {
      case "GREEN":
        return "bg-green-500"
      case "ORANGE":
        return "bg-orange-500"
      case "RED":
        return "bg-red-500"
      default:
        return "bg-slate-300"
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header Bereich */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Einsatz & Netzwerk</h1>
        <p className="text-slate-500">
          Steuere deine Verfügbarkeit, Gebiete und Partner-Routing an einem Ort.
        </p>
      </div>

      {/* Verfügbarkeits-Ampel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Aktuelle Verfügbarkeit</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={async () => {
              setGlobalAvailability("AVAILABLE")
              if (!isDemoMode) {
                const { data: sessionData } = await supabase.auth.getSession()
                const token = sessionData.session?.access_token
                await fetch("/api/pro/operations/availability", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({ status: "AVAILABLE" }),
                })
              }
            }}
            className={`py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
              globalAvailability === "AVAILABLE"
                ? "bg-green-500 text-white shadow-lg scale-105"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Nimmt Aufträge an</span>
            </div>
          </button>
          <button
            onClick={async () => {
              setGlobalAvailability("LIMITED")
              if (!isDemoMode) {
                const { data: sessionData } = await supabase.auth.getSession()
                const token = sessionData.session?.access_token
                await fetch("/api/pro/operations/availability", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({ status: "LIMITED" }),
                })
              }
            }}
            className={`py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
              globalAvailability === "LIMITED"
                ? "bg-orange-500 text-white shadow-lg scale-105"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <XCircle className="w-5 h-5" />
              <span>Nur Bestandskunden</span>
            </div>
          </button>
          <button
            onClick={async () => {
              setGlobalAvailability("UNAVAILABLE")
              if (!isDemoMode) {
                const { data: sessionData } = await supabase.auth.getSession()
                const token = sessionData.session?.access_token
                await fetch("/api/pro/operations/availability", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({ status: "UNAVAILABLE" }),
                })
              }
            }}
            className={`py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
              globalAvailability === "UNAVAILABLE"
                ? "bg-red-500 text-white shadow-lg scale-105"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <XCircle className="w-5 h-5" />
              <span>Pause</span>
            </div>
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          Bei voller Auslastung werden Aufträge im Gebiet automatisch dem nächsten verfügbaren Partner
          zugewiesen.
        </p>
      </div>

      {/* Haupt-Bereich: 2-Spalten Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spalte Links: PLZ-Gebiete */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Einzugsgebiet</h3>
              <p className="text-sm text-slate-500 mt-1">PLZ-Gebiete verwalten</p>
            </div>
            <Button
              onClick={handleAddZipArea}
              className="bg-[#B8903A] text-white hover:bg-[#A67C2A] flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Gebiet hinzufügen</span>
            </Button>
          </div>
          <div className="divide-y divide-slate-200">
            {zipAreas.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p>Noch keine Gebiete hinzugefügt</p>
              </div>
            ) : (
              zipAreas.map((area) => (
                <div key={area.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">PLZ-Bereich</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteZipArea(area.id)}
                        className="text-red-500 hover:text-red-600 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={area.zipRange}
                      onChange={(e) =>
                        handleUpdateZipArea(area.id, { zipRange: e.target.value })
                      }
                      placeholder="41061-41069"
                      className="bg-white"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-slate-700">Aktiv</label>
                        <input
                          type="checkbox"
                          checked={area.active}
                          onChange={(e) =>
                            handleUpdateZipArea(area.id, { active: e.target.checked })
                          }
                          className="w-5 h-5 rounded border-slate-300"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-slate-700">Auslastung:</label>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getLoadColor(area.load)}`} />
                          <select
                            value={area.load}
                            onChange={(e) =>
                              handleUpdateZipArea(area.id, {
                                load: e.target.value as "GREEN" | "ORANGE" | "RED",
                              })
                            }
                            className="h-9 rounded-md border border-slate-300 px-3 text-sm bg-white font-medium"
                          >
                            <option value="GREEN">Grün</option>
                            <option value="ORANGE">Orange</option>
                            <option value="RED">Rot</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Spalte Rechts: Skill-Matrix */}
        <div>
          <SkillMatrix trades={trades} onToggle={handleToggle} />
        </div>
      </div>

      {/* Footer-Bereich: Vermittlungs-Radar */}
      <div>
        <RoutingRadar leads={routingLeads} />
      </div>
    </div>
  )
}

