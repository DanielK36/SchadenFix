"use client"

import { LucideIcon } from "lucide-react"
import { AnimatedButton } from "./AnimatedButton"
import { Copy } from "lucide-react"
import { toast } from "sonner"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  subtitle: string
  showCopyButton?: boolean
  affiliateLink?: string
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  showCopyButton = true,
  affiliateLink = "https://www.beispiel.de/affiliate",
}: EmptyStateProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink)
    
    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    // Toast
    toast.success("Link kopiert! ✅", {
      duration: 2000,
    })
  }

  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <Icon className="w-8 h-8 text-[#6B7280]" />
          </div>
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
        <p className="text-[#6B7280] text-sm mb-6">{subtitle}</p>
        {showCopyButton && (
          <AnimatedButton
            onClick={handleCopyLink}
            className="bg-[#B8903A] text-[#000000] rounded-lg py-3 px-6 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#A67C2A] transition-colors mx-auto"
          >
            <Copy className="w-4 h-4" />
            <span>Link kopieren</span>
          </AnimatedButton>
        )}
      </div>
    </div>
  )
}

