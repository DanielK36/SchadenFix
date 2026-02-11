"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProPerformanceRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/pro/dashboard")
  }, [router])
  return null
}
