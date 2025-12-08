"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ProStatus, DamageType } from "@/lib/types/pro"
import { getOrderById } from "@/services/orderService"
import { mapSupabaseOrderToProOrder } from "@/lib/mappers/orderMapper"
import type { ProOrder } from "@/lib/types/pro"
import {
  CarFront,
  SquareStack,
  Waves,
  Flame,
  Building,
  Scale,
  Phone,
  Mail,
  MapPin,
  ClipboardList,
  FileText,
  Receipt,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { OrderWizard } from "@/components/pro/OrderWizard"
import type { WizardData } from "@/components/pro/OrderWizard"
import { QuotePreview } from "@/components/pro/QuotePreview"
import { InternalAssignment } from "@/components/pro/InternalAssignment"
import { ExternalRequest } from "@/components/pro/ExternalRequest"
import { MiniMap } from "@/components/pro/MiniMap"
import { OrderTimeline } from "@/components/pro/OrderTimeline"

const damageTypeIcons: Record<DamageType, typeof CarFront> = {
  KFZ: CarFront,
  GLAS: SquareStack,
  WASSER: Waves,
  FEUER: Flame,
  GEBAEUDE: Building,
  RECHTSFALL: Scale,
}

const damageTypeLabels: Record<DamageType, string> = {
  KFZ: "KFZ",
  GLAS: "Glas",
  WASSER: "Wasser",
  FEUER: "Feuer",
  GEBAEUDE: "Gebäude",
  RECHTSFALL: "Rechtsfall",
}

const statusLabels: Record<ProStatus, string> = {
  NEW: "Neu",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Fertig",
  CANCELLED: "Storniert",
}

const statusColors: Record<ProStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default function ProOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<ProOrder | null>(null)
  const [loading, setLoading] = useState(true)

  const [status, setStatus] = useState<ProStatus>("NEW")
  const [showWizard, setShowWizard] = useState(false)
  const [wizardData, setWizardData] = useState<WizardData | null>(null)
  const [showQuote, setShowQuote] = useState(false)
  const [quoteApproved, setQuoteApproved] = useState(false)
  const [assignedEmployee, setAssignedEmployee] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "invoice" | "protocol">("overview")
  
  // Invoice form state
  const [netAmount, setNetAmount] = useState("")
  const [vatRate, setVatRate] = useState("19")
  const [dueDate, setDueDate] = useState("")
  const [invoiceDescription, setInvoiceDescription] = useState("")

  // Load order from Supabase
  useEffect(() => {
    async function loadOrder() {
      try {
        const supabaseOrder = await getOrderById(orderId)
        if (supabaseOrder) {
          const mappedOrder = mapSupabaseOrderToProOrder(supabaseOrder)
          setOrder(mappedOrder)
          setStatus(mappedOrder.status)
          setInvoiceDescription(mappedOrder.description || "")
          
          // Load wizard data from Supabase order
          if (supabaseOrder.order_wizard_data) {
            setWizardData({
              category_answers: supabaseOrder.order_wizard_data.category_answers,
              photos: supabaseOrder.order_wizard_data.photos,
              voice_note_url: supabaseOrder.order_wizard_data.voice_note_url || undefined,
              internal_notes: supabaseOrder.order_wizard_data.internal_notes || undefined,
            })
          }
        }
      } catch (error) {
        console.error("Failed to load order:", error)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [orderId])

  // Mock employees - in production, this would come from API
  const employees = [
    { id: "emp-1", name: "Anna Schmidt", role: "Maler" },
    { id: "emp-2", name: "Tom Weber", role: "Sanitär" },
    { id: "emp-3", name: "Lisa Müller", role: "Elektriker" },
    { id: "emp-4", name: "Jan Becker", role: "Tischler" },
  ]


  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280]">Auftrag nicht gefunden</p>
        <Link href="/pro/orders">
          <Button className="mt-4">Zurück zur Übersicht</Button>
        </Link>
      </div>
    )
  }

  const Icon = damageTypeIcons[order.damageType]
  const iconColor = order.damageType === "KFZ" ? "text-[#FFD700]" : "text-blue-500"

  const handleWizardComplete = (data: WizardData) => {
    setWizardData(data)
  }

  const handleQuoteApprove = async () => {
    if (!wizardData || !order) return
    setQuoteApproved(true)
    // In production: Generate PDF, send email, save to system
  }

  // Show quote split-screen if wizard data exists and quote is requested
  if (showQuote && wizardData) {
    return (
      <>
        {showWizard && order && (
          <OrderWizard
            orderId={order.id}
            damageType={order.damageType}
            onComplete={handleWizardComplete}
            onClose={() => setShowWizard(false)}
          />
        )}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-semibold text-slate-900">Auftrag #{order.id}</h1>
              <Button variant="outline" onClick={() => setShowQuote(false)}>
                Zurück
              </Button>
            </div>
            <div className="pro-card">
              <OrderTimeline
                orderCreatedAt={order.createdAt}
                wizardData={wizardData}
                status={status}
              />
            </div>
          </div>
          <div className="sticky top-20">
            <QuotePreview
              orderId={order.id}
              customerName={order.customerName}
              customerAddress={order.customerAddress || `${order.zip} ${order.city}`}
              wizardData={wizardData}
              onEdit={() => {}}
              onApprove={handleQuoteApprove}
            />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {showWizard && order && (
        <OrderWizard
          orderId={order.id}
          damageType={order.damageType}
          onComplete={handleWizardComplete}
          onClose={() => setShowWizard(false)}
        />
      )}

      {/* Mobile: Compact Layout */}
      <div className="lg:hidden space-y-4">
        <Link href="/pro/orders" className="text-sm text-slate-500 inline-block">
          ← Zurück
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Auftrag #{order.id}</h1>
        {/* Mobile content - simplified */}
        <div className="pro-card p-4">
          <p className="text-sm text-slate-600">Mobile Ansicht - Bitte Desktop verwenden für vollständige Ansicht</p>
        </div>
      </div>

      {/* Desktop: 3-Column Mission Control Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-0 min-h-screen">
        {/* LEFT COLUMN: Der Lead (25% = 3 columns) */}
        <div className="lg:col-span-3 bg-slate-100 p-6 space-y-6 overflow-y-auto">
          {/* Customer Section */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Kunde</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Name</p>
                <p className="text-base font-semibold text-slate-900">{order.customerName}</p>
              </div>
              {order.customerPhone && (
                <a
                  href={`tel:${order.customerPhone}`}
                  className="flex items-center space-x-2 text-sm text-slate-700 hover:text-[#D4AF37] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{order.customerPhone}</span>
                </a>
              )}
              {order.customerEmail && (
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="flex items-center space-x-2 text-sm text-slate-700 hover:text-[#D4AF37] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{order.customerEmail}</span>
                </a>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-2">Adresse</p>
                <p className="text-sm text-slate-900">{order.customerAddress || "Nicht angegeben"}</p>
                <p className="text-sm text-slate-600">
                  {order.zip} {order.city}
                </p>
              </div>
              {/* Mini Map */}
              {order.customerAddress && (
                <div className="mt-4">
                  <MiniMap
                    address={order.customerAddress}
                    zip={order.zip}
                    city={order.city}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Origin Section */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Ursprung</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Icon className={`w-5 h-5 ${iconColor}`} />
                <span className="text-sm font-medium text-slate-900">
                  {damageTypeLabels[order.damageType]}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Schadenbeschreibung</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {order.description}
                </p>
              </div>
              {order.photos && order.photos.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Erst-Fotos ({order.photos.length})</p>
                  <div className="grid grid-cols-2 gap-2">
                    {order.photos.slice(0, 4).map((photo, idx) => (
                      <div
                        key={idx}
                        className="aspect-square bg-slate-200 rounded-lg overflow-hidden"
                      >
                        <span className="text-xs text-slate-400 p-2">Foto {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Section */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Status</h2>
            <span
              className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${statusColors[status]}`}
            >
              {statusLabels[status]}
            </span>
          </div>
        </div>

        {/* MIDDLE COLUMN: Die Baustelle (50% = 6 columns) */}
        <div className="lg:col-span-6 bg-white p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Auftrag #{order.id}</h1>
              <p className="text-sm text-slate-500 mt-1">Die Baustelle</p>
            </div>
            <Link href="/pro/orders">
              <Button variant="outline">Zurück</Button>
            </Link>
          </div>

          {/* Timeline */}
          <OrderTimeline
            orderCreatedAt={order.createdAt}
            wizardData={wizardData}
            status={status}
          />

          {/* Mobile Wizard Button */}
          <div className="lg:hidden">
            <Button
              onClick={() => setShowWizard(true)}
              className="w-full bg-[#D4AF37] text-slate-900 hover:bg-[#B8941F]"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Vor-Ort-Assistent starten
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Aktionen mit Tabs (25% = 3 columns) */}
        <div className="lg:col-span-3 bg-white border-l border-slate-200 flex flex-col sticky top-0 h-screen">
          {/* Tabs */}
          <div className="border-b border-slate-200 flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "text-slate-900 border-b-2 border-[#D4AF37] bg-slate-50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab("invoice")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "invoice"
                  ? "text-slate-900 border-b-2 border-[#D4AF37] bg-slate-50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Receipt className="w-4 h-4 inline mr-2" />
              Angebot/Rechnung
            </button>
            <button
              onClick={() => setActiveTab("protocol")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "protocol"
                  ? "text-slate-900 border-b-2 border-[#D4AF37] bg-slate-50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Protokoll
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "overview" && (
              <>
                {/* Status Select */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Status</label>
                  <Select value={status} onValueChange={(value) => setStatus(value as ProStatus)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Internal Assignment */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Intern</h3>
                  <InternalAssignment
                    employees={employees}
                    currentAssignment={assignedEmployee}
                    onAssign={async (employeeId) => {
                      await new Promise((resolve) => setTimeout(resolve, 1000))
                      setAssignedEmployee(employeeId)
                      console.log(`Order ${order.id} assigned to employee ${employeeId}`)
                    }}
                  />
                </div>

                {/* External Request */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Extern</h3>
                  <ExternalRequest
                    onRequest={async (trade, urgency, date) => {
                      await new Promise((resolve) => setTimeout(resolve, 1500))
                      console.log(`External request: ${trade}, urgency: ${urgency}, date: ${date}`)
                    }}
                  />
                </div>
              </>
            )}

            {activeTab === "invoice" && (
              <div className="space-y-4">
                {wizardData ? (
                  <>
                    <QuotePreview
                      orderId={order.id}
                      customerName={order.customerName}
                      customerAddress={order.customerAddress || `${order.zip} ${order.city}`}
                      wizardData={wizardData}
                      onEdit={() => {}}
                      onApprove={handleQuoteApprove}
                    />
                    <div className="pt-4 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Rechnung erstellen</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-2">Leistungsbeschreibung</label>
                          <Textarea
                            value={invoiceDescription}
                            onChange={(e) => setInvoiceDescription(e.target.value)}
                            rows={3}
                            className="bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-700 block mb-2">Netto (€)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={netAmount}
                              onChange={(e) => setNetAmount(e.target.value)}
                              placeholder="0.00"
                              className="bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700 block mb-2">MwSt (%)</label>
                            <Select value={vatRate} onValueChange={setVatRate}>
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0%</SelectItem>
                                <SelectItem value="7">7%</SelectItem>
                                <SelectItem value="19">19%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Netto:</span>
                            <span className="font-medium">{netAmount || "0.00"} €</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">MwSt ({vatRate}%):</span>
                            <span className="font-medium">
                              {netAmount && vatRate
                                ? (parseFloat(netAmount) * (parseFloat(vatRate) / 100)).toFixed(2)
                                : "0.00"}{" "}
                              €
                            </span>
                          </div>
                          <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200">
                            <span>Gesamt:</span>
                            <span className="text-[#D4AF37]">
                              {netAmount && vatRate
                                ? (parseFloat(netAmount) * (1 + parseFloat(vatRate) / 100)).toFixed(2)
                                : "0.00"}{" "}
                              €
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-2">Zahlungsziel</label>
                          <Input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <Button
                          onClick={() => {
                            // Generate PDF and send
                            alert("PDF generiert und gesendet!")
                          }}
                          className="w-full bg-[#D4AF37] text-slate-900 hover:bg-[#B8941F]"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          PDF generieren & Senden
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">Bitte zuerst Vor-Ort-Daten erfassen</p>
                    <Button
                      onClick={() => setShowWizard(true)}
                      className="bg-[#D4AF37] text-slate-900 hover:bg-[#B8941F]"
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Vor-Ort-Assistent starten
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "protocol" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Protokoll-Ansicht - Coming Soon</p>
                {/* Hier könnte später ein Protokoll/Log angezeigt werden */}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
