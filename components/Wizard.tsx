"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface WizardProps {
  steps: number
  currentStep: number
  children: React.ReactNode
  onNext: () => void
  onBack: () => void
  canProceed: boolean
  isLastStep: boolean
}

export function Wizard({
  steps,
  currentStep,
  children,
  onNext,
  onBack,
  canProceed,
  isLastStep,
}: WizardProps) {
  const progress = ((currentStep + 1) / steps) * 100

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-4 sm:mb-8">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
          <span>Schritt {currentStep + 1} von {steps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between gap-2 sm:gap-4 mt-6 sm:mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 0}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Zurück</span>
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10 flex-1 sm:flex-initial"
        >
          <span>{isLastStep ? "Absenden" : "Weiter"}</span>
          {!isLastStep && <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />}
        </Button>
      </div>
    </div>
  )
}

