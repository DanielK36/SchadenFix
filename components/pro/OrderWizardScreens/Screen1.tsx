"use client"

import { Search, Droplets, Wrench, Paintbrush, Home, AlertCircle } from "lucide-react"
import { useEffect } from "react"

interface OrderWizardScreen1Props {
  damageType: string
  selectedTask?: string
  onSelect: (task: string) => void
  onCanProceedChange: (canProceed: boolean) => void
}

const taskOptions = [
  {
    id: "leak_detection",
    label: "Leckortung",
    icon: Search,
    color: "bg-blue-100 text-blue-700",
    iconColor: "text-blue-600",
  },
  {
    id: "drying",
    label: "Trocknung",
    icon: Droplets,
    color: "bg-cyan-100 text-cyan-700",
    iconColor: "text-cyan-600",
  },
  {
    id: "installation",
    label: "Installation",
    icon: Wrench,
    color: "bg-orange-100 text-orange-700",
    iconColor: "text-orange-600",
  },
  {
    id: "painting",
    label: "Maler",
    icon: Paintbrush,
    color: "bg-purple-100 text-purple-700",
    iconColor: "text-purple-600",
  },
  {
    id: "building",
    label: "Gebäude",
    icon: Home,
    color: "bg-green-100 text-green-700",
    iconColor: "text-green-600",
  },
  {
    id: "other",
    label: "Sonstiges",
    icon: AlertCircle,
    color: "bg-slate-100 text-slate-700",
    iconColor: "text-slate-600",
  },
]

export function OrderWizardScreen1({
  damageType,
  selectedTask,
  onSelect,
  onCanProceedChange,
}: OrderWizardScreen1Props) {
  useEffect(() => {
    // Update canProceed whenever selectedTask changes
    const canProceed = !!selectedTask
    onCanProceedChange(canProceed)
  }, [selectedTask, onCanProceedChange])

  return (
    <div className="h-full flex flex-col px-4 py-6">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          Was liegt an?
        </h1>
        <p className="text-slate-500 text-center mb-8">
          Wähle die Hauptaufgabe für diesen Auftrag
        </p>

        <div className="grid grid-cols-2 gap-4">
          {taskOptions.map((task) => {
            const Icon = task.icon
            const isSelected = selectedTask === task.id

            return (
              <button
                key={task.id}
                onClick={() => {
                  onSelect(task.id)
                  if (navigator.vibrate) {
                    navigator.vibrate(50)
                  }
                }}
                className={`p-6 rounded-xl border-2 transition-all active:scale-[0.98] ${
                  isSelected
                    ? `${task.color} border-[#B8903A] shadow-md`
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`p-3 rounded-lg ${
                      isSelected ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-8 h-8 ${task.iconColor}`} />
                  </div>
                  <span
                    className={`font-semibold text-sm ${
                      isSelected ? task.color.split(" ")[1] : "text-slate-700"
                    }`}
                  >
                    {task.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

