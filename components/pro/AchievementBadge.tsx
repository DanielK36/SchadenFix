"use client"

import { LucideIcon } from "lucide-react"

interface AchievementBadgeProps {
  icon: LucideIcon
  title: string
  description: string
  earned: boolean
  color: string
}

export function AchievementBadge({ icon: Icon, title, description, earned, color }: AchievementBadgeProps) {
  const bgColor = earned ? color : "#E5E7EB"
  const borderColor = earned ? color : "#E5E7EB"
  const bgOpacity = earned ? "0.1" : "1"
  
  return (
    <div
      className="p-4 rounded-lg border-2 transition-all shadow-md"
      style={{
        borderColor: borderColor,
        backgroundColor: earned ? `${color}15` : "#F3F4F6",
        boxShadow: earned ? `0 4px 12px ${color}40` : "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div className="flex items-start space-x-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg transition-all"
          style={{
            backgroundColor: bgColor,
            boxShadow: earned ? `0 4px 8px ${color}60` : "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <Icon className={`w-6 h-6 ${earned ? "text-white" : "text-[#6B7280]"}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-base ${earned ? "text-[#1A1A1A]" : "text-[#6B7280]"}`}>
            {title}
          </h3>
          <p className="text-sm text-[#6B7280] mt-1 font-normal">{description}</p>
        </div>
        {earned && (
          <span className="text-xs font-medium text-[#22C55E] bg-[#D1FAE5] px-2 py-1 rounded-full flex-shrink-0">
            ✓ Erreicht
          </span>
        )}
      </div>
    </div>
  )
}

