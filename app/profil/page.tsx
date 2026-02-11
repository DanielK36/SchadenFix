"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { User, Mail, Phone, MapPin, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { User as SupabaseUser } from "@supabase/supabase-js"
import { signOut } from "@/lib/auth"

export default function ProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
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
      setLoading(false)
    })
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#deded7] flex items-center justify-center">
        <div className="text-stone-600">Lade Profil...</div>
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
          Profil
        </h1>
        <p className="text-stone-500 font-medium text-base md:text-lg">
          Ihre Kontaktdaten und Einstellungen
        </p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden"
      >
        {/* Avatar Section */}
        <div className="bg-stone-50 px-6 md:px-8 py-8 md:py-10 flex items-center gap-4 md:gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-stone-900 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-stone-900">
              {user.user_metadata?.full_name || user.email?.split("@")[0] || "Nutzer"}
            </h2>
            <p className="text-stone-500 text-sm md:text-base">{user.email}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="divide-y divide-stone-100">
          {/* Email */}
          <div className="px-6 md:px-8 py-4 md:py-5 flex items-center gap-3 md:gap-4">
            <Mail className="w-5 h-5 text-stone-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-500 mb-1">E-Mail</p>
              <p className="text-stone-900 font-medium break-all">{user.email}</p>
            </div>
          </div>

          {/* User ID */}
          <div className="px-6 md:px-8 py-4 md:py-5 flex items-center gap-3 md:gap-4">
            <User className="w-5 h-5 text-stone-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-500 mb-1">Nutzer-ID</p>
              <p className="text-stone-900 font-mono text-sm break-all">{user.id.slice(0, 8)}...</p>
            </div>
          </div>

          {/* Created At */}
          {user.created_at && (
            <div className="px-6 md:px-8 py-4 md:py-5 flex items-center gap-3 md:gap-4">
              <MapPin className="w-5 h-5 text-stone-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-500 mb-1">Registriert am</p>
                <p className="text-stone-900 font-medium">
                  {new Date(user.created_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Settings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 md:mt-8 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden"
      >
        <div className="px-6 md:px-8 py-4 md:py-6">
          <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-4">Einstellungen</h3>
          
          <div className="space-y-3">
            <p className="text-sm md:text-base text-stone-500">
              Ihre Kontaktdaten werden automatisch aus Ihren Schadenmeldungen übernommen.
              Bei Fragen kontaktieren Sie uns bitte direkt.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sign Out Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={handleSignOut}
        className="mt-6 md:mt-8 w-full px-6 py-4 rounded-2xl bg-white border border-stone-200 text-stone-700 font-medium hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        <span>Abmelden</span>
      </motion.button>
    </>
  )
}
