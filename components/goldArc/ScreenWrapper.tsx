"use client"

import { ReactNode } from "react"

interface ScreenWrapperProps {
  children: ReactNode
  className?: string
}

export default function ScreenWrapper({ children, className = "" }: ScreenWrapperProps) {
  return (
    <div className={`min-h-screen bg-[#05090E] text-white ${className}`}>
      {children}
    </div>
  )
}


