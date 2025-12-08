"use client"

import { motion } from "framer-motion"
import { Clock, User, Camera, Mic, FileText, CheckCircle2 } from "lucide-react"
import type { WizardData } from "./OrderWizard"

interface TimelineEvent {
  id: string
  time: string
  type: "order_created" | "wizard_data" | "voice_note" | "quote" | "status_change"
  title: string
  content?: React.ReactNode
  user?: string
}

interface OrderTimelineProps {
  orderCreatedAt: string
  wizardData?: WizardData | null
  status: string
}

export function OrderTimeline({
  orderCreatedAt,
  wizardData,
  status,
}: OrderTimelineProps) {
  const events: TimelineEvent[] = []

  // Event 1: Order Created
  const createdDate = new Date(orderCreatedAt)
  events.push({
    id: "order-created",
    time: `${createdDate.getHours().toString().padStart(2, "0")}:${createdDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`,
    type: "order_created",
    title: "Auftrag angelegt",
    user: "System",
  })

  // Event 2: Wizard Data (if available)
  if (wizardData) {
    const wizardDate = new Date() // In production, use actual timestamp
    const wizardTime = `${wizardDate.getHours().toString().padStart(2, "0")}:${wizardDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`

    // Task selection
    if (wizardData.selectedTask) {
      const taskLabels: Record<string, string> = {
        leak_detection: "Leckortung",
        drying: "Trocknung",
        installation: "Installation",
        painting: "Maler",
        building: "Gebäude",
        other: "Sonstiges",
      }

      events.push({
        id: "wizard-task",
        time: wizardTime,
        type: "wizard_data",
        title: `Azubi Max hat Daten erfasst`,
        user: "Max Mustermann",
        content: (
          <div className="space-y-4 mt-3">
            {/* Task */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Aufgabe</p>
              <p className="text-sm font-medium text-slate-900">
                {taskLabels[wizardData.selectedTask] || wizardData.selectedTask}
              </p>
            </div>

            {/* Installation Details */}
            {wizardData.selectedTask === "installation" && (
              <div className="space-y-2">
                {wizardData.material && (
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-xs text-slate-600">Material</span>
                    <span className="text-sm font-medium text-slate-900">
                      {wizardData.material === "copper"
                        ? "Kupfer"
                        : wizardData.material === "plastic"
                          ? "Kunststoff"
                          : "Mehrschicht"}
                    </span>
                  </div>
                )}
                {wizardData.diameter && (
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-xs text-slate-600">Durchmesser</span>
                    <span className="text-sm font-medium text-slate-900">DN{wizardData.diameter}</span>
                  </div>
                )}
                {wizardData.meters !== undefined && (
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-xs text-slate-600">Länge</span>
                    <span className="text-sm font-medium text-slate-900">{wizardData.meters} m</span>
                  </div>
                )}
              </div>
            )}

            {/* Documentation Data */}
            {wizardData.documentationData && (
              <div className="space-y-3">
                {wizardData.documentationData.room && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Raum</p>
                    <p className="text-sm font-medium text-slate-900">
                      {wizardData.documentationData.room}
                    </p>
                  </div>
                )}
                {wizardData.documentationData.pipe && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Leitung</p>
                    <p className="text-sm font-medium text-slate-900">
                      {wizardData.documentationData.pipe}
                    </p>
                  </div>
                )}
                {wizardData.documentationData.material && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Material & Dimension</p>
                    <p className="text-sm font-medium text-slate-900">
                      {wizardData.documentationData.material}, DN
                      {wizardData.documentationData.dimension || 15}
                    </p>
                  </div>
                )}
                {wizardData.documentationData.damageType && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Schadensbild</p>
                    <p className="text-sm font-medium text-slate-900">
                      {wizardData.documentationData.damageType}
                    </p>
                  </div>
                )}
                {wizardData.documentationData.measures &&
                  wizardData.documentationData.measures.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Sofortmaßnahmen</p>
                      <div className="flex flex-wrap gap-2">
                        {wizardData.documentationData.measures.map((measure, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {measure}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Photos */}
            {wizardData.photos && wizardData.photos.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Fotos ({wizardData.photos.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {wizardData.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="aspect-square bg-slate-200 rounded-lg overflow-hidden"
                    >
                      <img
                        src={photo}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {wizardData.documentationData?.notes && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Ergänzende Notizen</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {wizardData.documentationData.notes}
                </p>
              </div>
            )}
          </div>
        ),
      })
    }

    // Voice Note (if available)
    if (wizardData.documentationData?.notes && wizardData.documentationData.notes.includes("Mieter")) {
      events.push({
        id: "voice-note",
        time: `${(wizardDate.getMinutes() + 5).toString().padStart(2, "0")}:${wizardDate
          .getSeconds()
          .toString()
          .padStart(2, "0")}`,
        type: "voice_note",
        title: "Sprachnotiz",
        user: "Max Mustermann",
        content: (
          <div className="mt-3">
            {/* VoiceNotePlayer would be rendered here */}
            <p className="text-sm text-slate-600 italic">
              Sprachnotiz wurde transkribiert (siehe Notizen oben)
            </p>
          </div>
        ),
      })
    }
  }

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "order_created":
        return <FileText className="w-4 h-4" />
      case "wizard_data":
        return <Camera className="w-4 h-4" />
      case "voice_note":
        return <Mic className="w-4 h-4" />
      case "quote":
        return <FileText className="w-4 h-4" />
      default:
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative pl-8 pb-6 border-l-2 border-slate-200 last:border-l-0 last:pb-0"
        >
          {/* Timeline Dot */}
          <div className="absolute left-0 top-0 -translate-x-[9px] w-4 h-4 bg-white border-2 border-[#D4AF37] rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
          </div>

          {/* Content */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="text-slate-400">{getEventIcon(event.type)}</div>
              <span className="text-sm font-semibold text-slate-900">{event.time}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-sm font-medium text-slate-700">{event.title}</span>
            </div>
            {event.user && (
              <p className="text-xs text-slate-500 ml-6">{event.user}</p>
            )}
            {event.content && <div className="mt-2">{event.content}</div>}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

