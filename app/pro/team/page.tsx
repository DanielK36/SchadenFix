"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Crown,
  UserPlus,
  Copy,
  Check,
  TrendingUp,
  Wallet,
  Trophy,
  X,
  Mail,
  MessageCircle,
} from "lucide-react"
import { AnimatedNumber } from "@/components/pro/AnimatedNumber"
import { TeamSparkline } from "@/components/pro/TeamSparkline"

// Mock data - in production, this would come from an API
const isBoss = true // Switch between boss and employee view
const currentUser = {
  id: "user-1",
  name: "Max Mustermann",
  role: isBoss ? "boss" : "employee",
}

// Boss View Data
const bossData = {
  passiveIncome: 1250.0,
  sparklineData: [
    { day: "Mo", value: 200 },
    { day: "Di", value: 350 },
    { day: "Mi", value: 280 },
    { day: "Do", value: 420 },
    { day: "Fr", value: 0 },
    { day: "Sa", value: 0 },
    { day: "So", value: 0 },
  ],
  leaderboard: [
    {
      id: "emp-1",
      name: "Anna Schmidt",
      leads: 24,
      revenue: 4800,
      commission: 360,
      rank: 1,
    },
    {
      id: "emp-2",
      name: "Tom Weber",
      leads: 18,
      revenue: 3600,
      commission: 270,
      rank: 2,
    },
    {
      id: "emp-3",
      name: "Lisa Müller",
      leads: 15,
      revenue: 3000,
      commission: 225,
      rank: 3,
    },
    {
      id: "emp-4",
      name: "Jan Becker",
      leads: 12,
      revenue: 2400,
      commission: 180,
      rank: 4,
    },
  ],
}

// Employee View Data
const employeeData = {
  earnedCommission: 360.0,
  currentLeads: 24,
  nextBonus: {
    target: 25,
    current: 24,
    bonusAmount: 500,
  },
  recentWins: [
    {
      id: "win-1",
      customer: "Maler Müller",
      status: "Auftrag angenommen",
      commission: 75.0,
      date: "2024-01-15",
    },
    {
      id: "win-2",
      customer: "Elektro Schmidt",
      status: "Auftrag angenommen",
      commission: 120.0,
      date: "2024-01-14",
    },
    {
      id: "win-3",
      customer: "Sanitär Weber",
      status: "In Bearbeitung",
      commission: 0,
      date: "2024-01-13",
    },
  ],
}

function InviteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const inviteLink = "https://app.schadenportal.de/invite/abc123xyz"

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Mitarbeiter einladen</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Teilen Sie diesen Link mit Ihrem Mitarbeiter:
        </p>

        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-[#D4AF37] text-slate-900 rounded-lg font-semibold hover:bg-[#B8941F] transition-colors flex items-center space-x-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Kopiert!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Kopieren</span>
              </>
            )}
          </button>
        </div>

        <div className="flex space-x-2">
          <a
            href={`mailto:?subject=Einladung zum Schadenportal&body=Hallo,%0D%0A%0D%0AHier ist dein Einladungslink: ${inviteLink}`}
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Per E-Mail</span>
          </a>
          <a
            href={`https://wa.me/?text=Hallo,%20hier%20ist%20dein%20Einladungslink:%20${inviteLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>
      </motion.div>
    </div>
  )
}

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const isBossView = isBoss

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Team</h1>
          <p className="text-slate-500">
            {isBossView
              ? "Übersicht über Ihr Team und passives Einkommen"
              : "Ihre Performance und verdiente Provisionen"}
          </p>
        </div>
        {isBossView && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-6 py-3 bg-[#D4AF37] text-slate-900 rounded-xl font-semibold hover:bg-[#B8941F] transition-colors shadow-md flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Mitarbeiter einladen</span>
          </button>
        )}
      </div>

      {isBossView ? (
        /* BOSS VIEW */
        <div className="space-y-6">
          {/* Hero Card - Passive Income */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Passives Einkommen</p>
                <p className="text-xs text-slate-400">Diesen Monat durch Team verdient</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mb-4">
              <AnimatedNumber
                value={bossData.passiveIncome}
                decimals={2}
                prefix=""
                suffix=" €"
                className="text-4xl font-bold text-green-600"
              />
            </div>
            <TeamSparkline data={bossData.sparklineData} color="#10B981" height={60} />
          </motion.div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Leaderboard</h2>
              <p className="text-sm text-slate-500 mt-1">Sortiert nach generiertem Umsatz</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Rang
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Leads
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Umsatz
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Provision (MA)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bossData.leaderboard.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {member.rank === 1 && <Crown className="w-5 h-5 text-[#D4AF37]" />}
                          <span
                            className={`text-sm font-semibold ${
                              member.rank === 1 ? "text-[#D4AF37]" : "text-slate-600"
                            }`}
                          >
                            #{member.rank}
                          </span>
                          {member.rank === 1 && (
                            <span className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold rounded-full">
                              Top 1
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">{member.name}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-slate-600">{member.leads}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-green-600">
                          {member.revenue.toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-[#D4AF37]">
                          {member.commission.toLocaleString("de-DE", {
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
          </div>
        </div>
      ) : (
        /* EMPLOYEE VIEW */
        <div className="space-y-6">
          {/* Mein Geldbeutel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-xl shadow-lg p-8 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">Mein Geldbeutel</p>
                <p className="text-xs text-white/60">Verdiente Provision (7.5%)</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mb-2">
              <AnimatedNumber
                value={employeeData.earnedCommission}
                decimals={2}
                prefix=""
                suffix=" €"
                className="text-5xl font-bold text-white"
              />
            </div>
            <p className="text-sm text-white/80">
              {employeeData.currentLeads} Leads erfolgreich vermittelt
            </p>
          </motion.div>

          {/* Next Bonus Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Nächster Bonus</h3>
                <p className="text-sm text-slate-500">
                  Noch {employeeData.nextBonus.target - employeeData.nextBonus.current} Lead bis
                  zum {employeeData.nextBonus.bonusAmount} € Bonus
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (employeeData.nextBonus.current / employeeData.nextBonus.target) * 100
                  }%`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] h-3 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{employeeData.nextBonus.current} / {employeeData.nextBonus.target} Leads</span>
              <span className="font-semibold text-[#D4AF37]">
                {employeeData.nextBonus.bonusAmount} €
              </span>
            </div>
          </div>

          {/* Recent Wins */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Recent Wins</h2>
              <p className="text-sm text-slate-500 mt-1">Ihre letzten erfolgreichen Vermittlungen</p>
            </div>
            <div className="divide-y divide-slate-200">
              {employeeData.recentWins.map((win) => (
                <div key={win.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{win.customer}</p>
                      <p className="text-xs text-slate-500 mt-1">{win.status}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(win.date).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                    {win.commission > 0 ? (
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          +{win.commission.toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                        <p className="text-xs text-slate-500">verdient</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm text-slate-400">In Bearbeitung</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </div>
  )
}

