"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, X, Calendar, Clock, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

interface ExternalRequestProps {
  orderId: string
  orderZip?: string
  onRequest?: (trade: string, urgency: string, date?: string) => Promise<void>
}

// Map UI trade IDs to database profession values
const tradeToProfession: Record<string, string> = {
  painter: "maler",
  flooring: "bodenleger",
  drying: "trocknung",
  assessor: "gutachter",
  electrician: "elektriker",
  plumber: "sanitaer",
  carpenter: "tischler",
  roofer: "dachdecker",
}

const trades = [
  { id: "painter", name: "Maler", icon: "🎨" },
  { id: "flooring", name: "Fliesenleger", icon: "🧱" },
  { id: "drying", name: "Trocknung", icon: "💨" },
  { id: "assessor", name: "Gutachter", icon: "📋" },
  { id: "electrician", name: "Elektriker", icon: "⚡" },
  { id: "plumber", name: "Sanitär", icon: "🔧" },
  { id: "carpenter", name: "Tischler", icon: "🪵" },
  { id: "roofer", name: "Dachdecker", icon: "🏠" },
]

const urgencyOptions = [
  { value: "asap", label: "Sofort (Notfall)" },
  { value: "today", label: "Heute" },
  { value: "tomorrow", label: "Morgen" },
  { value: "this_week", label: "Diese Woche" },
  { value: "next_week", label: "Nächste Woche" },
  { value: "flexible", label: "Flexibel" },
]

export function ExternalRequest({ orderId, orderZip, onRequest }: ExternalRequestProps) {
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null)
  const [urgency, setUrgency] = useState("")
  const [customDate, setCustomDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedTrades, setSubmittedTrades] = useState<string[]>([])
  const [partners, setPartners] = useState<Array<{ id: string; name: string; rating: number }>>([])
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null)
  const [isSearchingPartners, setIsSearchingPartners] = useState(false)

  // Search for partners when trade is selected
  const searchPartners = async (tradeId: string) => {
    const profession = tradeToProfession[tradeId]
    if (!profession) return

    setIsSearchingPartners(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      
      const params = new URLSearchParams({ profession })
      if (orderZip) {
        params.append("zip", orderZip)
      }

      const res = await fetch(`/api/pro/partners/search?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const data = await res.json()

      if (data.success && data.partners) {
        setPartners(data.partners)
        // Auto-select first partner if available
        if (data.partners.length > 0) {
          setSelectedPartner(data.partners[0].id)
        }
      } else {
        setPartners([])
        setSelectedPartner(null)
      }
    } catch (error) {
      console.error("Error searching partners:", error)
      setPartners([])
      setSelectedPartner(null)
    } finally {
      setIsSearchingPartners(false)
    }
  }

  const handleTradeSelect = (tradeId: string) => {
    setSelectedTrade(tradeId)
    setSelectedPartner(null)
    setPartners([])
    searchPartners(tradeId)
  }

  const handleRequest = async () => {
    if (!selectedTrade || !urgency) return

    // If we have a selected partner, assign them
    if (selectedPartner) {
      setIsSubmitting(true)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        
        const res = await fetch(`/api/pro/orders/${orderId}/assign-partner`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ partnerId: selectedPartner }),
        })

        const data = await res.json()
        if (!data.success) {
          throw new Error(data.error || "Fehler beim Zuweisen des Partners")
        }

        // Call optional onRequest callback
        if (onRequest) {
          await onRequest(selectedTrade, urgency, customDate)
        }

        setSubmittedTrades([...submittedTrades, selectedTrade])
        // Reset form
        setSelectedTrade(null)
        setUrgency("")
        setCustomDate("")
        setPartners([])
        setSelectedPartner(null)
      } catch (error: any) {
        console.error("Error assigning partner:", error)
        alert(error.message || "Fehler beim Zuweisen des Partners")
      } finally {
        setIsSubmitting(false)
      }
    } else if (onRequest) {
      // Fallback to original behavior if no partner selected
      setIsSubmitting(true)
      try {
        await onRequest(selectedTrade, urgency, customDate)
        setSubmittedTrades([...submittedTrades, selectedTrade])
        setSelectedTrade(null)
        setUrgency("")
        setCustomDate("")
      } catch (error) {
        console.error("Error submitting request:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const showDatePicker = urgency === "flexible"

  return (
    <div className="space-y-3">

      {/* Success Messages */}
      {submittedTrades.length > 0 && (
        <div className="space-y-2 mb-3">
          {submittedTrades.map((tradeId) => {
            const trade = trades.find((t) => t.id === tradeId)
            return (
              <motion.div
                key={tradeId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 bg-green-50 border border-green-200 rounded text-xs flex items-center space-x-2"
              >
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <p className="text-green-800">
                  {trade?.name} läuft
                </p>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Trade Selection Chips */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1.5">
          {trades.map((trade) => {
            const isSelected = selectedTrade === trade.id
            const isSubmitted = submittedTrades.includes(trade.id)
            return (
              <button
                key={trade.id}
                onClick={() => !isSubmitted && handleTradeSelect(trade.id)}
                disabled={isSubmitted}
                className={`px-2.5 py-1.5 rounded-lg font-medium text-xs transition-all active:scale-[0.98] ${
                  isSubmitted
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : isSelected
                      ? "bg-[#B8903A] text-slate-900 shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span className="mr-1">{trade.icon}</span>
                {trade.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Urgency Selection */}
      {selectedTrade && !submittedTrades.includes(selectedTrade) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="bg-white text-sm">
              <SelectValue placeholder="Wann benötigt?" />
            </SelectTrigger>
            <SelectContent>
              {urgencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Date Picker */}
          <AnimatePresence>
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="bg-white text-sm"
                  min={new Date().toISOString().split("T")[0]}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Partner Selection */}
          {isSearchingPartners && (
            <div className="text-sm text-slate-500 text-center py-2">
              Suche Partner...
            </div>
          )}

          {!isSearchingPartners && partners.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">Partner auswählen:</label>
              <Select value={selectedPartner || ""} onValueChange={setSelectedPartner}>
                <SelectTrigger className="bg-white text-sm">
                  <SelectValue placeholder="Partner auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name} ({partner.rating} ⭐)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!isSearchingPartners && partners.length === 0 && selectedTrade && (
            <div className="text-xs text-slate-500 text-center py-2">
              Keine Partner gefunden für dieses Gewerk
            </div>
          )}

          <Button
            onClick={handleRequest}
            disabled={!urgency || isSubmitting || (partners.length > 0 && !selectedPartner)}
            className="w-full bg-orange-600 text-white hover:bg-orange-700 font-semibold text-sm"
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Wird zugewiesen...
              </>
            ) : (
              <>
                <ExternalLink className="w-3 h-3 mr-2" />
                {partners.length > 0 ? "Partner zuweisen" : "Anfrage senden"}
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  )
}

