"use client"

import { useState, useEffect } from "react"
import { Edit2, Send, Plus, Trash2, FileText, CheckCircle2, Mail } from "lucide-react"
import type { WizardData } from "./OrderWizard"
import { supabase } from "@/lib/supabase"

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
  initialItems?: QuoteItem[] | null
  offerSentAt?: string | null
  customerAcceptedAt?: string | null
  onSaveItems?: (items: QuoteItem[]) => Promise<void>
  onEdit?: () => void
  onApprove?: () => void
}

interface CompanyData {
  companyName: string
  address: string
  city: string
  zip: string
  contactPerson?: string
  email?: string
  phone?: string
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
  initialItems: savedItems,
  offerSentAt,
  customerAcceptedAt,
  onSaveItems,
  onEdit,
  onApprove,
}: QuotePreviewProps) {
  const fromWizard = generateQuoteFromWizardData(wizardData)
  const [items, setItems] = useState<QuoteItem[]>(
    savedItems && savedItems.length > 0 ? savedItems : fromWizard
  )
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: "Ihr Handwerksbetrieb",
    address: "",
    city: "",
    zip: "",
  })
  const [loadingCompanyData, setLoadingCompanyData] = useState(true)

  // Gespeicherte Items von außen übernehmen
  useEffect(() => {
    if (savedItems && savedItems.length > 0) {
      setItems(savedItems)
    }
  }, [savedItems])

  // Load company contact data from profile (Firmenprofil aus Einstellungen)
  useEffect(() => {
    async function loadCompanyData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoadingCompanyData(false)
          return
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("company_name, contact_person, email, phone, address, zip, city")
          .eq("id", user.id)
          .maybeSingle()

        if (error) {
          console.error("Error loading company data:", error)
          setLoadingCompanyData(false)
          return
        }

        const p = profile as Record<string, unknown> | null
        if (p) {
          setCompanyData({
            companyName: (p.company_name as string) ?? "",
            address: (p.address as string) ?? "",
            zip: (p.zip as string) ?? "",
            city: (p.city as string) ?? "",
            contactPerson: (p.contact_person as string) ?? undefined,
            email: (p.email as string) ?? undefined,
            phone: (p.phone as string) ?? undefined,
          })
        }
      } catch (error) {
        console.error("Error loading company data:", error)
      } finally {
        setLoadingCompanyData(false)
      }
    }

    loadCompanyData()
  }, [])

  // Update items when wizardData changes, aber nur wenn noch keine gespeicherten Items geladen wurden
  useEffect(() => {
    if (!savedItems || savedItems.length === 0) {
      setItems(generateQuoteFromWizardData(wizardData))
    }
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

  const handleDescriptionChange = (itemId: string, description: string) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, description } : i)))
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        const q = Math.max(0, quantity)
        return { ...item, quantity: q, total: q * item.unitPrice }
      })
    )
  }

  const handleUnitChange = (itemId: string, unit: string) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, unit } : i)))
  }

  const handleAddPosition = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        description: "Neue Position",
        quantity: 1,
        unit: "Stk.",
        unitPrice: 0,
        total: 0,
      },
    ])
  }

  const handleRemovePosition = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const handleEdit = () => {
    setIsEditing(true)
    if (onEdit) onEdit()
  }

  const handleFinishEdit = async () => {
    if (onSaveItems) {
      setSaving(true)
      try {
        await onSaveItems(items)
        setIsEditing(false)
      } finally {
        setSaving(false)
      }
    } else {
      setIsEditing(false)
    }
  }

  const handleApprove = async () => {
    if (onSaveItems) {
      setSaving(true)
      try {
        await onSaveItems(items)
        onApprove?.()
      } finally {
        setSaving(false)
      }
    } else {
      onApprove?.()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 max-w-2xl mx-auto">
      {/* PDF-ähnliches Design */}
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-slate-300 pb-4">
          <div className="flex items-center justify-between mb-3">
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
          {/* Status */}
          <div className="flex items-center gap-2">
            {customerAcceptedAt ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle2 className="w-4 h-4" />
                Unterschrieben
              </span>
            ) : offerSentAt ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                <Mail className="w-4 h-4" />
                An Kunde versendet
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600">
                <FileText className="w-4 h-4" />
                Noch nicht versendet
              </span>
            )}
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
            {loadingCompanyData ? (
              <p className="text-sm text-slate-400">Lade Unternehmerdaten...</p>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-900">{companyData.companyName || "—"}</p>
                {companyData.contactPerson && (
                  <p className="text-sm text-slate-600">{companyData.contactPerson}</p>
                )}
                {companyData.address && (
                  <p className="text-sm text-slate-600">{companyData.address}</p>
                )}
                {(companyData.zip || companyData.city) && (
                  <p className="text-sm text-slate-600">{[companyData.zip, companyData.city].filter(Boolean).join(" ")}</p>
                )}
                {companyData.phone && (
                  <p className="text-sm text-slate-600">{companyData.phone}</p>
                )}
                {companyData.email && (
                  <p className="text-sm text-slate-600">{companyData.email}</p>
                )}
                {!companyData.address && !companyData.zip && !companyData.city && (
                  <p className="text-sm text-slate-400 italic">Adresse nicht hinterlegt</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t border-slate-300 pt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-xs font-semibold text-slate-600 uppercase">Position</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-24">Menge</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-28">Einheit</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-28">Einzelpreis</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-24">Gesamt</th>
                {isEditing && <th className="w-10" />}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 text-sm text-slate-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                        placeholder="Beschreibung"
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-[#B8903A] focus:border-[#B8903A] bg-white"
                      />
                    ) : (
                      item.description
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 0)}
                        className="w-full px-2 py-1.5 text-sm text-right border border-slate-300 rounded focus:ring-2 focus:ring-[#B8903A] focus:border-[#B8903A] bg-white"
                      />
                    ) : (
                      <span className="text-slate-600">{item.quantity}</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUnitChange(item.id, e.target.value)}
                        placeholder="z. B. Stk., Std., m"
                        className="w-full px-2 py-1.5 text-sm text-right border border-slate-300 rounded focus:ring-2 focus:ring-[#B8903A] focus:border-[#B8903A] bg-white"
                      />
                    ) : (
                      <span className="text-slate-600">{item.unit}</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-sm text-right border border-slate-300 rounded focus:ring-2 focus:ring-[#B8903A] focus:border-[#B8903A] bg-white"
                      />
                    ) : (
                      item.unitPrice.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })
                    )}
                  </td>
                  <td className="py-2 text-sm font-semibold text-slate-900 text-right">
                    {item.total.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>
                  {isEditing && (
                    <td className="py-2 pl-1">
                      <button
                        type="button"
                        onClick={() => handleRemovePosition(item.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Position entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {isEditing && (
            <button
              type="button"
              onClick={handleAddPosition}
              className="mt-3 flex items-center gap-2 text-sm font-medium text-[#B8903A] hover:text-[#A67C2A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Position hinzufügen
            </button>
          )}
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
          onClick={isEditing ? handleFinishEdit : handleEdit}
          disabled={saving}
          className="flex-1 py-3 px-4 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Edit2 className="w-5 h-5" />
          <span>{isEditing ? (saving ? "Speichern…" : "Fertig") : "Bearbeiten"}</span>
        </button>
        <button
          onClick={handleApprove}
          disabled={saving}
          className="flex-1 py-3 px-4 bg-[#B8903A] text-slate-900 rounded-lg font-semibold hover:bg-[#A67C2A] transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          <span>{saving ? "Speichern…" : "Angebot freigeben & Senden"}</span>
        </button>
      </div>
    </div>
  )
}

