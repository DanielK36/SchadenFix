"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface OrderWizardScreen5Props {
  onBackToDashboard: () => void
}

export function OrderWizardScreen5({ onBackToDashboard }: OrderWizardScreen5Props) {
  return (
    <div className="h-full flex flex-col px-4 py-6">
      <div className="flex-1 flex flex-col justify-center items-center">
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
        </motion.div>

        {/* Success Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Perfekt! Daten übertragen.
          </h1>
          <p className="text-slate-500 text-center mb-8">
            Das Büro erstellt jetzt das Angebot.
          </p>
        </motion.div>

        {/* Back to Dashboard Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <button
            onClick={onBackToDashboard}
            className="w-full py-4 px-6 rounded-xl bg-[#D4AF37] text-slate-900 font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Zurück zum Dashboard</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

