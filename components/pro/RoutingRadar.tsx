"use client"

import { motion } from "framer-motion"
import { Search, CheckCircle2, Clock, MapPin, Star } from "lucide-react"

interface RoutingLead {
  id: string
  orderId: string
  trade: string
  status: "searching" | "found" | "accepted"
  partnerName?: string
  partnerRating?: number
  distance?: number
}

interface RoutingRadarProps {
  leads: RoutingLead[]
}

export function RoutingRadar({ leads }: RoutingRadarProps) {
  const getStatusIcon = (status: RoutingLead["status"]) => {
    switch (status) {
      case "searching":
        return (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-3 h-3 bg-blue-500 rounded-full"
          />
        )
      case "found":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "accepted":
        return <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
      default:
        return null
    }
  }

  const getStatusText = (lead: RoutingLead) => {
    switch (lead.status) {
      case "searching":
        return "Suche Partner im Netzwerk..."
      case "found":
        return `Partner gefunden: ${lead.partnerName} (${lead.partnerRating} ⭐)`
      case "accepted":
        return "Auftrag angenommen - Provision gesichert"
      default:
        return ""
    }
  }

  const getStatusColor = (status: RoutingLead["status"]) => {
    switch (status) {
      case "searching":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "found":
        return "text-green-600 bg-green-50 border-green-200"
      case "accepted":
        return "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20"
      default:
        return ""
    }
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Noch keine ausgehenden Leads</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg font-bold text-slate-900">Vermittlungs-Radar</h3>
        <p className="text-sm text-slate-500 mt-1">Ausgehende Leads im Netzwerk</p>
      </div>
      <div className="divide-y divide-slate-200">
        {leads.map((lead) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">{getStatusIcon(lead.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <p className="text-sm font-semibold text-slate-900">
                    Du hast einen {lead.trade} gesucht
                  </p>
                  <span className="text-xs text-slate-400">(Auftrag #{lead.orderId})</span>
                </div>
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${getStatusColor(
                    lead.status
                  )}`}
                >
                  <span>{getStatusText(lead)}</span>
                </div>
                {lead.distance && (
                  <div className="flex items-center space-x-1 mt-2 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    <span>{lead.distance} km entfernt</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

