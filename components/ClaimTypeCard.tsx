"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface ClaimTypeCardProps {
  icon: string
  label: string
  description: string
}

export function ClaimTypeCard({ icon, label, description }: ClaimTypeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className="cursor-pointer hover:shadow-xl transition-shadow h-full">
        <CardContent className="p-3 sm:p-4 md:p-6 flex flex-col items-center text-center">
          <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 md:mb-4">{icon}</div>
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1 sm:mb-2 leading-tight">{label}</h3>
          <p className="text-xs sm:text-xs md:text-sm text-muted-foreground leading-tight px-1">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

