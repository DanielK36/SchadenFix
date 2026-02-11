"use client"

import { ReactNode, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth"
import { User as SupabaseUser } from "@supabase/supabase-js"

const navigation = [
  { name: "Startseite", href: "/", icon: Home },
  { name: "Meine Meldungen", href: "/meine-meldungen", icon: FileText },
  { name: "Profil", href: "/profil", icon: User },
]

interface CustomerLayoutProps {
  children: ReactNode
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  // Don't show layout if user is not authenticated
  if (loading) {
    return <div className="min-h-screen bg-[#deded7]">{children}</div>
  }

  if (!user) {
    // No layout for anonymous users - just render children
    return <>{children}</>
  }

  // Show layout with dock for authenticated users
  return (
    <div className="min-h-screen bg-[#deded7]">
      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen flex-col">
        {/* Header with Navigation - Premium */}
        <header className="bg-white/95 backdrop-blur-2xl border-b border-stone-200/80 sticky top-0 z-40 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.06)]" style={{ WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
          <div className="w-full mx-auto px-6 md:px-12 lg:px-16 xl:px-24 py-5">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-stone-900 to-stone-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-stone-900 font-bold text-xl tracking-tight">Schadenportal</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="flex items-center gap-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                        isActive 
                          ? "bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-lg shadow-stone-900/20" 
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900 border border-transparent hover:border-stone-200"
                      )}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full mx-auto px-6 md:px-12 lg:px-16 xl:px-24 py-8 md:py-12">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* Mobile Bottom Navigation - Premium Dock */}
        <nav className="bg-white/95 backdrop-blur-2xl border-t border-stone-200/80 fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.06)]" style={{ WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
          <div className="flex justify-around items-center py-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-4 min-w-[70px] transition-all duration-200 rounded-xl",
                    isActive 
                      ? "text-stone-900 bg-stone-50" 
                      : "text-stone-400 hover:text-stone-600"
                  )}
                >
                  <item.icon className={cn("w-6 h-6 mb-1", isActive && "text-stone-900")} />
                  <span className={cn("text-xs font-semibold", isActive && "text-stone-900")}>
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
