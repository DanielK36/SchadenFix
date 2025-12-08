"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

export function AnimatedButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: AnimatedButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  )
}

