"use client"

import { useState } from "react"
import { SkillMatrix } from "@/components/pro/SkillMatrix"
import { RoutingRadar } from "@/components/pro/RoutingRadar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { mockZipAreas } from "@/lib/mock/proData"
import type { ProZipArea } from "@/lib/types/pro"

type AvailabilityStatus = "AVAILABLE" | "LIMITED" | "UNAVAILABLE"

// Mock data for trades
const initialTrades = [
  {
    id: "painter",
    name: "Maler",
    description: "Malerarbeiten, Lackierungen, Tapezierarbeiten",
    coveredInternally: true,
  },
  {
    id: "drying",
    name: "Trocknung",
    description: "Bautrocknung, Wasserschadensanierung",
    coveredInternally: false,
  },
  {
    id: "assessor",
    name: "Gutachter",
    description: "Schadensgutachten, Bewertungen",
    coveredInternally: false,
  },
  {
    id: "flooring",
    name: "Bodenleger",
    description: "Parkett, Laminat, Fliesen",
    coveredInternally: false,
  },
  {
    id: "electrician",
    name: "Elektriker",
    description: "Elektroinstallationen, Reparaturen",
    coveredInternally: false,
  },
  {
    id: "plumber",
    name: "Sanitär",
    description: "Klempnerarbeiten, Installationen",
    coveredInternally: true,
  },
  {
    id: "carpenter",
    name: "Tischler",
    description: "Holzarbeiten, Möbel, Türen",
    coveredInternally: false,
  },
  {
    id: "roofer",
    name: "Dachdecker",
    description: "Dachsanierung, Reparaturen",
    coveredInternally: false,
  },
]

const mockRoutingLeads = [
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

export default function OperationsPage() {
  const [globalAvailability, setGlobalAvailability] = useState<AvailabilityStatus>("AVAILABLE")
  const [zipAreas, setZipAreas] = useState<ProZipArea[]>(mockZipAreas)
  const [trades, setTrades] = useState(initialTrades)

  const handleAddZipArea = () => {
    const newArea: ProZipArea = {
      id: `zip-${Date.now()}`,
      zipRange: "",
      active: true,
      load: "GREEN",
    }
    setZipAreas([...zipAreas, newArea])
  }

  const handleDeleteZipArea = (id: string) => {
    setZipAreas(zipAreas.filter((area) => area.id !== id))
  }

  const handleUpdateZipArea = (id: string, updates: Partial<ProZipArea>) => {
    setZipAreas(
      zipAreas.map((area) => (area.id === id ? { ...area, ...updates } : area))
    )
  }

  const handleToggle = (tradeId: string, covered: boolean) => {
    setTrades((prev) =>
      prev.map((trade) =>
        trade.id === tradeId ? { ...trade, coveredInternally: covered } : trade
      )
    )
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
            onClick={() => setGlobalAvailability("AVAILABLE")}
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
            onClick={() => setGlobalAvailability("LIMITED")}
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
            onClick={() => setGlobalAvailability("UNAVAILABLE")}
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
              className="bg-[#D4AF37] text-white hover:bg-[#B8941F] flex items-center space-x-2"
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
        <RoutingRadar leads={mockRoutingLeads} />
      </div>
    </div>
  )
}

