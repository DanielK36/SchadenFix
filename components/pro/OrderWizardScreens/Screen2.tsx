"use client"

import { useEffect, useState } from "react"
import { Minus, Plus } from "lucide-react"
import type { WizardData } from "../OrderWizard"

interface OrderWizardScreen2Props {
  selectedTask: string
  material?: string
  diameter?: number
  meters?: number
  onUpdate: (updates: Partial<WizardData>) => void
  onCanProceedChange: (canProceed: boolean) => void
}

const materialOptions = [
  { id: "copper", label: "Kupfer" },
  { id: "plastic", label: "Kunststoff" },
  { id: "multilayer", label: "Mehrschicht" },
]

const diameterOptions = [15, 20, 25, 32, 40, 50]

export function OrderWizardScreen2({
  selectedTask,
  material,
  diameter,
  meters = 0,
  onUpdate,
  onCanProceedChange,
}: OrderWizardScreen2Props) {
  const [currentQuestion, setCurrentQuestion] = useState<"material" | "diameter" | "meters">("material")

  // Determine which questions to show based on task
  const needsMaterial = selectedTask === "installation"
  const needsDiameter = selectedTask === "installation" && material
  const needsMeters = selectedTask === "installation" && diameter

  useEffect(() => {
    // Auto-advance through questions
    if (needsMaterial && !material) {
      setCurrentQuestion("material")
    } else if (needsDiameter && !diameter) {
      setCurrentQuestion("diameter")
    } else if (needsMeters) {
      setCurrentQuestion("meters")
    }

    // Check if we can proceed
    if (selectedTask === "installation") {
      const canProceed = !!(material && diameter && meters > 0)
      onCanProceedChange(canProceed)
    } else {
      // For other tasks, we can proceed immediately
      onCanProceedChange(true)
    }
  }, [selectedTask, material, diameter, meters, needsMaterial, needsDiameter, needsMeters, onCanProceedChange])

  if (!needsMaterial) {
    // For non-installation tasks, skip to photo step
    // This screen will be skipped automatically
    return null
  }

  return (
    <div className="h-full flex flex-col px-4 py-6">
      <div className="flex-1 flex flex-col justify-center">
        {currentQuestion === "material" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Welches Material?
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Wähle das verwendete Material
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {materialOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onUpdate({ material: opt.id })
                    setCurrentQuestion("diameter")
                    if (navigator.vibrate) {
                      navigator.vibrate(50)
                    }
                  }}
                  className={`px-6 py-3 rounded-full font-semibold transition-all active:scale-[0.98] ${
                    material === opt.id
                      ? "bg-[#D4AF37] text-slate-900 shadow-md"
                      : "bg-white border-2 border-slate-200 text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentQuestion === "diameter" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Welcher Durchmesser?
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Wähle den Rohrdurchmesser in mm
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {diameterOptions.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    onUpdate({ diameter: d })
                    setCurrentQuestion("meters")
                    if (navigator.vibrate) {
                      navigator.vibrate(50)
                    }
                  }}
                  className={`px-6 py-3 rounded-full font-semibold transition-all active:scale-[0.98] ${
                    diameter === d
                      ? "bg-[#D4AF37] text-slate-900 shadow-md"
                      : "bg-white border-2 border-slate-200 text-slate-700"
                  }`}
                >
                  {d} mm
                </button>
              ))}
            </div>
          </div>
        )}

        {currentQuestion === "meters" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Wie viele Meter?
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Gib die Länge in Metern ein
            </p>
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={() => {
                  if (meters > 0) {
                    onUpdate({ meters: meters - 1 })
                    if (navigator.vibrate) {
                      navigator.vibrate(30)
                    }
                  }
                }}
                disabled={meters === 0}
                className={`p-3 rounded-full ${
                  meters === 0
                    ? "bg-slate-100 text-slate-400"
                    : "bg-white border-2 border-slate-200 text-slate-700 active:scale-[0.98]"
                }`}
              >
                <Minus className="w-6 h-6" />
              </button>
              <div className="text-center">
                <div className="text-5xl font-bold text-slate-900 mb-2">{meters}</div>
                <div className="text-sm text-slate-500">Meter</div>
              </div>
              <button
                onClick={() => {
                  onUpdate({ meters: meters + 1 })
                  if (navigator.vibrate) {
                    navigator.vibrate(30)
                  }
                }}
                className="p-3 rounded-full bg-white border-2 border-slate-200 text-slate-700 active:scale-[0.98]"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

