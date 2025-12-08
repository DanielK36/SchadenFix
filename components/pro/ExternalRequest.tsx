"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, X, Calendar, Clock, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExternalRequestProps {
  onRequest: (trade: string, urgency: string, date?: string) => Promise<void>
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

export function ExternalRequest({ onRequest }: ExternalRequestProps) {
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null)
  const [urgency, setUrgency] = useState("")
  const [customDate, setCustomDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedTrades, setSubmittedTrades] = useState<string[]>([])

  const handleRequest = async () => {
    if (!selectedTrade || !urgency) return

    setIsSubmitting(true)
    try {
      await onRequest(selectedTrade, urgency, customDate)
      setSubmittedTrades([...submittedTrades, selectedTrade])
      // Reset form
      setSelectedTrade(null)
      setUrgency("")
      setCustomDate("")
    } catch (error) {
      console.error("Error submitting request:", error)
    } finally {
      setIsSubmitting(false)
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
                onClick={() => !isSubmitted && setSelectedTrade(trade.id)}
                disabled={isSubmitted}
                className={`px-2.5 py-1.5 rounded-lg font-medium text-xs transition-all active:scale-[0.98] ${
                  isSubmitted
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : isSelected
                      ? "bg-[#D4AF37] text-slate-900 shadow-md"
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

          <Button
            onClick={handleRequest}
            disabled={!urgency || isSubmitting}
            className="w-full bg-orange-600 text-white hover:bg-orange-700 font-semibold text-sm"
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              <>
                <ExternalLink className="w-3 h-3 mr-2" />
                Anfrage senden
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  )
}

