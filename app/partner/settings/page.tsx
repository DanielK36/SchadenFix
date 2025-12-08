"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { AnimatedButton } from "@/components/partner/AnimatedButton"
import { toast } from "sonner"

export default function PartnerSettingsPage() {
  const [profile, setProfile] = useState({
    firstName: "Max",
    lastName: "Mustermann",
    email: "max@example.com",
    phone: "+49 151 12345678",
    address: "Musterstraße 12",
    zip: "41061",
    city: "Mönchengladbach",
  })

  const [bank, setBank] = useState({
    iban: "DE89 3704 0044 0532 0130 00",
    accountHolder: "Max Mustermann",
  })

  const [notifications, setNotifications] = useState({
    emailNewCommission: true,
    emailNewLead: true,
    emailPayout: true,
  })

  const handleSave = () => {
    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    // Toast
    toast.success("Einstellungen gespeichert! ✅", {
      duration: 2000,
    })
  }

  return (
    <div className="space-y-4 page-transition">
      <div>
        <h1 className="partner-h1 text-2xl">Einstellungen</h1>
        <p className="partner-body-small mt-0.5 text-xs">Profil und Einstellungen verwalten</p>
      </div>

      {/* Profil-Daten */}
      <div className="partner-card p-3 md:p-4">
        <h2 className="partner-h2 mb-2 md:mb-3 text-base md:text-lg">Profil-Daten</h2>
        <div className="space-y-2 md:space-y-3 max-w-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="partner-body-small block mb-1.5 text-xs">Vorname</label>
              <Input
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="bg-[#0A0A0A] border-[#FFD700]/30 text-[#EAEAEA]"
              />
            </div>
            <div>
              <label className="partner-body-small block mb-1.5 text-xs">Nachname</label>
              <Input
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="bg-[#0A0A0A] border-[#FFD700]/30 text-[#EAEAEA]"
              />
            </div>
          </div>
          <div>
            <label className="partner-body-small block mb-1.5 text-xs">E-Mail</label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="bg-[#0A0A0A] border-[#FFD700]/30 text-[#EAEAEA]"
            />
          </div>
          <div>
            <label className="partner-body-small block mb-1.5 text-xs">Telefon</label>
            <Input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="bg-[#0A0A0A] border-[#FFD700]/30 text-[#EAEAEA]"
            />
          </div>
          <div>
            <label className="partner-body-small block mb-1.5 text-xs">Adresse</label>
            <Input
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="bg-[#0A0A0A] border-[#FFD700]/30 text-[#EAEAEA]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="partner-body-small block mb-1.5 text-xs">PLZ</label>
              <Input
                value={profile.zip}
                onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
                className="bg-[#0A0A0A] border-[#FFD700]/30 text-[#EAEAEA]"
              />
            </div>
            <div>
              <label className="partner-body-small block mb-1.5 text-xs">Ort</label>
              <Input
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="bg-[#0A0A0A] border-[#FFD700]/30 text-[#EAEAEA]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bankverbindung */}
      <div className="partner-card p-3 md:p-4">
        <h2 className="partner-h2 mb-2 md:mb-3 text-base md:text-lg">Bankverbindung</h2>
        <div className="space-y-2 md:space-y-3 max-w-lg">
          <div>
            <label className="partner-body-small block mb-1.5 text-xs">IBAN</label>
            <Input
              value={bank.iban}
              onChange={(e) => setBank({ ...bank, iban: e.target.value })}
              className="bg-[#0A0A0A] border-[#FFD700]/30 text-[#EAEAEA]"
            />
          </div>
          <div>
            <label className="partner-body-small block mb-1.5 text-xs">Kontoinhaber</label>
            <Input
              value={bank.accountHolder}
              onChange={(e) => setBank({ ...bank, accountHolder: e.target.value })}
              className="bg-[#0A0A0A] border-[#FFD700]/30 text-[#EAEAEA]"
            />
          </div>
        </div>
      </div>

      {/* Benachrichtigungen */}
      <div className="partner-card p-3 md:p-4">
        <h2 className="partner-h2 mb-2 md:mb-3 text-base md:text-lg">Benachrichtigungen</h2>
        <div className="space-y-2 md:space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="partner-body text-[#EAEAEA] text-sm">E-Mail bei neuen Provisionen</p>
              <p className="partner-body-small text-[#9CA3AF] text-xs">
                Erhalten Sie eine E-Mail bei jeder neuen Provisionsgutschrift
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailNewCommission}
              onChange={(e) =>
                setNotifications({ ...notifications, emailNewCommission: e.target.checked })
              }
              className="w-5 h-5"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="partner-body text-[#EAEAEA] text-sm">E-Mail bei neuen Leads</p>
              <p className="partner-body-small text-[#9CA3AF] text-xs">
                Erhalten Sie eine E-Mail bei jedem neuen vermittelten Kunden
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailNewLead}
              onChange={(e) =>
                setNotifications({ ...notifications, emailNewLead: e.target.checked })
              }
              className="w-5 h-5"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="partner-body text-[#EAEAEA] text-sm">E-Mail bei Auszahlungen</p>
              <p className="partner-body-small text-[#9CA3AF] text-xs">
                Erhalten Sie eine E-Mail bei jeder erfolgten Auszahlung
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailPayout}
              onChange={(e) =>
                setNotifications({ ...notifications, emailPayout: e.target.checked })
              }
              className="w-5 h-5"
            />
          </div>
        </div>
      </div>

      {/* Passwort ändern */}
      <div className="partner-card p-3 md:p-4">
        <h2 className="partner-h2 mb-2 md:mb-3 text-base md:text-lg">Passwort ändern</h2>
        <div className="space-y-2 md:space-y-3 max-w-lg">
          <div>
            <label className="partner-body-small block mb-1.5 text-xs">Neues Passwort</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-[#0A0A0A] border-[#FFD700]/30 text-[#EAEAEA]"
            />
          </div>
          <div>
            <label className="partner-body-small block mb-1.5 text-xs">Passwort bestätigen</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-[#0A0A0A] border-[#FFD700]/30 text-[#EAEAEA]"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <AnimatedButton
          onClick={handleSave}
          className="partner-button-primary px-8 py-3"
        >
          Einstellungen speichern
        </AnimatedButton>
      </div>
    </div>
  )
}


