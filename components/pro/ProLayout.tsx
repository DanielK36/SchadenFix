"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Receipt,
  TrendingUp,
  Settings,
  User,
  ChevronDown,
  Users,
  Network,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PageTransition } from "./PageTransition"

const navigation = [
  { name: "Dashboard", href: "/pro/dashboard", icon: LayoutDashboard },
  { name: "Aufträge", href: "/pro/orders", icon: Package },
  { name: "Rechnungscenter", href: "/pro/billing", icon: Receipt },
  { name: "Performance", href: "/pro/performance", icon: TrendingUp },
  { name: "Team", href: "/pro/team", icon: Users },
  { name: "Einsatz & Netzwerk", href: "/pro/operations", icon: Network },
  { name: "Einstellungen", href: "/pro/settings", icon: Settings },
]

const mobileNavigation = [
  { name: "Dashboard", href: "/pro/dashboard", icon: LayoutDashboard },
  { name: "Aufträge", href: "/pro/orders", icon: Package },
  { name: "Performance", href: "/pro/performance", icon: TrendingUp },
  { name: "Team", href: "/pro/team", icon: Users },
  { name: "Profil", href: "/pro/settings", icon: User },
]

interface ProLayoutProps {
  children: ReactNode
}

export default function ProLayout({ children }: ProLayoutProps) {
  const pathname = usePathname()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar - Light Mode */}
        <aside className="pro-sidebar bg-white border-r border-slate-200">
          <Link href="/pro/dashboard" className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">SP</span>
            </div>
            <span className="text-slate-900 font-semibold text-lg">ProCockpit</span>
          </Link>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "pro-sidebar-item",
                    isActive
                      ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-[#D4AF37]" : "text-slate-500")} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col ml-[240px]">
          {/* Header - Glassmorphism */}
          <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200/50 h-16 flex items-center justify-between px-6 shadow-sm z-40" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-[#1A1A1A]">ProCockpit</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-[#1A1A1A] hover:bg-[#F7F7F7] hover:text-[#FFD700] transition-colors border border-transparent hover:border-[#EAEAEA]"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Benutzer</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] border-2 border-[#1A1A1A] rounded-lg shadow-xl py-2 z-50">
                  <Link
                    href="/pro/settings"
                    className="block px-4 py-2 text-sm font-medium text-[#1A1A1A] hover:bg-[#FFD700] hover:text-[#1A1A1A] transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Einstellungen
                  </Link>
                  <button className="block w-full text-left px-4 py-2 text-sm font-medium text-[#1A1A1A] hover:bg-[#EF4444] hover:text-white transition-colors">
                    Abmelden
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-6 py-6 pt-20 pb-20">
            <div className="max-w-7xl mx-auto">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>

          {/* Footer - Glassmorphism */}
          <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200/50 py-4 z-40" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-slate-700 text-sm font-medium">© 2024 ProCockpit</span>
                <span className="text-slate-400">·</span>
                <Link href="/impressum" className="text-slate-700 hover:text-[#D4AF37] text-sm font-medium transition-colors">
                  Impressum
                </Link>
                <span className="text-slate-400">·</span>
                <Link href="/datenschutz" className="text-slate-700 hover:text-[#D4AF37] text-sm font-medium transition-colors">
                  Datenschutz
                </Link>
                <span className="text-slate-400">·</span>
                <Link href="/agb" className="text-slate-700 hover:text-[#D4AF37] text-sm font-medium transition-colors">
                  AGB
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Mobile Header - Glassmorphism */}
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 py-3 z-50 shadow-sm" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-900">
              {pathname === "/pro/dashboard" 
                ? "ProCockpit"
                : navigation.find((item) => pathname === item.href || pathname?.startsWith(item.href + "/"))?.name || "ProCockpit"}
            </h1>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-700" />
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 px-4 pt-20 pb-20 pro-main-content">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Mobile Bottom Navigation - Glassmorphism */}
        <nav className="bg-white/80 backdrop-blur-md border-t border-slate-200/50 fixed bottom-0 left-0 right-0 z-50 shadow-sm" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="flex justify-around items-center py-2">
            {mobileNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-all duration-200",
                    isActive ? "text-[#D4AF37]" : "text-slate-400"
                  )}
                >
                  <item.icon className={cn("w-6 h-6 mb-1", isActive && "text-[#D4AF37]")} />
                  <span className={cn("text-xs font-medium", isActive && "text-[#D4AF37]")}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
