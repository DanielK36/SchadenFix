"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { FileText, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { User as SupabaseUser } from "@supabase/supabase-js"

interface Claim {
  id: string
  type: string
  description: string
  createdAt: string
  status: "eingegangen" | "weitergeleitet" | "in_bearbeitung" | "abgeschlossen"
  contact: {
    email: string
  }
}

const statusConfig = {
  eingegangen: {
    label: "Eingegangen",
    icon: Clock,
    color: "text-stone-700",
    bgColor: "bg-stone-50",
    borderColor: "border-stone-200/50",
  },
  weitergeleitet: {
    label: "Weitergeleitet",
    icon: ArrowRight,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200/50",
  },
  in_bearbeitung: {
    label: "In Bearbeitung",
    icon: AlertCircle,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200/50",
  },
  abgeschlossen: {
    label: "Abgeschlossen",
    icon: CheckCircle2,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200/50",
  },
}

const typeLabels: Record<string, string> = {
  wasser: "Wasserschaden",
  feuer: "Feuerschaden",
  sturm: "Sturmschaden",
  kfz: "KFZ-Schaden",
  glas: "Glasschaden",
  gebaeude: "Gebäudeschaden",
  recht: "Recht & Gutachten",
  sonstiges: "Sonstiges",
}

export default function MeineMeldungenPage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    getCurrentUser().then((user) => {
      if (!user) {
        // Redirect to home if not authenticated
        router.push("/")
        return
      }
      setUser(user)
      
      // Fetch claims for this user
      fetchClaims(user.email || "")
    })
  }, [router])

  const fetchClaims = async (email: string) => {
    try {
      const response = await fetch(`/api/claims?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.success) {
        setClaims(data.claims || [])
      }
    } catch (error) {
      console.error("Error fetching claims:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#deded7] flex items-center justify-center">
        <div className="text-stone-600">Lade Meldungen...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 tracking-tighter mb-2 md:mb-3">
          Meine Meldungen
        </h1>
        <p className="text-stone-500 font-medium text-base md:text-lg">
          Übersicht aller Ihrer Schadenmeldungen
        </p>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 md:p-12 text-center">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-600 font-medium mb-2">Noch keine Meldungen</p>
          <p className="text-stone-400 text-sm">
            Ihre Schadenmeldungen werden hier angezeigt, sobald Sie eine erstellt haben.
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {claims.map((claim, index) => {
            const statusInfo = statusConfig[claim.status]
            const StatusIcon = statusInfo.icon
            
            return (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-5 md:p-7 shadow-sm border border-stone-100 hover:shadow-lg hover:border-stone-200 transition-all duration-200 cursor-pointer group"
                onClick={() => router.push(`/meine-meldungen/${claim.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <span className="text-xs md:text-sm font-semibold text-stone-900 bg-gradient-to-br from-stone-50 to-stone-100 px-3 py-1.5 rounded-lg border border-stone-200/50 shadow-sm">
                        {typeLabels[claim.type] || claim.type}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        #{claim.id.slice(0, 8)}
                      </span>
                    </div>
                    
                    <p className="text-stone-900 font-semibold mb-3 md:mb-4 line-clamp-2 text-sm md:text-base group-hover:text-stone-700 transition-colors">
                      {claim.description || "Keine Beschreibung"}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-stone-500 font-medium">
                      <span>
                        {new Date(claim.createdAt).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor} flex-shrink-0 shadow-sm`}>
                    <StatusIcon className={`w-4 h-4 md:w-5 md:h-5 ${statusInfo.color}`} />
                    <span className={`text-xs font-semibold ${statusInfo.color} hidden sm:inline`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </>
  )
}
