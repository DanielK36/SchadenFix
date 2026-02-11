"use client"

import { useEffect, useState } from "react"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { mockAdminPartners } from "@/lib/mock/adminData"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPartnersPage() {
  const { isDemoMode } = useDemoMode()
  const [activeTab, setActiveTab] = useState<"partners" | "pro-network">("partners")
  
  // Partners (Vermittler) state
  const [partners, setPartners] = useState<any[]>([])
  const [partnersLoading, setPartnersLoading] = useState(true)
  const [partnersError, setPartnersError] = useState<string | null>(null)
  
  // Pro Network (Handwerker) state
  const [proNetwork, setProNetwork] = useState<any[]>([])
  const [proNetworkLoading, setProNetworkLoading] = useState(true)
  const [proNetworkError, setProNetworkError] = useState<string | null>(null)
  

  // Load partners (Vermittler)
  useEffect(() => {
    async function loadPartners() {
      setPartnersLoading(true)
      setPartnersError(null)
      try {
        if (isDemoMode) {
          setPartners(mockAdminPartners)
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch("/api/admin/partners", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!res.ok || !data?.success) {
          const errorMsg = data?.error || `HTTP ${res.status}: ${res.statusText}`
          const details = data?.details ? ` (${data.details})` : ""
          throw new Error(`${errorMsg}${details}`)
        }
        setPartners(data.partners || [])
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load partners"
        console.warn("Could not load partners:", e)
        setPartnersError(msg)
        setPartners([])
      } finally {
        setPartnersLoading(false)
      }
    }
    loadPartners()
  }, [isDemoMode])

  // Load Pro Network (Handwerker)
  useEffect(() => {
    async function loadProNetwork() {
      setProNetworkLoading(true)
      setProNetworkError(null)
      try {
        if (isDemoMode) {
          // Mock data for pro network
          setProNetwork([
            { id: "1", role: "chef", company_name: "Muster Handwerker GmbH", email: "chef@example.com" },
            { id: "2", role: "azubi", company_name: "Azubi Firma", email: "azubi@example.com" },
          ])
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch("/api/admin/pro-network", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!res.ok || !data?.success) {
          const errorMsg = data?.error || `HTTP ${res.status}: ${res.statusText}`
          throw new Error(`${errorMsg}`)
        }
        setProNetwork(data.proNetwork || [])
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load pro network"
        console.warn("Could not load pro network:", e)
        setProNetworkError(msg)
        setProNetwork([])
      } finally {
        setProNetworkLoading(false)
      }
    }
    loadProNetwork()
  }, [isDemoMode])


  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Partner & Clearing</h1>
        <p className="text-slate-600 mt-2">Verwaltung von Partnern (Vermittler) und Pro Network (Handwerker)</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "partners" | "pro-network")}>
        <TabsList className="mb-6">
          <TabsTrigger value="partners">Partner (Vermittler)</TabsTrigger>
          <TabsTrigger value="pro-network">Pro Network (Handwerker)</TabsTrigger>
        </TabsList>

        {/* Partners Tab */}
        <TabsContent value="partners">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {partnersLoading ? (
              <div className="p-12 text-center text-slate-500">Lade Partner...</div>
            ) : partnersError ? (
              <div className="p-12">
                <p className="text-slate-900 font-medium mb-2">Partner konnten nicht geladen werden</p>
                <p className="text-sm text-red-600 mb-4">{partnersError}</p>
                
                {partnersError.includes("PGRST205") || partnersError.includes("Tabelle") || partnersError.includes("table") ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4 text-left">
                    <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ Die Tabelle 'partners' fehlt in Supabase</p>
                    <p className="text-xs text-amber-800 mb-3">Bitte führe das SQL-Script aus:</p>
                    <ol className="text-xs text-amber-800 list-decimal list-inside space-y-1 mb-3">
                      <li>Öffne dein Supabase Projekt</li>
                      <li>Gehe zu <strong>SQL Editor</strong></li>
                      <li>Führe <code className="bg-amber-100 px-1 rounded">supabase/create_partners_table.sql</code> aus</li>
                      <li>Lade diese Seite neu</li>
                    </ol>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mt-3">
                    Hinweis: Wenn du im Demo-Modus bist, siehst du Mock-Daten. Für echte Partner muss ein
                    Admin-Account eingeloggt sein.
                  </p>
                )}
              </div>
            ) : partners.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500 mb-2">Keine Partner gefunden</p>
                <p className="text-sm text-slate-400">Sobald Partner registriert sind, erscheinen sie hier.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Partner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Erstellt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {partners.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{p.company_name || "—"}</div>
                          <div className="text-xs text-slate-500">{p.email || "—"}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString("de-DE") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Pro Network Tab */}
        <TabsContent value="pro-network">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {proNetworkLoading ? (
              <div className="p-12 text-center text-slate-500">Lade Pro Network...</div>
            ) : proNetworkError ? (
              <div className="p-12">
                <p className="text-slate-900 font-medium mb-2">Pro Network konnte nicht geladen werden</p>
                <p className="text-sm text-red-600">{proNetworkError}</p>
              </div>
            ) : proNetwork.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500 mb-2">Keine Handwerker gefunden</p>
                <p className="text-sm text-slate-400">Sobald Handwerker registriert sind, erscheinen sie hier.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Firma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        E-Mail
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Rolle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Registriert
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {proNetwork.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{p.company_name || "—"}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{p.email || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            p.role === "chef" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {p.role === "chef" ? "Chef" : "Azubi"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(p.created_at).toLocaleDateString("de-DE")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

