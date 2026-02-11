"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Package,
  Users,
  Network,
  DollarSign,
  MapPin,
} from "lucide-react"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { getCurrentProUser } from "@/lib/auth"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Live Radar", href: "/admin/radar", icon: MapPin },
  { name: "Aufträge", href: "/admin/orders", icon: Package },
  { name: "Partner & Clearing", href: "/admin/partners", icon: Users },
  { name: "Routing Regeln", href: "/admin/routing", icon: Network },
  { name: "Finanzen", href: "/admin/finances", icon: DollarSign },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isDemoMode } = useDemoMode()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      if (isDemoMode) {
        setIsChecking(false)
        return
      }

      const proUser = await getCurrentProUser()
      if (!proUser || proUser.profile?.role !== "admin") {
        router.push("/pro/login")
        return
      }

      setIsChecking(false)
    }

    checkAdmin()
  }, [isDemoMode, router])

  if (isChecking && !isDemoMode) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Lade...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-blue-400">FixAdmin</h1>
              <p className="text-xs text-slate-400 mt-1">Kommandozentrale</p>
            </div>
            {isDemoMode && (
              <span className="px-2 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-700 border border-amber-300">
                DEMO
              </span>
            )}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            <p>System Status</p>
            <p className="text-green-400 mt-1">● Online</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

