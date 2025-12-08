"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Link2,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/partner", icon: LayoutDashboard },
  { name: "Leads", href: "/partner/leads", icon: Users },
  { name: "Provisionen", href: "/partner/commissions", icon: TrendingUp },
  { name: "Werbemittel", href: "/partner/materials", icon: Link2 },
  { name: "Mein Team", href: "/partner/team", icon: UserCog },
  { name: "Einstellungen", href: "/partner/settings", icon: Settings },
]

const mobileNavigation = [
  { name: "Dashboard", href: "/partner", icon: LayoutDashboard },
  { name: "Leads", href: "/partner/leads", icon: Users },
  { name: "Provisionen", href: "/partner/commissions", icon: TrendingUp },
  { name: "Werbemittel", href: "/partner/materials", icon: Link2 },
  { name: "Team", href: "/partner/team", icon: UserCog },
]

interface PartnerLayoutProps {
  children: ReactNode
}

export default function PartnerLayout({ children }: PartnerLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    console.log("User logged out")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <aside className="partner-sidebar">
          <Link href="/partner" className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
              <span className="text-[#000000] font-bold text-sm">PE</span>
            </div>
            <span className="text-white font-semibold text-lg">PartnerEngine</span>
          </Link>

          <nav className="space-y-1 flex flex-col flex-1">
            <div className="space-y-1">
              {navigation.map((item) => {
                // Special handling for dashboard: exact match or root
                const isActive = 
                  item.href === "/partner" 
                    ? pathname === "/partner" || pathname === "/partner/"
                    : pathname === item.href || pathname?.startsWith(item.href + "/")
                return (
                  <motion.div key={item.name} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={item.href}
                      className={cn("partner-sidebar-item", isActive && "active")}
                    >
                      <item.icon className={cn("w-5 h-5", isActive && "text-[#D4AF37]")} />
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
            {/* Logout Button */}
            <div className="mt-auto pt-4 border-t border-white/5">
              <motion.div whileTap={{ scale: 0.95 }}>
                <button
                  onClick={handleLogout}
                  className="partner-sidebar-item w-full text-[#9CA3AF] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Abmelden</span>
                </button>
              </motion.div>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#000000]">
          {/* Page Content */}
          <main className="flex-1">
            <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>

          {/* Footer - Glassmorphism */}
          <footer className="sticky bottom-0 bg-[#121212]/90 backdrop-blur-md border-t border-white/20 py-4 z-40" style={{ WebkitBackdropFilter: 'blur(20px)' }}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-white text-sm font-medium">© 2024 PartnerEngine</span>
                <span className="text-[#9CA3AF]">·</span>
                <Link href="/impressum" className="text-white hover:text-[#D4AF37] text-sm font-medium transition-colors">
                  Impressum
                </Link>
                <span className="text-[#9CA3AF]">·</span>
                <Link href="/datenschutz" className="text-white hover:text-[#D4AF37] text-sm font-medium transition-colors">
                  Datenschutz
                </Link>
                <span className="text-[#9CA3AF]">·</span>
                <Link href="/agb" className="text-white hover:text-[#D4AF37] text-sm font-medium transition-colors">
                  AGB
                </Link>
                <span className="text-[#9CA3AF]">·</span>
                <Link href="/partner/team" className="text-white hover:text-[#D4AF37] text-sm font-medium transition-colors">
                  Team
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#000000]">
        {/* Mobile Header - Glassmorphism */}
        <header className="fixed top-0 left-0 right-0 bg-[#121212]/90 backdrop-blur-md border-b border-white/20 px-4 py-3 z-50" style={{ WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                <span className="text-[#000000] font-bold text-xs">PE</span>
              </div>
              <h1 className="text-base font-semibold text-white">PartnerEngine</h1>
            </div>
            <Link
              href="/partner/settings"
              className={cn(
                "w-7 h-7 rounded-full bg-[#1A1A1A]/50 backdrop-blur-sm flex items-center justify-center transition-colors",
                pathname === "/partner/settings" || pathname?.startsWith("/partner/settings/")
                  ? "bg-[#D4AF37]/20 border border-[#D4AF37]/30"
                  : "hover:bg-[#2A2A2A]/50"
              )}
            >
              <Settings
                className={cn(
                  "w-3.5 h-3.5",
                  pathname === "/partner/settings" || pathname?.startsWith("/partner/settings/")
                    ? "text-[#D4AF37]"
                    : "text-white"
                )}
              />
            </Link>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 px-4 pt-16 pb-20 partner-main-content">
          {children}
        </main>

        {/* Mobile Bottom Navigation - Glassmorphism */}
        <nav className="partner-bottom-nav">
          <div className="flex justify-around items-center py-2 overflow-x-auto">
            {mobileNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <motion.div key={item.name} whileTap={{ scale: 0.9 }}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 px-2 min-w-[50px] transition-all duration-200 flex-shrink-0",
                      isActive ? "text-[#D4AF37]" : "text-[#9CA3AF]"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 mb-0.5", isActive && "text-[#D4AF37]")} />
                    <span className={cn("text-[10px] font-medium", isActive && "text-[#D4AF37]")}>
                      {item.name}
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}


