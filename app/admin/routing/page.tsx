"use client"

import { useState, useEffect } from "react"
import {
  getRoutingRules,
  createRoutingRule,
  updateRoutingRule,
  deleteRoutingRule,
  searchPartners,
  type RoutingRule,
  type Partner,
} from "@/services/routingService"
import { Plus, Search, X, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const professionIcons: Record<string, string> = {
  maler: "🎨",
  trocknung: "💨",
  gutachter: "📋",
  bodenleger: "🔨",
  sanitaer: "🔧",
  dachdecker: "🏠",
  kfz: "🚗",
  glas: "🪟",
  rechtsfall: "⚖️",
}

const professionLabels: Record<string, string> = {
  maler: "Maler",
  trocknung: "Trocknung",
  gutachter: "Gutachter",
  bodenleger: "Bodenleger",
  sanitaer: "Sanitär",
  dachdecker: "Dachdecker",
  kfz: "KFZ",
  glas: "Glas",
  rechtsfall: "Rechtsfall",
}

export default function AdminRoutingPage() {
  const [rules, setRules] = useState<RoutingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Partner[]>([])
  const [searching, setSearching] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    zip_prefix: "",
    profession: "",
    preferred_partner_id: "",
    priority: 1,
    active: true,
  })

  useEffect(() => {
    loadRules()
  }, [])

  async function loadRules() {
    try {
      const data = await getRoutingRules()
      setRules(data)
    } catch (error) {
      console.error("Failed to load routing rules:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearchPartners(query: string) {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const results = await searchPartners({
        query: query,
        profession: formData.profession || undefined,
      })
      setSearchResults(results)
    } catch (error) {
      console.error("Failed to search partners:", error)
    } finally {
      setSearching(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingRule) {
        await updateRoutingRule(editingRule.id, {
          ...formData,
          preferred_partner_id: formData.preferred_partner_id || null,
        })
      } else {
        await createRoutingRule({
          ...formData,
          preferred_partner_id: formData.preferred_partner_id || null,
        })
      }
      await loadRules()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save routing rule:", error)
      alert("Fehler beim Speichern")
    }
  }

  async function handleToggleActive(rule: RoutingRule) {
    try {
      await updateRoutingRule(rule.id, { active: !rule.active })
      await loadRules()
    } catch (error) {
      console.error("Failed to toggle rule:", error)
    }
  }

  async function handleDelete(rule: RoutingRule) {
    if (!confirm(`Regel für ${rule.zip_prefix} wirklich löschen?`)) return

    try {
      await deleteRoutingRule(rule.id)
      await loadRules()
    } catch (error) {
      console.error("Failed to delete rule:", error)
    }
  }

  function resetForm() {
    setFormData({
      zip_prefix: "",
      profession: "",
      preferred_partner_id: "",
      priority: 1,
      active: true,
    })
    setEditingRule(null)
    setSearchQuery("")
    setSearchResults([])
  }

  function openEditModal(rule: RoutingRule) {
    setEditingRule(rule)
    setFormData({
      zip_prefix: rule.zip_prefix,
      profession: rule.profession,
      preferred_partner_id: rule.preferred_partner_id || "",
      priority: rule.priority,
      active: rule.active,
    })
    setShowModal(true)
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Routing Regeln</h1>
          <p className="text-slate-600 mt-2">Verwalte die Zuweisungslogik für Partner</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Regel hinzufügen
        </Button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Lade Regeln...</div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500">Noch keine Routing-Regeln</p>
            <Button
              onClick={() => setShowModal(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Erste Regel erstellen
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-mono">
                    PLZ-Bereich
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Gewerk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Prio
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
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-slate-900">{rule.zip_prefix}...</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{professionIcons[rule.profession] || "🔧"}</span>
                        <span className="text-sm text-slate-900">
                          {professionLabels[rule.profession] || rule.profession}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {rule.partner ? (
                        <div>
                          <div className="text-sm font-medium text-slate-900">{rule.partner.company_name}</div>
                          <div className="text-xs text-slate-500">
                            ⭐ {rule.partner.rating.toFixed(1)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Kein Partner</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rule.priority === 1
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {rule.priority === 1 ? "Exklusiv" : "Backup"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className="flex items-center space-x-2"
                      >
                        {rule.active ? (
                          <ToggleRight className="w-6 h-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-300" />
                        )}
                        <span className="text-sm text-slate-600">{rule.active ? "Aktiv" : "Inaktiv"}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingRule ? "Regel bearbeiten" : "Neue Routing-Regel"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Gewerk</label>
                <Select
                  value={formData.profession}
                  onValueChange={(value) => {
                    setFormData({ ...formData, profession: value })
                    setSearchQuery("")
                    setSearchResults([])
                  }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Gewerk wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(professionLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {professionIcons[value]} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">PLZ-Präfix</label>
                <Input
                  type="text"
                  value={formData.zip_prefix}
                  onChange={(e) => setFormData({ ...formData, zip_prefix: e.target.value })}
                  placeholder="z.B. 41 oder 41061"
                  className="bg-white font-mono"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Geben Sie den PLZ-Präfix ein (z.B. "41" für alle 41xxx PLZ)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Partner suchen</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      handleSearchPartners(e.target.value)
                    }}
                    placeholder="Partner-Name eingeben..."
                    className="bg-white pl-10"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    {searchResults.map((partner) => (
                      <button
                        key={partner.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, preferred_partner_id: partner.id })
                          setSearchQuery(partner.company_name)
                          setSearchResults([])
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 ${
                          formData.preferred_partner_id === partner.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="font-medium text-slate-900">{partner.company_name}</div>
                        <div className="text-xs text-slate-500">
                          ⭐ {partner.rating.toFixed(1)} • {professionLabels[partner.profession] || partner.profession}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !searching && (
                  <p className="text-xs text-slate-500 mt-2">Keine Partner gefunden</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priorität</label>
                <Select
                  value={formData.priority.toString()}
                  onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Exklusiv (Höchste Priorität)</SelectItem>
                    <SelectItem value="2">2 - Backup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="active" className="text-sm text-slate-700">
                  Regel aktiv
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                >
                  Abbrechen
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingRule ? "Aktualisieren" : "Erstellen"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

