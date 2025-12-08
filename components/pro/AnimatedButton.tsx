"use client"

import { motion } from "framer-motion"
import { ReactNode, ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends ComponentPropsWithoutRef<typeof motion.button> {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function AnimatedButton({ children, className, onClick, ...props }: AnimatedButtonProps) {
  const handleClick = () => {
    // Haptik
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    onClick?.()
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={cn("transition-transform", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </motion.button>
  )
}

