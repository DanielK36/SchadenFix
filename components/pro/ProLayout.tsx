"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  User,
  Users,
  Network,
  AlertTriangle,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PageTransition } from "./PageTransition"
import { useDemoMode } from "@/lib/hooks/useDemoMode"

const navigation = [
  { name: "Dashboard", href: "/pro/dashboard", icon: LayoutDashboard },
  { name: "Aufträge", href: "/pro/orders", icon: Package },
  { name: "Rechnungscenter", href: "/pro/billing", icon: Receipt },
  { name: "Team", href: "/pro/team", icon: Users },
  { name: "Einsatz & Netzwerk", href: "/pro/operations", icon: Network },
  { name: "Einstellungen", href: "/pro/settings", icon: Settings },
]

const mobileNavigation = [
  { name: "Dashboard", href: "/pro/dashboard", icon: LayoutDashboard },
  { name: "Aufträge", href: "/pro/orders", icon: Package },
  { name: "Team", href: "/pro/team", icon: Users },
  { name: "Profil", href: "/pro/settings", icon: User },
]

interface ProLayoutProps {
  children: ReactNode
}

export default function ProLayout({ children }: ProLayoutProps) {
  const pathname = usePathname()
  const { isDemoMode } = useDemoMode()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const { signOutPro } = await import("@/lib/auth")
      await signOutPro()
      window.location.href = "/pro/login"
    } catch {
      window.location.href = "/pro/login"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Layout: Sidebar fix links, Inhalt startet darunter rechts */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar - fix oben angepinnt, bleibt links */}
        <aside className="pro-sidebar flex flex-col">
          <Link href="/pro/dashboard" className="flex items-center space-x-3 mb-10 group flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-[#B8903A] to-[#A67C2A] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <div>
              <span className="text-slate-900 font-bold text-xl tracking-tight block">ProCockpit</span>
              <span className="text-xs text-slate-500 font-medium">Premium</span>
            </div>
          </Link>

          <nav className="space-y-1 flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "pro-sidebar-item",
                    isActive
                      ? "bg-[#B8903A]/10 text-[#B8903A]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-[#B8903A]" : "text-slate-500")} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Abmelden unten in der Sidebar */}
          <div className="pt-4 mt-auto border-t border-slate-200/60">
            <button
              onClick={handleLogout}
              className="pro-sidebar-item w-full text-left text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Abmelden</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area – startet direkt unter „oben“, kein zweiter Header */}
        <div className="flex-1 flex flex-col min-w-0 ml-[280px] lg:ml-[320px]">
          {/* Page Content – unter der (nur) Sidebar */}
          <main className="flex-1 px-6 md:px-10 lg:px-16 xl:px-24 py-8 md:py-10 lg:py-12 pb-24 overflow-auto">
            <div className="max-w-[1800px] mx-auto">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>

          {/* Footer – fix unten, nur im Hauptbereich */}
          <footer className="fixed bottom-0 left-[280px] lg:left-[320px] right-0 bg-white/80 backdrop-blur-md border-t border-slate-200/50 py-4 z-30" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-slate-700 text-sm font-medium">© 2024 ProCockpit</span>
                <span className="text-slate-400">·</span>
                <Link href="/impressum" className="text-slate-700 hover:text-[#B8903A] text-sm font-medium transition-colors">
                  Impressum
                </Link>
                <span className="text-slate-400">·</span>
                <Link href="/datenschutz" className="text-slate-700 hover:text-[#B8903A] text-sm font-medium transition-colors">
                  Datenschutz
                </Link>
                <span className="text-slate-400">·</span>
                <Link href="/agb" className="text-slate-700 hover:text-[#B8903A] text-sm font-medium transition-colors">
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
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                {pathname === "/pro/dashboard" 
                  ? "ProCockpit"
                  : navigation.find((item) => pathname === item.href || pathname?.startsWith(item.href + "/"))?.name || "ProCockpit"}
              </h1>
              {isDemoMode && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-full">
                  <AlertTriangle className="w-3 h-3 text-amber-700" />
                  <span className="text-xs font-semibold text-amber-800">DEMO</span>
                </div>
              )}
            </div>
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
                    isActive ? "text-[#B8903A]" : "text-slate-400"
                  )}
                >
                  <item.icon className={cn("w-6 h-6 mb-1", isActive && "text-[#B8903A]")} />
                  <span className={cn("text-xs font-medium", isActive && "text-[#B8903A]")}>
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
