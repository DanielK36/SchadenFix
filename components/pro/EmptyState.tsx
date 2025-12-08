"use client"

import { ElementType } from "react"
import { Package } from "lucide-react"

interface EmptyStateProps {
  icon?: ElementType
  title: string
  subtitle: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon = Package,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-slate-900 text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-4 max-w-xs">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-[#D4AF37] text-slate-900 rounded-lg py-2.5 px-5 font-semibold text-sm hover:bg-[#C19B2E] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

