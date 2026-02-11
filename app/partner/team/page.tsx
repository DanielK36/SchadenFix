"use client"

import { useState, useEffect } from "react"
import { mockTeamMembers, mockDashboardKPIs } from "@/lib/mock/partnerData"
import { AnimatedNumber } from "@/components/partner/AnimatedNumber"
import { AnimatedButton } from "@/components/partner/AnimatedButton"
import { Copy, Mail, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function PartnerTeamPage() {
  const { isDemoMode } = useDemoMode()
  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [sendingInvite, setSendingInvite] = useState(false)
  const [magicLink, setMagicLink] = useState<string | null>(null)
  
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [totalTeamCommissions, setTotalTeamCommissions] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTeam() {
      setLoading(true)
      try {
        if (isDemoMode) {
          setTeamMembers(mockTeamMembers)
          setTotalTeamCommissions(
            mockTeamMembers.reduce((sum, m) => sum + m.monthlyCommissions, 0)
          )
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch("/api/partner/team/stats", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!data?.success) throw new Error(data?.error || "Failed to load team stats")
        setTeamMembers(data.teamMembers || [])
        setTotalTeamCommissions(data.totalTeamCommissions || 0)
      } catch (error) {
        console.warn(error)
        setTeamMembers([])
        setTotalTeamCommissions(0)
      } finally {
        setLoading(false)
      }
    }

    loadTeam()
  }, [isDemoMode])

  const handleCopy = () => {
    const linkToCopy = magicLink || "https://beispiel.de/partner/recruit/12345"
    navigator.clipboard.writeText(linkToCopy)
    setCopied(true)
    
    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    // Toast
    toast.success("Link kopiert! ✅", {
      duration: 2000,
    })
    
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein")
      return
    }

    setSendingInvite(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch("/api/partner/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: inviteEmail }),
      })

      const data = await res.json()

      if (data.success) {
        setMagicLink(data.invitation.magicLink)
        toast.success("Magic Link generiert! ✅", {
          duration: 3000,
        })
        setInviteEmail("")
      } else {
        toast.error(data.error || "Einladung konnte nicht erstellt werden")
      }
    } catch (err: any) {
      console.error("Error sending invite:", err)
      toast.error("Fehler beim Erstellen der Einladung")
    } finally {
      setSendingInvite(false)
    }
  }

  return (
    <div className="space-y-4 page-transition">
        <div>
          <h1 className="text-white text-2xl font-bold">Mein Team</h1>
          <p className="text-[#6B7280] mt-0.5 text-xs">Übersicht über Ihr Team und Team-Provisionen</p>
        </div>

        {/* Team KPIs */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
            <p className="text-[#6B7280] text-sm mb-2">Team-Provisionen (diesen Monat)</p>
            <p className="text-[#B8903A] text-3xl md:text-4xl font-bold">
              <AnimatedNumber
                value={totalTeamCommissions}
                duration={1.2}
                prefix="€ "
                decimals={0}
              />
            </p>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
            <p className="text-[#6B7280] text-sm mb-2">Team-Mitglieder</p>
            <p className="text-[#B8903A] text-3xl md:text-4xl font-bold">
              <AnimatedNumber
                value={teamMembers.length}
                duration={1.2}
                decimals={0}
              />
            </p>
          </div>
        </div>

      {/* Team Members */}
      <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Team-Mitglieder</h2>
        {loading ? (
          <p className="text-[#6B7280] text-sm">Lade Team-Mitglieder...</p>
        ) : (
          <>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase">
                  Beigetreten
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase">
                  Monats-Provisionen
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase">
                  Lifetime-Provisionen
                </th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-white/5 hover:bg-[#2A2A2A]/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="text-white text-sm">{member.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[#6B7280] text-sm">
                      {new Date(member.joinedAt).toLocaleDateString("de-DE")}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[#B8903A] text-sm font-semibold">
                      {member.monthlyCommissions.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white text-sm">
                      {member.totalCommissions.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-2">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-[#000000] rounded-xl p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-white font-semibold text-sm truncate">{member.name}</p>
                <p className="text-[#6B7280] text-[10px] flex-shrink-0">
                  {new Date(member.joinedAt).toLocaleDateString("de-DE", { month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[#6B7280] mb-0.5 text-[10px]">Monat</p>
                  <p className="text-[#B8903A] text-sm font-semibold">
                    {member.monthlyCommissions.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[#6B7280] mb-0.5 text-[10px]">Lifetime</p>
                  <p className="text-white text-sm font-semibold">
                    {member.totalCommissions.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
          </>
        )}
      </div>

      {/* Partner einladen */}
      <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Partner einladen</h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="partner@email.de"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 bg-[#000000] border-[#333333] text-[#EAEAEA]"
              disabled={sendingInvite}
            />
            <Button
              onClick={handleSendInvite}
              disabled={sendingInvite || !inviteEmail}
              className="bg-[#B8903A] text-[#000000] hover:bg-[#A67C2A] font-semibold whitespace-nowrap"
            >
              {sendingInvite ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Erstelle...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Einladung senden
                </>
              )}
            </Button>
          </div>

          {magicLink && (
            <div className="bg-[#0A0A0A] rounded-lg p-3 border border-[#B8903A]/20">
              <p className="text-xs text-[#6B7280] mb-2">Magic Link generiert:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={magicLink}
                  readOnly
                  className="flex-1 bg-[#000000] border border-[#B8903A]/20 rounded-lg px-3 py-2 text-xs text-white font-mono truncate"
                />
                <AnimatedButton
                  onClick={handleCopy}
                  className="bg-[#B8903A] text-[#000000] rounded-lg py-2 px-3 font-semibold text-xs flex items-center gap-1 hover:bg-[#A67C2A] transition-colors whitespace-nowrap"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? "Kopiert" : "Kopieren"}</span>
                </AnimatedButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
