"use client"

import { Info } from "lucide-react"

interface ProseHintProps {
  children: React.ReactNode
  variant?: "info" | "warning" | "success"
}

export function ProseHint({ children, variant = "info" }: ProseHintProps) {
  const variants = {
    info: "bg-amber-50 text-amber-900 border-amber-200",
    warning: "bg-red-50 text-red-700 border-red-200",
    success: "bg-green-50 text-green-700 border-green-200",
  }

  return (
    <div className={`mx-auto mt-6 max-w-xl rounded-2xl border p-4 text-center text-sm ${variants[variant]}`}>
      <div className="mx-auto mb-1 flex h-5 w-5 items-center justify-center">
        <Info className="h-5 w-5" />
      </div>
      {children}
    </div>
  )
}

