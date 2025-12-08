"use client"

import { mockPerformance } from "@/lib/mock/proData"
import { AnimatedNumber } from "@/components/pro/AnimatedNumber"
import { TrendingUp, Clock, Star, Trophy, Crown } from "lucide-react"
import { motion } from "framer-motion"

// Mock team leaderboard data
const teamLeaderboard = [
  { id: "1", name: "Anna Schmidt", revenue: 4800, avatar: "AS" },
  { id: "2", name: "Tom Weber", revenue: 3600, avatar: "TW" },
  { id: "3", name: "Lisa Müller", revenue: 3000, avatar: "LM" },
]

// Mock earnings data
const currentMonthEarnings = 12500.0
const previousMonthEarnings = 11000.0
const earningsTrend = ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100

export default function ProPerformancePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance</h1>
        <p className="text-slate-500">Ihre Leistungsmetriken im Überblick</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Kachel 1: Mein Verdienst (Groß - 2x2) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 md:row-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col justify-between"
        >
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Mein Verdienst</p>
            <p className="text-xs text-slate-400 mb-6">Dieser Monat</p>
            <div className="mb-6">
              <AnimatedNumber
                value={currentMonthEarnings}
                decimals={0}
                prefix="€ "
                className="text-6xl font-bold text-green-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">
                  +{earningsTrend.toFixed(1)}%
                </span>
              </div>
              <span className="text-sm text-slate-500">vs. Vormonat</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-2">Durchschnitt pro Auftrag</p>
            <p className="text-2xl font-bold text-slate-900">
              € {(currentMonthEarnings / 25).toFixed(0)}
            </p>
          </div>
        </motion.div>

        {/* Kachel 2: Reaktionszeit (Mittel) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Reaktionszeit</p>
            <p className="text-xs text-slate-400 mb-4">Durchschnitt</p>
            <div>
              <p className="text-4xl font-bold text-slate-900 mb-1">
                {Math.floor(mockPerformance.averageResponseTime / 60)}
              </p>
              <p className="text-sm text-slate-500">
                Std. {mockPerformance.averageResponseTime % 60} Min.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">12% schneller</span>
            </div>
          </div>
        </motion.div>

        {/* Kachel 3: Sterne-Bewertung (Mittel) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Bewertung</p>
            <p className="text-xs text-slate-400 mb-4">Durchschnitt</p>
            <div>
              <p className="text-4xl font-bold text-slate-900 mb-2">
                {mockPerformance.averageRating.toFixed(1)}
              </p>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= mockPerformance.averageRating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-1">
              <Trophy className="w-3 h-3 text-[#D4AF37]" />
              <span className="text-xs text-slate-600 font-medium">Top 20%</span>
            </div>
          </div>
        </motion.div>

        {/* Kachel 4: Team-Leaderboard (Breit - 2x1) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Team-Leaderboard</p>
              <p className="text-xs text-slate-400">Top 3 Mitarbeiter</p>
            </div>
            <Trophy className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="space-y-4">
            {teamLeaderboard.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center text-white font-semibold text-sm">
                      {member.avatar}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1">
                        <Crown className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">#{index + 1} Platz</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    € {member.revenue.toLocaleString("de-DE")}
                  </p>
                  <p className="text-xs text-slate-500">Umsatz</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
