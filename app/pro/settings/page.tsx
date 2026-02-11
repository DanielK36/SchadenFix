"use client"

import { useState, useEffect } from "react"
import { mockProfile } from "@/lib/mock/proData"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, FileText, Bell, Save } from "lucide-react"
import { motion } from "framer-motion"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { professionOptions } from "@/lib/constants/professions"
import { supabase } from "@/lib/supabase"

const defaultNotifications = { emailNewOrders: true, emailOrderChanges: true }

const getEmptyProfile = () => ({
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  zip: "",
  city: "",
  iban: "",
  accountHolder: "",
  taxId: "",
})

export default function ProSettingsPage() {
  const { isDemoMode } = useDemoMode()
  const [profile, setProfile] = useState<Record<string, string>>(getEmptyProfile())
  const [notifications, setNotifications] = useState(defaultNotifications)
  const [professions, setProfessions] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadProfile = async () => {
    if (isDemoMode) {
      const m = mockProfile as Record<string, unknown>
      setProfile({
        ...getEmptyProfile(),
        companyName: (m.companyName as string) ?? "",
        contactPerson: (m.contactPerson as string) ?? "",
        email: (m.email as string) ?? "",
        phone: (m.phone as string) ?? "",
        address: (m.address as string) ?? "",
        zip: (m.zip as string) ?? "",
        city: (m.city as string) ?? "",
        iban: (m.iban as string) ?? "",
        accountHolder: (m.accountHolder as string) ?? "",
        taxId: (m.taxId as string) ?? "",
      })
      setNotifications((mockProfile as any).notifications ?? defaultNotifications)
      setProfessions(["trocknung", "maler"])
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Error loading profile:", error)
        setLoading(false)
        return
      }

      const p = profileData as Record<string, unknown> | null
      setProfile({
        ...getEmptyProfile(),
        companyName: (p?.company_name as string) ?? "",
        contactPerson: (p?.contact_person as string) ?? "",
        email: (p?.email as string) ?? "",
        phone: (p?.phone as string) ?? "",
        address: (p?.address as string) ?? "",
        zip: (p?.zip as string) ?? "",
        city: (p?.city as string) ?? "",
        iban: (p?.iban as string) ?? "",
        accountHolder: (p?.account_holder as string) ?? "",
        taxId: (p?.tax_id as string) ?? "",
      })

      if (p?.professions && Array.isArray(p.professions)) {
        setProfessions(p.professions as string[])
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [isDemoMode])

  const handleSave = async () => {
    if (isDemoMode) {
      setHasChanges(false)
      console.log("Demo: Settings saved:", { profile, notifications, professions })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Bitte melden Sie sich an")
        return
      }

      const { error: profError } = await supabase
        .from("profiles")
        .update({
          company_name: profile.companyName ?? "",
          professions,
          contact_person: profile.contactPerson ?? null,
          email: profile.email ?? null,
          phone: profile.phone ?? null,
          address: profile.address ?? null,
          zip: profile.zip ?? null,
          city: profile.city ?? null,
          iban: profile.iban ?? null,
          account_holder: profile.accountHolder ?? null,
          tax_id: profile.taxId ?? null,
        })
        .eq("id", user.id)

      if (profError) {
        console.error("Error saving settings:", profError)
        alert("Fehler beim Speichern")
        return
      }

      setHasChanges(false)
      await loadProfile()
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Fehler beim Speichern")
    }
  }

  const handleProfessionToggle = (professionKey: string) => {
    const newProfessions = professions.includes(professionKey)
      ? professions.filter((p) => p !== professionKey)
      : [...professions, professionKey]
    setProfessions(newProfessions)
    setHasChanges(true)
  }

  const handleProfileChange = (field: string, value: any) => {
    setProfile({ ...profile, [field]: value })
    setHasChanges(true)
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications({ ...notifications, [field]: value })
    setHasChanges(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Einstellungen</h1>
        <p className="text-slate-500">Verwalte dein Profil und deine Präferenzen</p>
      </div>

      <div className="space-y-6">
        {/* Box 1: Firmenprofil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Firmenprofil</h2>
              <p className="text-sm text-slate-500">Grundlegende Firmeninformationen</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Firmenname</label>
              <Input
                value={profile.companyName ?? ""}
                onChange={(e) => handleProfileChange("companyName", e.target.value)}
                className="bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Ansprechpartner</label>
              <Input
                value={profile.contactPerson ?? ""}
                onChange={(e) => handleProfileChange("contactPerson", e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">E-Mail</label>
                <Input
                  type="email"
                  value={profile.email ?? ""}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Telefon</label>
                <Input
                  type="tel"
                  value={profile.phone ?? ""}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Adresse</label>
              <Input
                value={profile.address ?? ""}
                onChange={(e) => handleProfileChange("address", e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">PLZ</label>
                <Input
                  value={profile.zip ?? ""}
                  onChange={(e) => handleProfileChange("zip", e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Ort</label>
                <Input
                  value={profile.city ?? ""}
                  onChange={(e) => handleProfileChange("city", e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Gewerke</label>
              <p className="text-xs text-slate-500 mb-3">
                Wählen Sie die Gewerke aus, die Sie anbieten
              </p>
              {loading ? (
                <p className="text-sm text-slate-500">Lade Gewerke...</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 border border-slate-200 rounded-md p-3 bg-white">
                  {professionOptions.map((prof) => (
                    <label
                      key={prof.key}
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                        professions.includes(prof.key)
                          ? "bg-[#B8903A]/10 border-2 border-[#B8903A]"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={professions.includes(prof.key)}
                        onChange={() => handleProfessionToggle(prof.key)}
                        className="rounded border-gray-300 text-[#B8903A] focus:ring-[#B8903A]"
                      />
                      <span className="text-lg">{prof.icon}</span>
                      <span className="text-sm text-slate-700">{prof.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Box 2: Rechtliches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Rechtliches</h2>
              <p className="text-sm text-slate-500">Bankdaten und Steuerinformationen</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">IBAN</label>
              <Input
                value={profile.iban || ""}
                onChange={(e) => handleProfileChange("iban", e.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
                className="bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Kontoinhaber</label>
              <Input
                value={profile.accountHolder || ""}
                onChange={(e) => handleProfileChange("accountHolder", e.target.value)}
                className="bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Steuernummer</label>
              <Input
                value={profile.taxId || ""}
                onChange={(e) => handleProfileChange("taxId", e.target.value)}
                placeholder="Optional"
                className="bg-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Box 3: Benachrichtigungen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Benachrichtigungen</h2>
              <p className="text-sm text-slate-500">E-Mail-Benachrichtigungen verwalten</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">E-Mail bei neuen Aufträgen</p>
                <p className="text-xs text-slate-500 mt-1">
                  Erhalten Sie eine E-Mail bei neuen Aufträgen
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailNewOrders}
                  onChange={(e) =>
                    handleNotificationChange("emailNewOrders", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#B8903A] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B8903A]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">E-Mail bei geänderten Aufträgen</p>
                <p className="text-xs text-slate-500 mt-1">
                  Erhalten Sie eine E-Mail bei Änderungen an Aufträgen
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailOrderChanges}
                  onChange={(e) =>
                    handleNotificationChange("emailOrderChanges", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#B8903A] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B8903A]"></div>
              </label>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky Save Button with Glassmorphism */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
          style={{
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md border-t border-slate-200/50 rounded-t-2xl shadow-lg p-4">
              <Button
                onClick={handleSave}
                className="w-full bg-[#B8903A] text-slate-900 hover:bg-[#A67C2A] font-semibold shadow-md py-6 text-base"
              >
                <Save className="w-5 h-5 mr-2" />
                Änderungen speichern
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
