"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PartnerLeadDetailPage() {
  const params = useParams()
  const leadId = params?.id as string
  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLead() {
      if (!leadId) return
      setLoading(true)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch(`/api/partner/leads/${leadId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!data?.success) throw new Error(data?.error || "Lead nicht gefunden")
        setLead(data.lead)
      } catch (err: any) {
        setError(err?.message || "Fehler beim Laden")
      } finally {
        setLoading(false)
      }
    }

    loadLead()
  }, [leadId])

  if (loading) {
    return <p className="text-[#6B7280] text-sm">Lade Lead...</p>
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>
  }

  if (!lead) {
    return <p className="text-[#6B7280] text-sm">Kein Lead gefunden.</p>
  }

  return (
    <div className="space-y-4 page-transition">
      <div>
        <h1 className="text-white text-2xl font-bold">Lead-Details</h1>
        <p className="text-[#6B7280] mt-0.5 text-xs">Vermittelte Anfrage</p>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6 space-y-3">
        <div>
          <p className="text-[#6B7280] text-xs">Kunde</p>
          <p className="text-white text-sm">{lead.customer?.name}</p>
        </div>
        <div>
          <p className="text-[#6B7280] text-xs">Kontakt</p>
          <p className="text-white text-sm">{lead.customer?.email || "—"}</p>
          <p className="text-white text-sm">{lead.customer?.phone || "—"}</p>
        </div>
        <div>
          <p className="text-[#6B7280] text-xs">Adresse</p>
          <p className="text-white text-sm">{lead.customer?.address || "—"}</p>
        </div>
        <div>
          <p className="text-[#6B7280] text-xs">Beschreibung</p>
          <p className="text-white text-sm">{lead.description || "—"}</p>
        </div>
        <div>
          <p className="text-[#6B7280] text-xs">Provision</p>
          <p className="text-white text-sm">
            {lead.commission?.amount
              ? Number(lead.commission.amount).toLocaleString("de-DE", { style: "currency", currency: "EUR" })
              : "—"}
          </p>
        </div>
      </div>
    </div>
  )
}
