"use client"

import { useState } from "react"
import { mockTeamMembers, mockDashboardKPIs } from "@/lib/mock/partnerData"
import { AnimatedNumber } from "@/components/partner/AnimatedNumber"
import { AnimatedButton } from "@/components/partner/AnimatedButton"
import { Copy } from "lucide-react"
import { toast } from "sonner"

export default function PartnerTeamPage() {
  const [copied, setCopied] = useState(false)
  const totalTeamCommissions = mockTeamMembers.reduce((sum, m) => sum + m.monthlyCommissions, 0)

  const handleCopy = () => {
    navigator.clipboard.writeText("https://beispiel.de/partner/recruit/12345")
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

  return (
    <div className="space-y-4 page-transition">
        <div>
          <h1 className="text-white text-2xl font-bold">Mein Team</h1>
          <p className="text-[#9CA3AF] mt-0.5 text-xs">Übersicht über Ihr Team und Team-Provisionen</p>
        </div>

        {/* Team KPIs */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
            <p className="text-[#9CA3AF] text-sm mb-2">Team-Provisionen (diesen Monat)</p>
            <p className="text-[#D4AF37] text-3xl md:text-4xl font-bold">
              <AnimatedNumber
                value={totalTeamCommissions}
                duration={1.2}
                prefix="€ "
                decimals={0}
              />
            </p>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
            <p className="text-[#9CA3AF] text-sm mb-2">Team-Mitglieder</p>
            <p className="text-[#D4AF37] text-3xl md:text-4xl font-bold">
              <AnimatedNumber
                value={mockTeamMembers.length}
                duration={1.2}
                decimals={0}
              />
            </p>
          </div>
        </div>

      {/* Team Members */}
      <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Team-Mitglieder</h2>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                  Beigetreten
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                  Monats-Provisionen
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                  Lifetime-Provisionen
                </th>
              </tr>
            </thead>
            <tbody>
              {mockTeamMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-white/5 hover:bg-[#2A2A2A]/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="text-white text-sm">{member.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[#9CA3AF] text-sm">
                      {new Date(member.joinedAt).toLocaleDateString("de-DE")}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[#D4AF37] text-sm font-semibold">
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
          {mockTeamMembers.map((member) => (
            <div key={member.id} className="bg-[#000000] rounded-xl p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-white font-semibold text-sm truncate">{member.name}</p>
                <p className="text-[#9CA3AF] text-[10px] flex-shrink-0">
                  {new Date(member.joinedAt).toLocaleDateString("de-DE", { month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[#9CA3AF] mb-0.5 text-[10px]">Monat</p>
                  <p className="text-[#D4AF37] text-sm font-semibold">
                    {member.monthlyCommissions.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[#9CA3AF] mb-0.5 text-[10px]">Lifetime</p>
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
      </div>

      {/* Recruit Link - Kompakt wie Dashboard */}
      <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Partner werben</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value="https://beispiel.de/partner/recruit/12345"
            readOnly
            className="flex-1 bg-[#000000] border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-sm text-white"
          />
          <AnimatedButton
            onClick={handleCopy}
            className="bg-[#D4AF37] text-[#000000] rounded-lg py-3 px-5 font-semibold text-sm flex items-center gap-2 hover:bg-[#C19B2E] transition-colors whitespace-nowrap"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? "Kopiert" : "Kopieren"}</span>
          </AnimatedButton>
        </div>
      </div>
    </div>
  )
}
