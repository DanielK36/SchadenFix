"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { AnimatedButton } from "@/components/partner/AnimatedButton"
import { toast } from "sonner"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { supabase } from "@/lib/supabase"
import { LogOut } from "lucide-react"

export default function PartnerSettingsPage() {
  const router = useRouter()
  const { isDemoMode } = useDemoMode()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ companyName: "", email: "" })
  const [bank, setBank] = useState({ iban: "", accountHolder: "", taxId: "" })

  const handleLogout = async () => {
    try {
      const { signOutPro } = await import("@/lib/auth")
      await signOutPro()
      router.push("/partner/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/partner/login")
      router.refresh()
    }
  }

  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      try {
        if (isDemoMode) {
          setProfile({ companyName: "Demo Partner", email: "demo@example.com" })
          setBank({ iban: "DE89 3704 0044 0532 0130 00", accountHolder: "Demo Partner", taxId: "" })
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const [profileRes, paymentRes] = await Promise.all([
          fetch("/api/partner/settings/profile", {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
          fetch("/api/partner/settings/payment", {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
        ])
        const profileData = await profileRes.json()
        const paymentData = await paymentRes.json()

        if (profileData?.success) {
          setProfile({
            companyName: profileData.profile.company_name || "",
            email: profileData.profile.email || "",
          })
        }
        if (paymentData?.success && paymentData.payment) {
          setBank({
            iban: paymentData.payment.iban || "",
            accountHolder: paymentData.payment.account_holder || "",
            taxId: paymentData.payment.tax_id || "",
          })
        }
      } catch (error) {
        console.warn(error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [isDemoMode])

  const handleSaveProfile = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch("/api/partner/settings/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          company_name: profile.companyName,
          email: profile.email,
        }),
      })
      const data = await res.json()
      if (!data?.success) throw new Error(data?.error || "Profil konnte nicht gespeichert werden")
      toast.success("Profil gespeichert")
    } catch (error: any) {
      toast.error(error?.message || "Fehler beim Speichern")
    }
  }

  const handleSavePayment = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch("/api/partner/settings/payment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          iban: bank.iban,
          accountHolder: bank.accountHolder,
          taxId: bank.taxId,
        }),
      })
      const data = await res.json()
      if (!data?.success) throw new Error(data?.error || "Zahlungsdaten konnten nicht gespeichert werden")
      toast.success("Zahlungsdaten gespeichert")
    } catch (error: any) {
      toast.error(error?.message || "Fehler beim Speichern")
    }
  }

  return (
    <div className="space-y-4 page-transition">
      <div>
        <h1 className="partner-h1 text-2xl">Einstellungen</h1>
        <p className="partner-body-small mt-0.5 text-xs">Profil und Auszahlung verwalten</p>
      </div>

      {/* Profil-Daten */}
      <div className="partner-card p-3 md:p-4">
        <h2 className="partner-h2 mb-2 md:mb-3 text-base md:text-lg">Profil-Daten</h2>
        {loading ? (
          <p className="text-[#6B7280] text-sm">Lade Profil...</p>
        ) : (
          <div className="space-y-2 md:space-y-3 max-w-lg">
            <div>
              <label className="partner-body-small block mb-1.5 text-xs">Firmenname</label>
              <Input
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                className="bg-[#0A0A0A] border-[#B8903A]/30 text-[#EAEAEA]"
              />
            </div>
            <div>
              <label className="partner-body-small block mb-1.5 text-xs">E-Mail</label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-[#0A0A0A] border-[#B8903A]/30 text-[#EAEAEA]"
              />
            </div>
            <div className="flex justify-end">
              <AnimatedButton onClick={handleSaveProfile} className="bg-[#B8903A] text-[#000000] px-5 py-2 rounded-xl">
                Profil speichern
              </AnimatedButton>
            </div>
          </div>
        )}
      </div>

      {/* Bankdaten */}
      <div className="partner-card p-3 md:p-4">
        <h2 className="partner-h2 mb-2 md:mb-3 text-base md:text-lg">Auszahlungsdaten</h2>
        {loading ? (
          <p className="text-[#6B7280] text-sm">Lade Zahlungsdaten...</p>
        ) : (
          <div className="space-y-2 md:space-y-3 max-w-lg">
            <div>
              <label className="partner-body-small block mb-1.5 text-xs">IBAN</label>
              <Input
                value={bank.iban}
                onChange={(e) => setBank({ ...bank, iban: e.target.value })}
                className="bg-[#0A0A0A] border-[#B8903A]/30 text-[#EAEAEA]"
              />
            </div>
            <div>
              <label className="partner-body-small block mb-1.5 text-xs">Kontoinhaber</label>
              <Input
                value={bank.accountHolder}
                onChange={(e) => setBank({ ...bank, accountHolder: e.target.value })}
                className="bg-[#0A0A0A] border-[#B8903A]/30 text-[#EAEAEA]"
              />
            </div>
            <div>
              <label className="partner-body-small block mb-1.5 text-xs">Steuer-ID (optional)</label>
              <Input
                value={bank.taxId}
                onChange={(e) => setBank({ ...bank, taxId: e.target.value })}
                className="bg-[#0A0A0A] border-[#B8903A]/30 text-[#EAEAEA]"
              />
            </div>
            <div className="flex justify-end">
              <AnimatedButton onClick={handleSavePayment} className="bg-[#B8903A] text-[#000000] px-5 py-2 rounded-xl">
                Zahlungsdaten speichern
              </AnimatedButton>
            </div>
          </div>
        )}
      </div>

      {/* Logout Section */}
      <div className="partner-card p-3 md:p-4">
        <h2 className="partner-h2 mb-2 md:mb-3 text-base md:text-lg">Abmelden</h2>
        <div className="flex justify-end">
          <AnimatedButton 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Abmelden</span>
          </AnimatedButton>
        </div>
      </div>
    </div>
  )
}
