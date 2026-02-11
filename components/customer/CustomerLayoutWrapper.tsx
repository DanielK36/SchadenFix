"use client"

import { ReactNode, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import CustomerLayout from "./CustomerLayout"
import { getCurrentUser, getCurrentProUser } from "@/lib/auth"
import { User as SupabaseUser } from "@supabase/supabase-js"

interface CustomerLayoutWrapperProps {
  children: ReactNode
}

export default function CustomerLayoutWrapper({ children }: CustomerLayoutWrapperProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isProUser, setIsProUser] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and if they are a Pro/Partner/Admin user
    async function checkUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser) {
        // Check if user is Pro/Partner/Admin (has role in profiles)
        const proUser = await getCurrentProUser()
        setIsProUser(proUser !== null)
      } else {
        setIsProUser(false)
      }
      
      setLoading(false)
    }
    
    checkUser()
  }, [])

  // Don't wrap certain routes (like the home page which has its own layout)
  // Also exclude Pro/Partner/Admin routes - they have their own layouts
  const excludeRoutes = ["/", "/melden", "/pro", "/partner", "/admin"]
  const shouldExclude = excludeRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

  if (loading) {
    return <>{children}</>
  }

  // Don't show CustomerLayout for Pro/Partner/Admin users - they have their own layouts
  if (isProUser) {
    return <>{children}</>
  }

  // If user is authenticated (and is a customer, not Pro/Partner/Admin) and not on excluded routes, use CustomerLayout
  if (user && !shouldExclude) {
    return <CustomerLayout>{children}</CustomerLayout>
  }

  // Otherwise, render children without layout
  return <>{children}</>
}
