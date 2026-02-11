"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ProInvoiceNewPage() {
  const router = useRouter()
  const [orderId, setOrderId] = useState("")
  const [netAmount, setNetAmount] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setError(null)
    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch("/api/pro/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          order_id: orderId,
          net_amount: Number(netAmount),
          description: description || null,
          due_date: dueDate || null,
        }),
      })
      const data = await res.json()
      if (!data?.success) throw new Error(data?.error || "Rechnung konnte nicht erstellt werden")
      router.push("/pro/billing")
    } catch (err: any) {
      setError(err?.message || "Fehler beim Erstellen")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h1 className="pro-h1">Neue Rechnung</h1>
        <p className="pro-body-small mt-1 text-[#6B7280]">Rechnung für einen Auftrag erstellen</p>
      </div>

      <div className="pro-card space-y-3">
        <div>
          <label className="pro-label">Order ID</label>
          <input
            className="pro-input"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="UUID des Auftrags"
          />
        </div>
        <div>
          <label className="pro-label">Netto Betrag</label>
          <input
            className="pro-input"
            value={netAmount}
            onChange={(e) => setNetAmount(e.target.value)}
            placeholder="z.B. 1200"
          />
        </div>
        <div>
          <label className="pro-label">Fälligkeitsdatum</label>
          <input
            type="date"
            className="pro-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div>
          <label className="pro-label">Beschreibung</label>
          <textarea
            className="pro-input min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibung zur Rechnung"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          className="pro-button-primary"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Erstelle..." : "Rechnung erstellen"}
        </button>
      </div>
    </div>
  )
}
