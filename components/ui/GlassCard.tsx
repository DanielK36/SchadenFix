"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  layoutId?: string
  hover?: boolean
}

const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
}

export default function GlassCard({ 
  children, 
  className = "", 
  onClick,
  layoutId,
  hover = true 
}: GlassCardProps) {
  const baseClasses = `
    bg-white/80 
    backdrop-blur-xl 
    border border-slate-200/60 
    shadow-sm
    rounded-2xl
    transition-all duration-300
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  if (onClick || layoutId) {
    return (
      <motion.div
        layoutId={layoutId}
        onClick={onClick}
        whileHover={hover ? { 
          scale: 1.02,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          borderColor: "rgba(148, 163, 184, 0.8)",
        } : {}}
        whileTap={onClick ? { scale: 0.98 } : {}}
        transition={springConfig}
        className={baseClasses}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  )
}
