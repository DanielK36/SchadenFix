"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { mockLeads } from "@/lib/mock/partnerData"
import type { LeadStatus } from "@/lib/types/partner"
import { AnimatedButton } from "@/components/partner/AnimatedButton"
import { ChevronRight, Users } from "lucide-react"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { EmptyState } from "@/components/partner/EmptyState"
import { supabase } from "@/lib/supabase"

const statusLabels: Record<LeadStatus, string> = {
  KONTAKT_AUFGENOMMEN: "Kontakt aufgenommen",
  ANGEBOT_ERSTELLT: "Angebot erstellt",
  AUFTRAG_ERTEILT: "Auftrag erteilt",
  ABGESCHLOSSEN: "Abgeschlossen",
}

const statusColors: Record<LeadStatus, string> = {
  KONTAKT_AUFGENOMMEN: "bg-[#3B82F6]/15 text-[#60A5FA]",
  ANGEBOT_ERSTELLT: "bg-[#FBBF24]/15 text-[#FCD34D]",
  AUFTRAG_ERTEILT: "bg-[#22C55E]/15 text-[#4ADE80]",
  ABGESCHLOSSEN: "bg-[#22C55E]/15 text-[#4ADE80]",
}

export default function PartnerLeadsPage() {
  const { isDemoMode } = useDemoMode()
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "ALL">("ALL")
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLeads() {
      setLoading(true)
      try {
        if (isDemoMode) {
          setLeads(mockLeads)
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch("/api/partner/leads", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!data?.success) throw new Error(data?.error || "Failed to load leads")
        setLeads(data.leads || [])
      } catch (error) {
        console.warn(error)
        setLeads([])
      } finally {
        setLoading(false)
      }
    }

    loadLeads()
  }, [isDemoMode])

  const filteredLeads = leads.filter((lead) => {
    if (selectedStatus !== "ALL" && lead.status !== selectedStatus) return false
    return true
  })

  return (
    <div className="space-y-4 page-transition">
      <div>
        <h1 className="text-white text-2xl font-bold">Leads</h1>
        <p className="text-[#6B7280] mt-0.5 text-xs">Alle vermittelten Kunden im Überblick</p>
      </div>

      {/* Filter Chips - Horizontal Scroll */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 min-w-max pb-2">
          <AnimatedButton
            onClick={() => setSelectedStatus("ALL")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedStatus === "ALL"
                ? "bg-[#B8903A] text-[#000000]"
                : "bg-[#1A1A1A] text-[#6B7280] hover:bg-[#2A2A2A]"
            }`}
          >
            Alle
          </AnimatedButton>
          {Object.entries(statusLabels).map(([status, label]) => (
            <AnimatedButton
              key={status}
              onClick={() => setSelectedStatus(status as LeadStatus)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedStatus === status
                  ? "bg-[#B8903A] text-[#000000]"
                  : "bg-[#1A1A1A] text-[#6B7280] hover:bg-[#2A2A2A]"
              }`}
            >
              {label}
            </AnimatedButton>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Alle Leads</h2>
        {loading ? (
          <p className="text-[#6B7280] text-sm">Lade Leads...</p>
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Noch keine Einträge"
            subtitle="Teile deinen Partner-Link, um erste Provisionen zu verdienen."
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase">
                  Kundenname
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase">
                  Datum
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase">
                  Erwartete Provision
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase">
                  Erhaltene Provision
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-white/5 hover:bg-[#2A2A2A]/50 transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/partner/leads/${lead.id}`)}
                >
                  <td className="py-3 px-4">
                    <span className="text-white text-sm">{lead.customerName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[#6B7280] text-sm">
                      {new Date(lead.createdAt).toLocaleDateString("de-DE")}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[#B8903A] text-sm font-semibold">
                      {lead.expectedCommission.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white text-sm">
                      {lead.receivedCommission
                        ? lead.receivedCommission.toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          })
                        : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-2">
          {filteredLeads.map((lead) => (
            <Link
              key={lead.id}
              href={`/partner/leads/${lead.id}`}
              className="block bg-[#000000] rounded-xl p-3 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold text-sm truncate">{lead.customerName}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${statusColors[lead.status]}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#6B7280]">
                      {new Date(lead.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
                    </span>
                    <span className="text-[#6B7280]">·</span>
                    <span className="text-[#B8903A] font-semibold">
                      {lead.expectedCommission.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    {lead.receivedCommission && (
                      <>
                        <span className="text-[#6B7280]">·</span>
                        <span className="text-white text-xs">
                          {lead.receivedCommission.toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
          </>
        )}
      </div>
    </div>
  )
}
