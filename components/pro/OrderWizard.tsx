"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OrderWizardScreen1 } from "./OrderWizardScreens/Screen1"
import { OrderWizardScreen2 } from "./OrderWizardScreens/Screen2"
import { OrderWizardScreen3 } from "./OrderWizardScreens/Screen3"
import { OrderWizardScreen4 } from "./OrderWizardScreens/Screen4"
import { OrderWizardScreen5 } from "./OrderWizardScreens/Screen5"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { updateOrderWizardData } from "@/services/orderService"

export interface WizardData {
  // Screen 1
  selectedTask?: string
  
  // Screen 2 (conditional)
  material?: string
  diameter?: number
  meters?: number
  
  // Screen 3 (Documentation)
  photos?: string[]
  documentationData?: {
    room?: string
    pipe?: string
    material?: string
    dimension?: number
    damageType?: string
    measures?: string[]
    notes?: string
  }
  
  // Screen 4
  hasFollowUpDamage?: boolean
  followUpServices?: string[]
}

interface OrderWizardProps {
  orderId: string
  damageType: string
  onComplete?: (data: WizardData) => void
  onClose?: () => void
}

export function OrderWizard({ orderId, damageType, onComplete, onClose }: OrderWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>({})
  // Initialize canProceed based on whether we have a selected task
  const [canProceed, setCanProceed] = useState(false)
  
  // Calculate total steps dynamically
  const getTotalSteps = () => {
    if (wizardData.selectedTask === "installation") {
      return 4
    }
    return 3
  }
  
  const getDisplayStep = () => {
    const totalSteps = getTotalSteps()
    if (wizardData.selectedTask !== "installation") {
      // Map: 1 -> 1, 3 -> 2, 4 -> 3
      if (currentStep === 1) return 1
      if (currentStep === 3) return 2
      if (currentStep === 4) return 3
      if (currentStep === 5) return 3 // Success screen doesn't count
    }
    return currentStep > 4 ? 4 : currentStep
  }

  // Auto-Save to localStorage
  const storageKey = `order-wizard-${orderId}`

  useEffect(() => {
    // Load saved data
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setWizardData(parsed)
        // Determine current step based on saved data
        if (parsed.followUpServices !== undefined) {
          setCurrentStep(4)
          setCanProceed(true)
        } else if (parsed.documentationData || parsed.photos !== undefined) {
          setCurrentStep(3)
          // Check if documentation is complete
          const docComplete = parsed.documentationData && 
            parsed.documentationData.room && 
            parsed.documentationData.pipe && 
            parsed.documentationData.material && 
            parsed.documentationData.damageType && 
            parsed.documentationData.measures && 
            parsed.documentationData.measures.length > 0
          setCanProceed(docComplete || false)
        } else if (parsed.material || parsed.diameter || parsed.meters !== undefined) {
          setCurrentStep(2)
          // Check if installation task is complete
          if (parsed.selectedTask === "installation") {
            setCanProceed(!!(parsed.material && parsed.diameter && parsed.meters && parsed.meters > 0))
          } else {
            setCanProceed(true)
          }
        } else if (parsed.selectedTask) {
          // For non-installation tasks, skip to step 3 (photos)
          if (parsed.selectedTask !== "installation") {
            setCurrentStep(3)
            setCanProceed(false) // Will be set by photo screen
          } else {
            setCurrentStep(2)
            setCanProceed(false)
          }
        } else {
          // Step 1: Check if we have a selected task
          setCanProceed(!!parsed.selectedTask)
        }
      } catch (e) {
        console.error("Failed to load wizard data", e)
      }
    }
  }, [storageKey])
  
  // Update canProceed when wizardData.selectedTask changes (for step 1)
  useEffect(() => {
    if (currentStep === 1) {
      setCanProceed(!!wizardData.selectedTask)
    }
  }, [wizardData.selectedTask, currentStep])

  useEffect(() => {
    // Auto-save on every change
    localStorage.setItem(storageKey, JSON.stringify(wizardData))
  }, [wizardData, storageKey])

  const updateData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = async () => {
    if (currentStep < 4 && canProceed) {
      let nextStep = currentStep + 1
      
      // Skip step 2 if it's not an installation task
      if (nextStep === 2 && wizardData.selectedTask && wizardData.selectedTask !== "installation") {
        nextStep = 3 // Skip directly to photo step
      }
      
      setCurrentStep(nextStep)
      // Reset canProceed - each screen will set it based on its own validation
      setCanProceed(false)
    } else if (currentStep === 4 && canProceed) {
      // Move to success screen (step 5)
      setCurrentStep(5)
      
      // Save to Supabase
      try {
        // Map WizardData to Supabase format
        const categoryAnswers: Record<string, any> = {}
        
        if (wizardData.selectedTask) {
          categoryAnswers.selectedTask = wizardData.selectedTask
        }
        if (wizardData.material) {
          categoryAnswers.material = wizardData.material
        }
        if (wizardData.diameter) {
          categoryAnswers.diameter = wizardData.diameter
        }
        if (wizardData.meters) {
          categoryAnswers.meters = wizardData.meters
        }
        if (wizardData.documentationData) {
          categoryAnswers.documentation = wizardData.documentationData
        }
        if (wizardData.hasFollowUpDamage !== undefined) {
          categoryAnswers.hasFollowUpDamage = wizardData.hasFollowUpDamage
        }
        if (wizardData.followUpServices) {
          categoryAnswers.followUpServices = wizardData.followUpServices
        }

        // Save to Supabase
        await updateOrderWizardData(orderId, {
          category_answers: categoryAnswers,
          photos: wizardData.photos || [],
          internal_notes: wizardData.documentationData?.notes || undefined,
        })
      } catch (error) {
        console.error("Failed to save wizard data:", error)
        // Continue anyway - data is saved in localStorage as backup
      }
      
      // Complete wizard and save data
      if (onComplete) {
        onComplete(wizardData)
      }
      // Save as lead in background (simulated)
      console.log("Saving follow-up services as leads:", wizardData.followUpServices)
      // Clear saved data after showing success
      setTimeout(() => {
        localStorage.removeItem(storageKey)
      }, 2000)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      let prevStep = currentStep - 1
      
      // Skip step 2 when going back if it's not an installation task
      if (prevStep === 2 && wizardData.selectedTask && wizardData.selectedTask !== "installation") {
        prevStep = 1 // Go back to step 1
      }
      
      setCurrentStep(prevStep)
      setCanProceed(false)
    }
  }

  const getScreenComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <OrderWizardScreen1
            damageType={damageType}
            selectedTask={wizardData.selectedTask}
            onSelect={(task) => {
              updateData({ selectedTask: task })
              // Set canProceed immediately when task is selected
              setCanProceed(true)
            }}
            onCanProceedChange={setCanProceed}
          />
        )
      case 2:
        return (
          <OrderWizardScreen2
            selectedTask={wizardData.selectedTask || ""}
            material={wizardData.material}
            diameter={wizardData.diameter}
            meters={wizardData.meters}
            onUpdate={updateData}
            onCanProceedChange={setCanProceed}
          />
        )
      case 3:
        return (
          <OrderWizardScreen3
            selectedTask={wizardData.selectedTask || ""}
            photos={wizardData.photos || []}
            documentationData={wizardData.documentationData}
            onUpdate={updateData}
            onCanProceedChange={setCanProceed}
          />
        )
      case 4:
        return (
          <OrderWizardScreen4
            hasFollowUpDamage={wizardData.hasFollowUpDamage}
            followUpServices={wizardData.followUpServices || []}
            onUpdate={updateData}
            onCanProceedChange={setCanProceed}
          />
        )
      case 5:
        return (
          <OrderWizardScreen5
            onBackToDashboard={() => {
              if (onClose) {
                onClose()
              }
              router.push("/pro/dashboard")
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] md:hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || currentStep === 5}
          className={`p-2 rounded-lg ${currentStep === 1 || currentStep === 5 ? "opacity-30" : "active:bg-slate-100"}`}
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div className="flex-1 text-center">
          {currentStep !== 5 && (
            <>
              <p className="text-sm font-medium text-slate-700">
                Schritt {getDisplayStep()} von {getTotalSteps()}
              </p>
              <div className="flex gap-1 mt-2 justify-center">
                {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((step) => (
                  <div
                    key={step}
                    className={`h-1 rounded-full transition-all ${
                      step <= getDisplayStep()
                        ? "bg-[#D4AF37] w-8"
                        : "bg-slate-200 w-2"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <button
          onClick={onClose || (() => {})}
          className="p-2 rounded-lg active:bg-slate-100"
          aria-label="Schließen"
        >
          <X className="w-6 h-6 text-slate-700" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {getScreenComponent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer - Next Button (hidden on success screen) */}
      {currentStep !== 5 && (
        <div className="bg-white border-t border-slate-200 px-4 py-4 pb-6" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              canProceed
                ? "bg-[#D4AF37] text-slate-900 active:scale-[0.98] shadow-md cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {currentStep === 4 ? "Abschließen" : "Weiter"}
            <ChevronRight className="w-5 h-5 inline-block ml-2" />
          </button>
        </div>
      )}
    </div>
  )
}

