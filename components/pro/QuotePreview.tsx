"use client"

import { useState, useEffect } from "react"
import { Edit2, Send, Check } from "lucide-react"
import type { WizardData } from "./OrderWizard"

interface QuoteItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

interface QuotePreviewProps {
  orderId: string
  customerName: string
  customerAddress: string
  wizardData: WizardData
  onEdit?: () => void
  onApprove?: () => void
}

// Automatische Angebotsgenerierung aus Wizard-Daten
function generateQuoteFromWizardData(wizardData: WizardData): QuoteItem[] {
  const items: QuoteItem[] = []
  const doc = wizardData.documentationData || {}

  // Hauptaufgabe basierend auf selectedTask
  if (wizardData.selectedTask === "leak_detection") {
    // Leckortung: Pauschale Leckortung inkl. Anfahrt
    items.push({
      id: "leak_detection",
      description: "Pauschale Leckortung inkl. Anfahrt",
      quantity: 1,
      unit: "Pauschale",
      unitPrice: 150.0,
      total: 150.0,
    })
    
    // Wenn Notabdichtung als Maßnahme gewählt wurde
    if (doc.measures && doc.measures.includes("Notabdichtung")) {
      const materialLabel = doc.material === "Kupfer" ? "Kupfer" : 
                           doc.material === "Edelstahl" ? "Edelstahl" :
                           doc.material === "Mehrschicht" ? "Mehrschicht" : "Kunststoff"
      items.push({
        id: "emergency_seal",
        description: `Notabdichtung ${materialLabel}leitung, Material & Lohn`,
        quantity: 1,
        unit: "Pauschale",
        unitPrice: 85.0,
        total: 85.0,
      })
    }
    
    // Wenn Trocknung empfohlen (als Maßnahme oder wenn Wasser abgestellt wurde)
    if (doc.measures && (doc.measures.includes("Wasser abgestellt") || doc.measures.includes("Leitung entleert"))) {
      items.push({
        id: "drying_recommendation",
        description: "Technische Bautrocknung (Vorbereitung)",
        quantity: 1,
        unit: "Angebot folgt",
        unitPrice: 0.0,
        total: 0.0,
      })
    }
    
    // Arbeitszeit für Leckortung
    items.push({
      id: "leak_detection_labor",
      description: "Arbeitszeit (inkl. Anfahrt)",
      quantity: 1,
      unit: "Std.",
      unitPrice: 65.0,
      total: 65.0,
    })
  } else if (wizardData.selectedTask === "installation") {
    const materialLabel =
      wizardData.material === "copper"
        ? "Kupfer"
        : wizardData.material === "plastic"
          ? "Kunststoff"
          : "Mehrschicht"

    const diameterLabel = wizardData.diameter ? `DN${wizardData.diameter}` : ""

    items.push({
      id: "pipe_renewal",
      description: `Rohrleitungserneuerung ${materialLabel}, ${diameterLabel}, inkl. Formstücke`,
      quantity: wizardData.meters || 0,
      unit: "m",
      unitPrice: wizardData.material === "copper" ? 45.0 : wizardData.material === "plastic" ? 28.0 : 38.0,
      total: (wizardData.meters || 0) * (wizardData.material === "copper" ? 45.0 : wizardData.material === "plastic" ? 28.0 : 38.0),
    })

    // Arbeitszeit
    const workHours = Math.ceil((wizardData.meters || 0) / 5) // 5m pro Stunde
    items.push({
      id: "labor",
      description: "Arbeitszeit (inkl. Anfahrt)",
      quantity: workHours,
      unit: "Std.",
      unitPrice: 65.0,
      total: workHours * 65.0,
    })
  } else if (wizardData.selectedTask === "drying") {
    items.push({
      id: "drying",
      description: "Trocknung (Tagespauschale)",
      quantity: 1,
      unit: "Tag",
      unitPrice: 120.0,
      total: 120.0,
    })
  } else if (wizardData.selectedTask === "painting") {
    items.push({
      id: "painting",
      description: "Malerarbeiten (Pauschale)",
      quantity: 1,
      unit: "Pauschale",
      unitPrice: 250.0,
      total: 250.0,
    })
  }

  // Folgeschäden (Cross-Selling)
  if (wizardData.followUpServices && wizardData.followUpServices.length > 0) {
    wizardData.followUpServices.forEach((service) => {
      const serviceLabels: Record<string, { description: string; price: number }> = {
        painter: { description: "Malerarbeiten (Folgeschaden)", price: 250.0 },
        electrician: { description: "Elektrikerarbeiten (Folgeschaden)", price: 180.0 },
        flooring: { description: "Bodenlegerarbeiten (Folgeschaden)", price: 320.0 },
        plumber: { description: "Klempnerarbeiten (Folgeschaden)", price: 150.0 },
        carpenter: { description: "Tischlerarbeiten (Folgeschaden)", price: 280.0 },
      }

      const serviceData = serviceLabels[service]
      if (serviceData) {
        items.push({
          id: `followup_${service}`,
          description: serviceData.description,
          quantity: 1,
          unit: "Pauschale",
          unitPrice: serviceData.price,
          total: serviceData.price,
        })
      }
    })
  }

  return items
}

export function QuotePreview({
  orderId,
  customerName,
  customerAddress,
  wizardData,
  onEdit,
  onApprove,
}: QuotePreviewProps) {
  const initialItems = generateQuoteFromWizardData(wizardData)
  const [items, setItems] = useState<QuoteItem[]>(initialItems)
  const [isEditing, setIsEditing] = useState(false)

  // Update items when wizardData changes
  useEffect(() => {
    setItems(generateQuoteFromWizardData(wizardData))
  }, [wizardData])

  // Recalculate totals when items change
  const netTotal = items.reduce((sum, item) => sum + item.total, 0)
  const vatRate = 19
  const vatAmount = (netTotal * vatRate) / 100
  const grossTotal = netTotal + vatAmount

  const handlePriceChange = (itemId: string, newPrice: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const newTotal = item.quantity * newPrice
          return { ...item, unitPrice: newPrice, total: newTotal }
        }
        return item
      })
    )
  }

  const handleEdit = () => {
    setIsEditing(true)
    if (onEdit) {
      onEdit()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 max-w-2xl mx-auto">
      {/* PDF-ähnliches Design */}
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-slate-300 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Kostenvoranschlag</h2>
              <p className="text-sm text-slate-500 mt-1">Angebotsnummer: {orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Datum</p>
              <p className="text-sm font-semibold text-slate-900">
                {new Date().toLocaleDateString("de-DE")}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">An</p>
            <p className="text-sm font-medium text-slate-900">{customerName}</p>
            <p className="text-sm text-slate-600">{customerAddress}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Von</p>
            <p className="text-sm font-medium text-slate-900">Ihr Handwerksbetrieb</p>
            <p className="text-sm text-slate-600">Musterstraße 1</p>
            <p className="text-sm text-slate-600">41061 Mönchengladbach</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t border-slate-300 pt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-xs font-semibold text-slate-600 uppercase">Position</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase">Menge</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase">Einzelpreis</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase">Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3 text-sm text-slate-900">{item.description}</td>
                  <td className="py-3 text-sm text-slate-600 text-right">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 text-sm text-slate-600 text-right">
                    {isEditing && item.unitPrice > 0 ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 text-right border border-slate-300 rounded focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-white"
                      />
                    ) : (
                      item.unitPrice.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })
                    )}
                  </td>
                  <td className="py-3 text-sm font-semibold text-slate-900 text-right">
                    {item.total.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-slate-300 pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Nettobetrag</span>
                <span className="font-medium text-slate-900">
                  {netTotal.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">MwSt. ({vatRate}%)</span>
                <span className="font-medium text-slate-900">
                  {vatAmount.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-300">
                <span className="font-bold text-slate-900">Gesamtbetrag</span>
                <span className="font-bold text-lg text-slate-900">
                  {grossTotal.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">
            Dieses Angebot ist 14 Tage gültig. Alle Preise verstehen sich inkl. MwSt.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-6 border-t border-slate-200 flex gap-3">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex-1 py-3 px-4 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
        >
          <Edit2 className="w-5 h-5" />
          <span>{isEditing ? "Fertig" : "Bearbeiten"}</span>
        </button>
        <button
          onClick={onApprove}
          className="flex-1 py-3 px-4 bg-[#D4AF37] text-slate-900 rounded-lg font-semibold hover:bg-[#B8941F] transition-colors shadow-md flex items-center justify-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>Angebot freigeben & Senden</span>
        </button>
      </div>
    </div>
  )
}

