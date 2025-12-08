"use client"

import { usePathname } from "next/navigation"
import ProLayout from "@/components/pro/ProLayout"
import "../pro/pro-globals.css"

export default function ProLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Don't wrap login/register pages
  if (pathname === "/pro/login" || pathname === "/pro/register") {
    return <>{children}</>
  }

  return <ProLayout>{children}</ProLayout>
}

