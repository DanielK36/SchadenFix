"use client"

import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"
import type { WizardData } from "../OrderWizard"

interface OrderWizardScreen4Props {
  hasFollowUpDamage?: boolean
  followUpServices?: string[]
  onUpdate: (updates: Partial<WizardData>) => void
  onCanProceedChange: (canProceed: boolean) => void
}

const followUpServices = [
  { id: "painter", label: "Maler", icon: "🎨" },
  { id: "drying", label: "Trocknung", icon: "💨" },
  { id: "assessor", label: "Gutachter", icon: "📋" },
  { id: "electrician", label: "Elektriker", icon: "⚡" },
  { id: "flooring", label: "Bodenleger", icon: "🏠" },
  { id: "plumber", label: "Klempner", icon: "🔧" },
  { id: "carpenter", label: "Tischler", icon: "🪵" },
]

export function OrderWizardScreen4({
  hasFollowUpDamage,
  followUpServices: selectedServices = [],
  onUpdate,
  onCanProceedChange,
}: OrderWizardScreen4Props) {
  const [currentQuestion, setCurrentQuestion] = useState<"followup" | "services">("followup")

  useEffect(() => {
    if (currentQuestion === "followup" && hasFollowUpDamage === undefined) {
      onCanProceedChange(false)
    } else if (currentQuestion === "services" && hasFollowUpDamage === true) {
      onCanProceedChange(selectedServices.length > 0)
    } else if (currentQuestion === "services" && hasFollowUpDamage === false) {
      onCanProceedChange(true)
    }
  }, [currentQuestion, hasFollowUpDamage, selectedServices.length, onCanProceedChange])

  const handleFollowUpAnswer = (answer: boolean) => {
    onUpdate({ hasFollowUpDamage: answer })
    if (answer) {
      // Immediately show services selection (no delay)
      setCurrentQuestion("services")
      // Don't allow proceeding until services are selected
      onCanProceedChange(false)
    } else {
      // No follow-up damage, can proceed immediately
      onCanProceedChange(true)
    }
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const toggleService = (serviceId: string) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId]
    onUpdate({ followUpServices: newServices })
    onCanProceedChange(newServices.length > 0)
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
  }

  return (
    <div className="h-full flex flex-col px-4 py-6">
      <div className="flex-1 flex flex-col justify-center">
        {currentQuestion === "followup" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Folgeschäden?
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Gibt es Folgeschäden für andere Gewerke?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleFollowUpAnswer(true)}
                className={`flex-1 py-6 rounded-xl border-2 font-semibold transition-all active:scale-[0.98] ${
                  hasFollowUpDamage === true
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Check className="w-8 h-8" />
                  <span>Ja</span>
                </div>
              </button>
              <button
                onClick={() => handleFollowUpAnswer(false)}
                className={`flex-1 py-6 rounded-xl border-2 font-semibold transition-all active:scale-[0.98] ${
                  hasFollowUpDamage === false
                    ? "bg-red-100 border-red-500 text-red-700"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <X className="w-8 h-8" />
                  <span>Nein</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {currentQuestion === "services" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Wer wird benötigt?
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Wähle alle benötigten Gewerke
            </p>
            <div className="grid grid-cols-2 gap-3">
              {followUpServices.map((service) => {
                const isSelected = selectedServices.includes(service.id)
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`py-4 px-4 rounded-xl border-2 font-semibold transition-all active:scale-[0.98] ${
                      isSelected
                        ? "bg-[#D4AF37] border-[#D4AF37] text-slate-900 shadow-md"
                        : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-2xl">{service.icon}</span>
                      <span className="text-sm">{service.label}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center mt-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

