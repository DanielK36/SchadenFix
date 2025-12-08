"use client"

import { useState } from "react"
import { mockCommissions, mockPayouts, mockDashboardKPIs } from "@/lib/mock/partnerData"
import { AnimatedNumber } from "@/components/partner/AnimatedNumber"
import { AnimatedButton } from "@/components/partner/AnimatedButton"
import { EmptyState } from "@/components/partner/EmptyState"
import { Download, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

export default function PartnerCommissionsPage() {
  const [activeTab, setActiveTab] = useState<"commissions" | "payouts">("commissions")
  const pendingCommissions = mockCommissions.filter((c) => c.status === "PENDING")
  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-4 page-transition">
        <div>
          <h1 className="text-white text-2xl font-bold">Provisionen</h1>
          <p className="text-[#9CA3AF] mt-0.5 text-xs">Übersicht über alle Provisionen und Auszahlungen</p>
        </div>

        {/* Pending Amount */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6">
          <p className="text-[#9CA3AF] text-sm mb-2">Aktuell offener Betrag</p>
          <p className="text-[#D4AF37] text-5xl font-bold">
            <AnimatedNumber
              value={totalPending}
              duration={1.2}
              prefix="€ "
              decimals={0}
            />
          </p>
        <p className="text-[#9CA3AF] mt-2 text-sm">
          Nächste Auszahlung in: <span className="text-[#D4AF37]">{mockDashboardKPIs.nextPayoutInDays} Tagen</span>
        </p>
      </div>

      {/* Segmented Control - iOS Style */}
      <div className="bg-neutral-900 rounded-xl p-1 flex gap-1 relative">
        <motion.div
          className="absolute bg-[#D4AF37] rounded-xl h-[calc(100%-8px)]"
          initial={false}
          animate={{
            left: activeTab === "commissions" ? "4px" : "calc(50% + 4px)",
            width: "calc(50% - 4px)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <AnimatedButton
          onClick={() => setActiveTab("commissions")}
          className={`relative z-10 flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === "commissions"
              ? "text-[#000000]"
              : "text-[#9CA3AF] hover:text-white"
          }`}
        >
          Provisionen
        </AnimatedButton>
        <AnimatedButton
          onClick={() => setActiveTab("payouts")}
          className={`relative z-10 flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === "payouts"
              ? "text-[#000000]"
              : "text-[#9CA3AF] hover:text-white"
          }`}
        >
          Auszahlungen
        </AnimatedButton>
      </div>

      {/* Tab Content: Provisionen */}
      {activeTab === "commissions" && (
        <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
          <h2 className="text-white text-lg font-semibold mb-4">Erhaltene Provisionen</h2>
          {mockCommissions.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Noch keine Einträge"
              subtitle="Teile deinen Partner-Link, um erste Provisionen zu verdienen."
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                    Datum
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                    Kunde
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                    Betrag
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockCommissions.map((commission) => (
                  <tr
                    key={commission.id}
                    className="border-b border-white/5 hover:bg-[#2A2A2A]/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-[#9CA3AF] text-sm">
                        {new Date(commission.createdAt).toLocaleDateString("de-DE")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white text-sm">{commission.customerName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#D4AF37] text-sm font-semibold">
                        {commission.amount.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          commission.status === "PAID"
                            ? "bg-[#22C55E]/15 text-[#4ADE80]"
                            : "bg-[#EF4444]/15 text-[#F87171]"
                        }`}
                      >
                        {commission.status === "PAID" ? "Bezahlt" : "Ausstehend"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {mockCommissions.map((commission) => (
              <div key={commission.id} className="bg-[#000000] rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-sm truncate">
                        {commission.customerName}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                          commission.status === "PAID"
                            ? "bg-[#22C55E]/15 text-[#4ADE80]"
                            : "bg-[#EF4444]/15 text-[#F87171]"
                        }`}
                      >
                        {commission.status === "PAID" ? "Bezahlt" : "Ausstehend"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#9CA3AF]">
                        {new Date(commission.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
                      </span>
                      <span className="text-[#9CA3AF]">·</span>
                      <span className="text-[#D4AF37] font-semibold">
                        {commission.amount.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
            </>
          )}
        </div>
      )}

      {/* Tab Content: Auszahlungen */}
      {activeTab === "payouts" && (
        <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
          <h2 className="text-white text-lg font-semibold mb-4">Erfolgte Auszahlungen</h2>
          {mockPayouts.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Noch keine Einträge"
              subtitle="Sobald Provisionen ausgezahlt werden, erscheinen sie hier."
              showCopyButton={false}
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                    Periode
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                    Auszahlungsdatum
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                    Betrag
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase">
                    Aktion
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockPayouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-white/5 hover:bg-[#2A2A2A]/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-white text-sm">{payout.period}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#9CA3AF] text-sm">
                        {new Date(payout.paidAt).toLocaleDateString("de-DE")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#D4AF37] text-sm font-semibold">
                        {payout.amount.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <AnimatedButton className="text-[#9CA3AF] hover:text-[#D4AF37] transition-colors">
                        <Download className="w-4 h-4" />
                      </AnimatedButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {mockPayouts.map((payout) => (
              <div key={payout.id} className="bg-[#000000] rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm mb-0.5">{payout.period}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#9CA3AF]">
                        {new Date(payout.paidAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-[#9CA3AF]">·</span>
                      <span className="text-[#D4AF37] font-semibold">
                        {payout.amount.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  </div>
                  <AnimatedButton className="text-[#9CA3AF] hover:text-[#D4AF37] transition-colors flex-shrink-0">
                    <Download className="w-4 h-4" />
                  </AnimatedButton>
                </div>
              </div>
            ))}
          </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
