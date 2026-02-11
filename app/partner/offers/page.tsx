"use client"

import { useEffect, useState } from "react"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function PartnerOffersPage() {
  const { isDemoMode } = useDemoMode()
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        if (isDemoMode) {
          setOffers([])
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch("/api/partner/offers", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!data?.success) throw new Error(data?.error || "Failed to load offers")
        setOffers(data.offers || [])
      } catch (e) {
        console.warn(e)
        setOffers([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isDemoMode])

  return (
    <div className="space-y-4 page-transition">
      <div>
        <h1 className="text-white text-2xl font-bold">Offers</h1>
        <p className="text-[#6B7280] mt-0.5 text-xs">Broadcast-Anfragen zur Annahme</p>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
        {loading ? (
          <p className="text-[#6B7280] text-sm">Lade Offers...</p>
        ) : offers.length === 0 ? (
          <p className="text-[#6B7280] text-sm">
            Noch keine Offers. (Demo: später hängen wir hier die Broadcast-Logik an.)
          </p>
        ) : (
          <div className="space-y-3">
            {offers.map((o) => (
              <div key={o.id} className="bg-[#000000] rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      Order {String(o.order_id).slice(0, 8)}...
                    </p>
                    <p className="text-[#6B7280] text-xs mt-1">Status: {o.status}</p>
                  </div>
                  <Link
                    href={`/partner/offers/${o.id}`}
                    className="text-[#B8903A] text-sm font-semibold hover:underline whitespace-nowrap"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

