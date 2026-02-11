"use client"

import { useMemo, useState, useEffect } from "react"
import {
  getRoutingRules,
  createRoutingRule,
  updateRoutingRule,
  deleteRoutingRule,
  searchAssignees,
  type RoutingRule,
  type Partner,
} from "@/services/routingService"
import { Plus, Search, X, Edit2, Trash2, ToggleLeft, ToggleRight, Save, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { mockRoutingRules, mockAdminPartners } from "@/lib/mock/adminData"
import { supabase } from "@/lib/supabase"

import { professionIcons, professionLabels } from "@/lib/constants/professions"

export default function AdminRoutingPage() {
  const { isDemoMode } = useDemoMode()
  const [rules, setRules] = useState<RoutingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Partner[]>([])
  const [searching, setSearching] = useState(false)

  // Assignment settings (manual/auto/broadcast)
  const [settings, setSettings] = useState<any[]>([])
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [quickRows, setQuickRows] = useState<any[]>([])
  const [quickInit, setQuickInit] = useState("")
  const [savingQuick, setSavingQuick] = useState(false)

  const assignmentProfessionOptions = useMemo(() => Object.entries(professionLabels), [])

  // Form state
  const [formData, setFormData] = useState({
    zip_prefix: "",
    profession: "",
    preferred_assignee_id: "",
    assignee_type: "" as "" | "partner" | "handwerker",
    priority: 1,
    active: true,
  })

  useEffect(() => {
    loadRules()
    loadAssignmentSettings()
  }, [isDemoMode])

  async function loadRules() {
    setLoadError(null)
    try {
      if (isDemoMode) {
        // Use mock data in demo mode
        setRules(mockRoutingRules as RoutingRule[])
      } else {
        const data = await getRoutingRules()
        setRules(data)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to load routing rules"
      console.error("Failed to load routing rules:", error)
      setLoadError(msg)
      setRules([])
    } finally {
      setLoading(false)
    }
  }

  async function loadAssignmentSettings() {
    setSettingsLoading(true)
    setSettingsError(null)
    try {
      if (isDemoMode) {
        setSettings([])
        setQuickRows([])
        setQuickInit("")
        return
      }
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch("/api/admin/assignment-settings", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const data = await res.json()
      if (!data?.success) throw new Error(data?.details || data?.error || "Failed to load assignment settings")
      const rows = data.settings || []
      setSettings(rows)

      // Quick Setup: one global row (zip_prefix=null) per profession.
      const byProfession = new Map<string, any>()
      for (const r of rows) {
        if (!r?.profession) continue
        if (r.zip_prefix !== null) continue
        byProfession.set(String(r.profession), r)
      }

      const hasAnyGlobalDefaults = byProfession.size > 0

      const quick = assignmentProfessionOptions.map(([profession]) => {
        const base = {
          profession,
          zip_prefix: null,
          // Optional default init: if there are no global defaults yet, start as Auto+Active
          // (still requires clicking Save, no auto-persist).
          mode: hasAnyGlobalDefaults ? "manual" : "auto",
          broadcast_partner_count: 3,
          fallback_behavior: "internal_only",
          active: hasAnyGlobalDefaults ? false : true,
        }
        return { ...base, ...(byProfession.get(profession) || {}), zip_prefix: null }
      })

      const initStr = JSON.stringify(
        quick.map((r: any) => ({
          profession: r.profession,
          zip_prefix: null,
          mode: r.mode,
          broadcast_partner_count: r.broadcast_partner_count,
          fallback_behavior: r.fallback_behavior,
          active: r.active,
        }))
      )
      setQuickRows(quick)
      setQuickInit(initStr)
    } catch (e: any) {
      setSettings([])
      setQuickRows([])
      setQuickInit("")
      setSettingsError(e?.message || "Failed to load assignment settings")
    } finally {
      setSettingsLoading(false)
    }
  }

  const quickDirty = useMemo(() => {
    const cur = JSON.stringify(
      quickRows.map((r: any) => ({
        profession: r.profession,
        zip_prefix: null,
        mode: r.mode,
        broadcast_partner_count: r.broadcast_partner_count,
        fallback_behavior: r.fallback_behavior,
        active: r.active,
      }))
    )
    return !!quickInit && cur !== quickInit
  }, [quickInit, quickRows])

  async function saveQuickSetup() {
    if (isDemoMode) {
      alert("Demo: Änderungen sind deaktiviert.")
      return
    }
    setSavingQuick(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      const payload = quickRows.map((r: any) => ({
        profession: r.profession,
        zip_prefix: null,
        mode: r.mode,
        broadcast_partner_count: r.broadcast_partner_count,
        fallback_behavior: r.fallback_behavior,
        active: r.active,
      }))

      const res = await fetch("/api/admin/assignment-settings/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ settings: payload }),
      })
      const data = await res.json()
      if (!data?.success) throw new Error(data?.details || data?.error || "Speichern fehlgeschlagen")

      await loadAssignmentSettings()
      alert("Gespeichert.")
    } catch (e: any) {
      alert(e?.message || "Fehler beim Speichern")
    } finally {
      setSavingQuick(false)
    }
  }

  async function toggleAssignmentSettingActive(row: any) {
    if (isDemoMode) return
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch(`/api/admin/assignment-settings/${row.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ active: !row.active }),
      })
      const data = await res.json()
      if (!data?.success) throw new Error(data?.error || "Failed to update setting")
      await loadAssignmentSettings()
    } catch (e: any) {
      alert(e?.message || "Fehler beim Aktualisieren")
    }
  }

  async function handleSearchPartners(query: string) {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      if (isDemoMode) {
        // Use mock data in demo mode – map to Partner shape
        const filtered = mockAdminPartners
          .filter((p) => 
            p.company_name.toLowerCase().includes(query.toLowerCase()) ||
            (p.email || "").toLowerCase().includes(query.toLowerCase())
          )
          .map((p) => ({
            id: p.id,
            company_name: p.company_name,
            profession: p.profession || "maler",
            email: p.email,
            rating: 4.5,
            is_verified: p.is_verified,
            assignee_type: 'partner' as const,
          }))
        setSearchResults(filtered)
      } else {
        const results = await searchAssignees({
          query: query,
          profession: formData.profession || undefined,
        })
        setSearchResults(results)
      }
    } catch (error) {
      console.error("Failed to search assignees:", error)
      // Fallback to mock data on error
      if (!isDemoMode) {
        const filtered = mockAdminPartners
          .filter((p) => 
            p.company_name.toLowerCase().includes(query.toLowerCase()) ||
            (p.email || "").toLowerCase().includes(query.toLowerCase())
          )
          .map((p) => ({
            id: p.id,
            company_name: p.company_name,
            profession: p.profession || "maler",
            email: p.email,
            rating: 4.5,
            is_verified: p.is_verified,
            assignee_type: 'partner' as const,
          }))
        setSearchResults(filtered)
      }
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
          preferred_assignee_id: formData.preferred_assignee_id || null,
          assignee_type: formData.assignee_type || null,
        })
      } else {
        await createRoutingRule({
          ...formData,
          preferred_assignee_id: formData.preferred_assignee_id || null,
          assignee_type: formData.assignee_type || null,
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
      preferred_assignee_id: "",
      assignee_type: "",
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
      preferred_assignee_id: rule.preferred_assignee_id || "",
      assignee_type: rule.assignee_type || "",
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

      {/* Assignment Settings (Quick Setup) */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Auftragszuweisung – Schnellstart</h2>
              <p className="text-sm text-slate-600 mt-1">
                Pro Gewerk: Aktiv/Inactive + Modus. Danach einmal auf Speichern.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isDemoMode || quickRows.length === 0}
                  onClick={() => {
                    setQuickRows((prev) =>
                      prev.map((r: any) => ({
                        ...r,
                        mode: "auto",
                        active: true,
                      }))
                    )
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Alles Auto
                </Button>
                {quickDirty && (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    Ungespeicherte Änderungen
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={saveQuickSetup}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isDemoMode || savingQuick || !quickDirty}
            >
              <Save className="w-4 h-4 mr-2" />
              {savingQuick ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="pt-4 border-t border-slate-200">
            {settingsLoading ? (
              <div className="text-slate-500">Lade Zuweisungs-Settings...</div>
            ) : settingsError ? (
              <div className="text-sm text-red-600">{settingsError}</div>
            ) : quickRows.length === 0 ? (
              <div className="text-sm text-slate-500">Keine Gewerke gefunden.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Gewerk</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Modus</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Broadcast</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Aktiv</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {quickRows.map((r: any) => (
                      <tr key={r.profession} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {professionIcons[r.profession] || "🔧"}{" "}
                          {professionLabels[r.profession] || r.profession}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          <Select
                            value={r.mode}
                            onValueChange={(value) =>
                              setQuickRows((prev) =>
                                prev.map((x) => (x.profession === r.profession ? { ...x, mode: value } : x))
                              )
                            }
                          >
                            <SelectTrigger className="bg-white h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Manuell</SelectItem>
                              <SelectItem value="auto">Auto</SelectItem>
                              <SelectItem value="broadcast">Broadcast</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            className="bg-white font-mono h-9 w-24"
                            disabled={r.mode !== "broadcast"}
                            value={r.broadcast_partner_count ?? 3}
                            onChange={(e) =>
                              setQuickRows((prev) =>
                                prev.map((x) =>
                                  x.profession === r.profession
                                    ? { ...x, broadcast_partner_count: Number(e.target.value || 3) }
                                    : x
                                )
                              )
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              setQuickRows((prev) =>
                                prev.map((x) =>
                                  x.profession === r.profession ? { ...x, active: !x.active } : x
                                )
                              )
                            }
                            className="inline-flex items-center gap-2 disabled:opacity-50"
                            disabled={isDemoMode}
                          >
                            {r.active ? (
                              <ToggleRight className="w-6 h-6 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-slate-300" />
                            )}
                            <span className="text-sm text-slate-600">{r.active ? "Aktiv" : "Inaktiv"}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Lade Regeln...</div>
        ) : loadError ? (
          <div className="p-12 text-center">
            <p className="text-slate-900 font-medium mb-2">Routing-Regeln konnten nicht geladen werden</p>
            <p className="text-sm text-red-600">{loadError}</p>
          </div>
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
                      Zugewiesen an
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
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                              Partner
                            </span>
                            <div className="text-sm font-medium text-slate-900">{rule.partner.company_name}</div>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            ⭐ {rule.partner.rating.toFixed(1)}
                          </div>
                        </div>
                      ) : rule.handwerker ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                              Handwerker
                            </span>
                            <div className="text-sm font-medium text-slate-900">{rule.handwerker.company_name || "—"}</div>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {rule.handwerker.role === "chef" ? "Chef" : "Azubi"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Nicht zugewiesen</span>
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
                  Geben Sie den PLZ-Präfix ein (z.B. &quot;41&quot; für alle 41xxx PLZ)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Partner oder Handwerker suchen</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      handleSearchPartners(e.target.value)
                    }}
                    placeholder="Partner oder Handwerker suchen..."
                    className="bg-white pl-10"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    {searchResults.map((assignee) => (
                      <button
                        key={assignee.id}
                        type="button"
                        onClick={() => {
                          setFormData({ 
                            ...formData, 
                            preferred_assignee_id: assignee.id,
                            assignee_type: assignee.assignee_type || 'partner'
                          })
                          setSearchQuery(assignee.company_name)
                          setSearchResults([])
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 ${
                          formData.preferred_assignee_id === assignee.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {assignee.assignee_type === 'handwerker' ? (
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                              Handwerker
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                              Partner
                            </span>
                          )}
                          <div className="font-medium text-slate-900">{assignee.company_name}</div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {assignee.assignee_type === 'handwerker' ? (
                            <>Pro Network • {assignee.email || "—"}</>
                          ) : (
                            <>⭐ {assignee.rating.toFixed(1)} • {professionLabels[assignee.profession] || assignee.profession}</>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !searching && (
                  <p className="text-xs text-slate-500 mt-2">Keine Partner oder Handwerker gefunden</p>
                )}

                {formData.preferred_assignee_id && (
                  <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                    <span className="text-slate-600">Ausgewählt: </span>
                    <span className="font-medium text-slate-900">
                      {searchResults.find((a) => a.id === formData.preferred_assignee_id)?.company_name || 
                       rules.find((r) => r.preferred_assignee_id === formData.preferred_assignee_id)?.partner?.company_name ||
                       rules.find((r) => r.preferred_assignee_id === formData.preferred_assignee_id)?.handwerker?.company_name ||
                       "—"}
                    </span>
                    {formData.assignee_type && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                        formData.assignee_type === 'handwerker' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {formData.assignee_type === 'handwerker' ? 'Handwerker' : 'Partner'}
                      </span>
                    )}
                  </div>
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

