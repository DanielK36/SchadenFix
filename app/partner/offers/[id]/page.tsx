"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PartnerOfferDetailPage() {
  const params = useParams()
  const offerId = params?.id as string
  const [loading, setLoading] = useState(true)
  const [offer, setOffer] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)

  useEffect(() => {
    async function loadOffer() {
      if (!offerId) return
      setLoading(true)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch(`/api/partner/offers/${offerId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!data?.success) throw new Error(data?.error || "Offer nicht gefunden")
        setOffer(data.offer)
      } catch (err: any) {
        setError(err?.message || "Fehler beim Laden")
      } finally {
        setLoading(false)
      }
    }

    loadOffer()
  }, [offerId])

  const handleDecline = async () => {
    if (!offerId) return
    setActionBusy(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch(`/api/partner/offers/${offerId}/decline`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const data = await res.json()
      if (!data?.success) throw new Error(data?.error || "Offer konnte nicht abgelehnt werden")
      setOffer((prev: any) => (prev ? { ...prev, status: "declined" } : prev))
    } catch (err: any) {
      setError(err?.message || "Fehler bei der Aktion")
    } finally {
      setActionBusy(false)
    }
  }

  if (loading) return <p className="text-[#6B7280] text-sm">Lade Offer...</p>
  if (error) return <p className="text-red-400 text-sm">{error}</p>
  if (!offer) return <p className="text-[#6B7280] text-sm">Kein Offer gefunden.</p>

  const order = offer.order

  return (
    <div className="space-y-4 page-transition">
      <div>
        <h1 className="text-white text-2xl font-bold">Offer Details</h1>
        <p className="text-[#6B7280] mt-0.5 text-xs">Broadcast-Anfrage</p>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6 space-y-3">
        <div>
          <p className="text-[#6B7280] text-xs">Status</p>
          <p className="text-white text-sm">{offer.status}</p>
        </div>
        <div>
          <p className="text-[#6B7280] text-xs">Auftragstyp</p>
          <p className="text-white text-sm">{order?.type || "—"}</p>
        </div>
        <div>
          <p className="text-[#6B7280] text-xs">Beschreibung</p>
          <p className="text-white text-sm">{order?.description || "—"}</p>
        </div>
        <div>
          <p className="text-[#6B7280] text-xs">Kunde</p>
          <p className="text-white text-sm">{order?.customer_data?.name || "—"}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="pro-button-secondary"
          onClick={handleDecline}
          disabled={actionBusy || offer.status !== "sent"}
        >
          Ablehnen
        </button>
      </div>
    </div>
  )
}
