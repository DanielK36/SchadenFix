"use client"

import { ReactNode } from "react"

interface GoldArcLayoutProps {
  children: ReactNode
  className?: string
}

export default function GoldArcLayout({ children, className = "" }: GoldArcLayoutProps) {
  return (
    <main className={`min-h-screen bg-[#05090E] text-white`}>
      <div className={`max-w-[430px] mx-auto px-5 pt-6 pb-10 flex flex-col gap-6 ${className}`}>
        {children}
      </div>
    </main>
  )
}

