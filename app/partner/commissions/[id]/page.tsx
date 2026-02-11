"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PartnerCommissionDetailPage() {
  const params = useParams()
  const commissionId = params?.id as string
  const [loading, setLoading] = useState(true)
  const [commission, setCommission] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCommission() {
      if (!commissionId) return
      setLoading(true)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch(`/api/partner/commissions/${commissionId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!data?.success) throw new Error(data?.error || "Provision nicht gefunden")
        setCommission(data.commission)
      } catch (err: any) {
        setError(err?.message || "Fehler beim Laden")
      } finally {
        setLoading(false)
      }
    }

    loadCommission()
  }, [commissionId])

  if (loading) {
    return <p className="text-[#6B7280] text-sm">Lade Provision...</p>
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>
  }

  if (!commission) {
    return <p className="text-[#6B7280] text-sm">Keine Provision gefunden.</p>
  }

  return (
    <div className="space-y-4 page-transition">
      <div>
        <h1 className="text-white text-2xl font-bold">Provision</h1>
        <p className="text-[#6B7280] mt-0.5 text-xs">Details zur Provision</p>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6 space-y-3">
        <div>
          <p className="text-[#6B7280] text-xs">Kunde</p>
          <p className="text-white text-sm">{commission.customerName}</p>
        </div>
        <div>
          <p className="text-[#6B7280] text-xs">Betrag</p>
          <p className="text-white text-sm">
            {Number(commission.amount).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
          </p>
        </div>
        <div>
          <p className="text-[#6B7280] text-xs">Status</p>
          <p className="text-white text-sm">{commission.status}</p>
        </div>
        <div>
          <p className="text-[#6B7280] text-xs">Rate</p>
          <p className="text-white text-sm">{commission.commissionRate}%</p>
        </div>
      </div>
    </div>
  )
}
