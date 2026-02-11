"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ProLayout from "@/components/pro/ProLayout"
import { getCurrentProUser } from "@/lib/auth"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import "../pro/pro-globals.css"

export default function ProLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { isDemoMode } = useDemoMode()
  const [isChecking, setIsChecking] = useState(true)
  
  const publicProPaths = ["/pro/login", "/pro/register", "/pro/forgot-password"]
  const isPublicPro = publicProPaths.some((p) => pathname === p || pathname?.startsWith(p + "?"))

  // Check authentication for protected routes
  useEffect(() => {
    if (isPublicPro) {
      setIsChecking(false)
      return
    }

    async function checkAuth() {
      // If demo mode, skip auth check
      if (isDemoMode) {
        setIsChecking(false)
        return
      }

      const proUser = await getCurrentProUser()
      if (!proUser) {
        // Not authenticated - redirect to login
        router.push("/pro/login")
        return
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [pathname, router, isDemoMode, isPublicPro])

  // Don't wrap login/register/forgot-password - return early after all hooks
  if (isPublicPro) {
    return <>{children}</>
  }

  // Show loading while checking auth
  if (isChecking && !isDemoMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B8903A] mx-auto"></div>
          <p className="mt-4 text-slate-600">Lade...</p>
        </div>
      </div>
    )
  }

  return <ProLayout>{children}</ProLayout>
}

