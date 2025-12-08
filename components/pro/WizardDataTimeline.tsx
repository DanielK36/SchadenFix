"use client"

import { Camera, CheckCircle, Package, Wrench, AlertCircle } from "lucide-react"
import type { WizardData } from "./OrderWizard"

interface WizardDataTimelineProps {
  wizardData: WizardData
}

const taskLabels: Record<string, string> = {
  leak_detection: "Leckortung",
  drying: "Trocknung",
  installation: "Installation",
  painting: "Maler",
  building: "Gebäude",
  other: "Sonstiges",
}

const materialLabels: Record<string, string> = {
  copper: "Kupfer",
  plastic: "Kunststoff",
  multilayer: "Mehrschicht",
}

const followUpServiceLabels: Record<string, string> = {
  painter: "Maler",
  electrician: "Elektriker",
  flooring: "Bodenleger",
  plumber: "Klempner",
  carpenter: "Tischler",
}

export function WizardDataTimeline({ wizardData }: WizardDataTimelineProps) {
  const timelineItems = []

  // Task Selection
  if (wizardData.selectedTask) {
    timelineItems.push({
      icon: Package,
      title: "Aufgabe ausgewählt",
      content: taskLabels[wizardData.selectedTask] || wizardData.selectedTask,
      timestamp: "Vor-Ort erfasst",
    })
  }

  // Installation Details
  if (wizardData.selectedTask === "installation") {
    if (wizardData.material) {
      timelineItems.push({
        icon: Wrench,
        title: "Material",
        content: materialLabels[wizardData.material] || wizardData.material,
        timestamp: "Vor-Ort erfasst",
      })
    }
    if (wizardData.diameter) {
      timelineItems.push({
        icon: Wrench,
        title: "Durchmesser",
        content: `${wizardData.diameter} mm`,
        timestamp: "Vor-Ort erfasst",
      })
    }
    if (wizardData.meters !== undefined) {
      timelineItems.push({
        icon: Wrench,
        title: "Länge",
        content: `${wizardData.meters} Meter`,
        timestamp: "Vor-Ort erfasst",
      })
    }
  }

  // Documentation Data (Structured)
  if (wizardData.documentationData) {
    const doc = wizardData.documentationData
    
    if (doc.room || doc.pipe || doc.material || doc.damageType) {
      const docParts = []
      if (doc.room) docParts.push(`Raum: ${doc.room}`)
      if (doc.pipe) docParts.push(`Leitung: ${doc.pipe}`)
      if (doc.material && doc.dimension) docParts.push(`${doc.material}, DN${doc.dimension}`)
      if (doc.damageType) docParts.push(`Schaden: ${doc.damageType}`)
      if (doc.measures && doc.measures.length > 0) {
        docParts.push(`Maßnahmen: ${doc.measures.join(", ")}`)
      }
      
      timelineItems.push({
        icon: Package,
        title: "Dokumentation",
        content: docParts.join(" • "),
        timestamp: "Vor-Ort erfasst",
      })
    }
    
    if (doc.notes) {
      timelineItems.push({
        icon: AlertCircle,
        title: "Ergänzende Notizen",
        content: doc.notes,
        timestamp: "Vor-Ort erfasst",
      })
    }
  }

  // Photos
  if (wizardData.photos && wizardData.photos.length > 0) {
    timelineItems.push({
      icon: Camera,
      title: "Fotos",
      content: `${wizardData.photos.length} Foto${wizardData.photos.length > 1 ? "s" : ""} aufgenommen`,
      timestamp: "Vor-Ort erfasst",
      photos: wizardData.photos,
    })
  }

  // Follow-up Damage
  if (wizardData.hasFollowUpDamage !== undefined) {
    timelineItems.push({
      icon: AlertCircle,
      title: "Folgeschäden",
      content: wizardData.hasFollowUpDamage ? "Ja" : "Nein",
      timestamp: "Vor-Ort erfasst",
    })
  }

  // Follow-up Services
  if (wizardData.followUpServices && wizardData.followUpServices.length > 0) {
    timelineItems.push({
      icon: CheckCircle,
      title: "Benötigte Gewerke",
      content: wizardData.followUpServices
        .map((s) => followUpServiceLabels[s] || s)
        .join(", "),
      timestamp: "Vor-Ort erfasst",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Vor-Ort Erfassung</h2>
        <p className="text-sm text-slate-500">Daten vom Azubi</p>
      </div>

      <div className="space-y-4">
        {timelineItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className="relative pl-10">
              {/* Timeline Line */}
              {index < timelineItems.length - 1 && (
                <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-slate-200" />
              )}

              {/* Icon */}
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#D4AF37]" />
              </div>

              {/* Content */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{item.content}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                    {item.timestamp}
                  </span>
                </div>

                {/* Photo Grid */}
                {item.photos && item.photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {item.photos.map((photo, photoIndex) => (
                      <div
                        key={photoIndex}
                        className="aspect-square rounded-lg overflow-hidden bg-slate-100"
                      >
                        <img
                          src={photo}
                          alt={`Foto ${photoIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {timelineItems.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-500">Noch keine Vor-Ort-Daten erfasst</p>
          <p className="text-sm text-slate-400 mt-1">
            Der Azubi kann die Daten mobil erfassen
          </p>
        </div>
      )}
    </div>
  )
}

