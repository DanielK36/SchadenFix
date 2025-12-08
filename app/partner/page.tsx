"use client"

import { useState, useEffect } from "react"
import { mockDashboardKPIs, mockChartData, mockActivities } from "@/lib/mock/partnerData"
import { RevenueChart } from "@/components/partner/RevenueChart"
import { AnimatedNumber } from "@/components/partner/AnimatedNumber"
import { AnimatedButton } from "@/components/partner/AnimatedButton"
import { DashboardSkeleton } from "@/components/partner/DashboardSkeleton"
import { Copy, Euro, User, Settings, TrendingUp, Users, Calendar } from "lucide-react"
import { toast } from "sonner"

export default function PartnerDashboardPage() {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const affiliateLink = "https://www.beispiel.de/affiliate"

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink)
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return "Vor wenigen Minuten"
    if (diffHours < 24) return `Vor ${diffHours} ${diffHours === 1 ? "Stunde" : "Stunden"}`
    return `Vor ${diffDays} ${diffDays === 1 ? "Tag" : "Tagen"}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] page-transition">
        {/* Desktop Dashboard Skeleton */}
        <div className="hidden lg:block">
          <DashboardSkeleton />
        </div>
        {/* Mobile Dashboard Skeleton */}
        <div className="lg:hidden px-4 py-4 space-y-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-6">
            <div className="h-3 w-24 bg-neutral-800/50 rounded animate-pulse mb-2"></div>
            <div className="h-10 w-32 bg-neutral-800/50 rounded animate-pulse mb-3"></div>
            <div className="h-12 w-full bg-neutral-800/50 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-xl p-4">
                <div className="h-3 w-20 bg-neutral-800/50 rounded animate-pulse mb-1.5"></div>
                <div className="h-6 w-16 bg-neutral-800/50 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] page-transition">
        {/* Desktop Dashboard */}
        <div className="hidden lg:block">
          <div className="space-y-6 pb-24">
            {/* Row 1: Hero + Link kopieren */}
            <div className="grid grid-cols-3 gap-6">
              {/* Hero Section - Monatseinnahmen (2/3) */}
              <div className="col-span-2 bg-[#1A1A1A] rounded-2xl p-8 flex flex-col min-h-[200px] h-full">
                <div className="mb-4">
                  <p className="text-[#9CA3AF] text-sm mb-2">Monatseinnahmen</p>
                  <p className="text-[#D4AF37] text-6xl font-bold leading-none">
                    <AnimatedNumber
                      value={mockDashboardKPIs.monthlyCommissions}
                      duration={1.2}
                      prefix="€ "
                      decimals={0}
                    />
                  </p>
                </div>
                <div className="mt-auto w-full pt-6">
                  <RevenueChart data={mockChartData} height={80} />
                </div>
              </div>

              {/* Primary Action - Link kopieren (1/3) */}
              <div className="col-span-1 bg-[#1A1A1A] rounded-2xl p-8 flex flex-col min-h-[200px] h-full">
                <p className="text-[#9CA3AF] text-sm mb-2 font-medium">Dein Partner-Link</p>
                <div className="mt-6 flex flex-col gap-3">
                  <input
                    type="text"
                    value={affiliateLink}
                    readOnly
                    className="w-full h-12 bg-[#000000] border border-[#D4AF37]/20 rounded-lg px-4 text-sm text-white text-ellipsis overflow-hidden"
                  />
                  <AnimatedButton
                    onClick={handleCopyLink}
                    className="w-full h-12 bg-[#D4AF37] text-[#000000] rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#C19B2E] transition-colors whitespace-nowrap"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? "Kopiert" : "Kopieren"}</span>
                  </AnimatedButton>
                </div>
              </div>
            </div>

            {/* Row 2: Stats (3 Spalten) */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#1A1A1A] rounded-2xl p-6">
                <p className="text-[#9CA3AF] text-sm mb-2">Lifetime-Provisionen</p>
                <p className="text-[#D4AF37] text-3xl font-bold">
                  <AnimatedNumber
                    value={mockDashboardKPIs.lifetimeCommissions}
                    duration={1.2}
                    prefix="€ "
                    decimals={0}
                  />
                </p>
              </div>
              <div className="bg-[#1A1A1A] rounded-2xl p-6">
                <p className="text-[#9CA3AF] text-sm mb-2">Offene Auszahlungen</p>
                <p className="text-[#D4AF37] text-3xl font-bold">
                  <AnimatedNumber
                    value={mockDashboardKPIs.pendingAmount}
                    duration={1.2}
                    prefix="€ "
                    decimals={0}
                  />
                </p>
              </div>
              <div className="bg-[#1A1A1A] rounded-2xl p-6">
                <p className="text-[#9CA3AF] text-sm mb-2">Vermittelte Kunden</p>
                <p className="text-[#D4AF37] text-3xl font-bold">
                  <AnimatedNumber
                    value={mockDashboardKPIs.referredCustomers}
                    duration={1.2}
                    decimals={0}
                  />
                </p>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6">
              <h3 className="text-white text-lg font-semibold mb-4">Aktivitäten</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {mockActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                      {activity.type === "COMMISSION" ? (
                        <Euro className="w-4 h-4 text-[#D4AF37]" />
                      ) : (
                        <User className="w-4 h-4 text-[#D4AF37]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{activity.title}</p>
                      <p className="text-[#9CA3AF] text-xs mt-0.5">{formatTimeAgo(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Mobile Dashboard */}
      <div className="md:hidden px-4 py-4 space-y-4">
        {/* Hero Section - Monatseinnahmen */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6">
            <p className="text-[#9CA3AF] text-xs mb-2">Monatseinnahmen</p>
            <div className="mb-3">
              <p className="text-[#D4AF37] text-4xl font-bold leading-none">
                <AnimatedNumber
                  value={mockDashboardKPIs.monthlyCommissions}
                  duration={1.2}
                  prefix="€ "
                  decimals={0}
                />
              </p>
            </div>
            <div className="h-12">
              <RevenueChart data={mockChartData} height={48} />
            </div>
          </div>

        {/* Primary Action - Link kopieren */}
        <div className="bg-[#1A1A1A] rounded-xl p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={affiliateLink}
              readOnly
              className="flex-1 bg-[#000000] border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-xs text-white"
            />
            <AnimatedButton
              onClick={handleCopyLink}
              className="bg-[#D4AF37] text-[#000000] rounded-lg py-2 px-4 font-semibold text-xs flex items-center gap-1.5 hover:bg-[#C19B2E] transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "✓" : "Kopieren"}</span>
            </AnimatedButton>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <p className="text-[#9CA3AF] text-[10px] mb-1.5">Lifetime-Provisionen</p>
              <p className="text-[#D4AF37] text-xl font-bold">
                <AnimatedNumber
                  value={mockDashboardKPIs.lifetimeCommissions}
                  duration={1.2}
                  prefix="€ "
                  decimals={0}
                />
              </p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <p className="text-[#9CA3AF] text-[10px] mb-1.5">Offene Auszahlungen</p>
              <p className="text-[#D4AF37] text-xl font-bold">
                <AnimatedNumber
                  value={mockDashboardKPIs.pendingAmount}
                  duration={1.2}
                  prefix="€ "
                  decimals={0}
                />
              </p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <p className="text-[#9CA3AF] text-[10px] mb-1.5">Vermittelte Kunden</p>
              <p className="text-[#D4AF37] text-xl font-bold">
                <AnimatedNumber
                  value={mockDashboardKPIs.referredCustomers}
                  duration={1.2}
                  decimals={0}
                />
              </p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <p className="text-[#9CA3AF] text-[10px] mb-1.5">Nächste Auszahlung</p>
              <p className="text-[#D4AF37] text-lg font-bold">
                in {mockDashboardKPIs.nextPayoutInDays} Tagen
              </p>
            </div>
          </div>

        {/* Activity Feed */}
        <div className="bg-[#1A1A1A] rounded-xl p-4">
            <h3 className="text-white text-sm font-semibold mb-3">Aktivitäten</h3>
            <div className="space-y-2.5">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2.5 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                    {activity.type === "COMMISSION" ? (
                      <Euro className="w-3 h-3 text-[#D4AF37]" />
                    ) : (
                      <User className="w-3 h-3 text-[#D4AF37]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{activity.title}</p>
                    <p className="text-[#9CA3AF] text-[10px] mt-0.5">{formatTimeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  )
}
