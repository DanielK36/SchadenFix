"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, MapPin, Star, Send, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Partner {
  id: string
  name: string
  rating: number
  distance: number
  trade: string
  address: string
}

interface PartnerSearchProps {
  onSendRequest?: (partnerId: string) => void
}

const mockPartners: Partner[] = [
  {
    id: "partner-1",
    name: "Malerbetrieb Müller",
    rating: 4.8,
    distance: 2.5,
    trade: "Maler",
    address: "Musterstraße 1, 41061 Mönchengladbach",
  },
  {
    id: "partner-2",
    name: "Trocknungsexperten GmbH",
    rating: 4.6,
    distance: 5.2,
    trade: "Trocknung",
    address: "Industriestraße 15, 41065 Mönchengladbach",
  },
  {
    id: "partner-3",
    name: "Gutachter Schmidt",
    rating: 4.9,
    distance: 8.1,
    trade: "Gutachter",
    address: "Hauptstraße 42, 41063 Mönchengladbach",
  },
  {
    id: "partner-4",
    name: "Bodenleger Weber",
    rating: 4.7,
    distance: 3.8,
    trade: "Bodenleger",
    address: "Nebenstraße 7, 41064 Mönchengladbach",
  },
]

const trades = ["Maler", "Trocknung", "Gutachter", "Bodenleger", "Elektriker", "Sanitär"]

export function PartnerSearch({ onSendRequest }: PartnerSearchProps) {
  const [zipCode, setZipCode] = useState("")
  const [selectedTrade, setSelectedTrade] = useState("")
  const [searchResults, setSearchResults] = useState<Partner[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)

  const handleSearch = () => {
    if (!zipCode || !selectedTrade) return

    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      // Filter mock partners by trade
      const filtered = mockPartners.filter((p) => p.trade === selectedTrade)
      setSearchResults(filtered)
      setIsSearching(false)
    }, 1000)
  }

  const handleSendRequest = (partnerId: string) => {
    setSendingRequest(partnerId)
    // Simulate API call
    setTimeout(() => {
      if (onSendRequest) {
        onSendRequest(partnerId)
      }
      setSendingRequest(null)
      // Show success message (could use toast)
      alert("Anfrage erfolgreich gesendet!")
    }, 1500)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Handwerker finden</h3>
        <p className="text-sm text-slate-500">
          Suche nach Partnern im FixPortal-Netzwerk
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">PLZ</label>
          <Input
            type="text"
            placeholder="41061"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            maxLength={5}
            className="bg-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Gewerk</label>
          <Select value={selectedTrade} onValueChange={setSelectedTrade}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Gewerk auswählen" />
            </SelectTrigger>
            <SelectContent>
              {trades.map((trade) => (
                <SelectItem key={trade} value={trade}>
                  {trade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleSearch}
          disabled={!zipCode || !selectedTrade || isSearching}
          className="w-full bg-[#B8903A] text-slate-900 hover:bg-[#A67C2A] font-semibold"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Suche...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Suchen
            </>
          )}
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h4 className="text-sm font-semibold text-slate-900">
            {searchResults.length} Partner gefunden
          </h4>
          {searchResults.map((partner) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 border border-slate-200 rounded-lg hover:border-[#B8903A] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-slate-900 mb-1">{partner.name}</h5>
                  <p className="text-xs text-slate-500 mb-2">{partner.address}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-slate-700">{partner.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{partner.distance} km</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleSendRequest(partner.id)}
                disabled={sendingRequest === partner.id}
                className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold"
                size="sm"
              >
                {sendingRequest === partner.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Anfrage senden
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {searchResults.length === 0 && zipCode && selectedTrade && !isSearching && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">Keine Partner gefunden</p>
          <p className="text-xs mt-1">Versuche eine andere PLZ oder ein anderes Gewerk</p>
        </div>
      )}
    </div>
  )
}

