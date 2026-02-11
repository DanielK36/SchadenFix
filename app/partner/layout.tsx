"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import PartnerLayout from "@/components/partner/PartnerLayout"
import { Toaster } from "sonner"
import { getCurrentProUser } from "@/lib/auth"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import "./partner-globals.css"

export default function PartnerRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { isDemoMode } = useDemoMode()
  const [isChecking, setIsChecking] = useState(true)

  const publicPartnerPaths = [
    "/partner/login",
    "/partner/register",
    "/partner/login/forgot",
    "/partner/login/reset",
  ]
  const isPublicPartner = publicPartnerPaths.some((p) => pathname === p || pathname?.startsWith(p + "?"))

  // Check authentication for protected routes
  useEffect(() => {
    if (isPublicPartner) {
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
      const roles = Array.isArray(proUser?.profile?.roles) ? proUser?.profile?.roles : []
      const hasPartnerAccess =
        proUser?.profile?.role === "partner" || roles.includes("partner")

      if (!proUser || !hasPartnerAccess) {
        // Not authenticated or not a partner - redirect to login
        router.push("/partner/login")
        return
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [pathname, router, isDemoMode, isPublicPartner])

  // Don't wrap login/register/forgot/reset - return early after all hooks
  if (isPublicPartner) {
    return (
      <>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(26, 26, 26, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              color: "#EAEAEA",
            },
            className: "partner-toast",
          }}
        />
      </>
    )
  }

  // Show loading while checking auth
  if (isChecking && !isDemoMode) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B8903A] mx-auto"></div>
          <p className="mt-4 text-[#EAEAEA]">Lade...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PartnerLayout>{children}</PartnerLayout>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            color: "#EAEAEA",
          },
          className: "partner-toast",
        }}
      />
    </>
  )
}

