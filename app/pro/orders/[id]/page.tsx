"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ProStatus, DamageType } from "@/lib/types/pro"
import { getOrderById } from "@/services/orderService"
import { mapSupabaseOrderToProOrder } from "@/lib/mappers/orderMapper"
import type { ProOrder } from "@/lib/types/pro"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { getOrderById as getMockOrderById, mockProfile } from "@/lib/mock/proData"
import { supabase } from "@/lib/supabase"
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
  Check,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const { isDemoMode } = useDemoMode()
  const orderId = params.id as string
  const [order, setOrder] = useState<ProOrder | null>(null)
  const [loading, setLoading] = useState(true)

  const [status, setStatus] = useState<ProStatus>("NEW")
  const [showWizard, setShowWizard] = useState(false)
  const [wizardData, setWizardData] = useState<WizardData | null>(null)
  const [showQuote, setShowQuote] = useState(false)
  const [quoteApproved, setQuoteApproved] = useState(false)
  const [assignedEmployee, setAssignedEmployee] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "quote" | "invoice" | "protocol">("overview")
  
  // Invoice form state (Positionen wie im KVA)
  type InvoiceItem = { id: string; description: string; quantity: number; unit: string; unitPrice: number; total: number }
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [vatRate, setVatRate] = useState("19")
  const [dueDate, setDueDate] = useState("")
  const [quoteItems, setQuoteItems] = useState<InvoiceItem[] | null>(null)
  const [quoteOfferSentAt, setQuoteOfferSentAt] = useState<string | null>(null)
  const [quoteCustomerAcceptedAt, setQuoteCustomerAcceptedAt] = useState<string | null>(null)
  const [offerUrl, setOfferUrl] = useState<string | null>(null)
  const [offerJustSent, setOfferJustSent] = useState(false)
  const [invoiceFilledFromQuote, setInvoiceFilledFromQuote] = useState(false)
  const [orderInvoices, setOrderInvoices] = useState<{ id: string; status: string; gross_amount?: number; created_at?: string }[]>([])
  const [invoiceCreating, setInvoiceCreating] = useState(false)
  const [invoiceMessage, setInvoiceMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null)

  type CompanyData = {
    companyName?: string
    contactPerson?: string
    address?: string
    zip?: string
    city?: string
    phone?: string
    email?: string
    iban?: string
    accountHolder?: string
    taxId?: string
  }
  const [companyData, setCompanyData] = useState<CompanyData>({})

  // Load company data (pro profile) for "Von" / invoice footer
  useEffect(() => {
    async function loadCompany() {
      if (isDemoMode) {
        setCompanyData({
          companyName: mockProfile.companyName ?? "",
          contactPerson: mockProfile.contactPerson ?? "",
          address: mockProfile.address ?? "",
          zip: mockProfile.zip ?? "",
          city: mockProfile.city ?? "",
          phone: mockProfile.phone ?? "",
          email: mockProfile.email ?? "",
          iban: mockProfile.iban ?? "",
          accountHolder: mockProfile.accountHolder ?? "",
          taxId: mockProfile.taxId ?? "",
        })
        return
      }
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setCompanyData({})
          return
        }
        const { data: profileData } = await supabase
          .from("profiles")
          .select("company_name, contact_person, address, zip, city, phone, email, iban, account_holder, tax_id")
          .eq("id", user.id)
          .maybeSingle()
        const p = profileData as Record<string, unknown> | null
        setCompanyData({
          companyName: (p?.company_name as string) ?? "",
          contactPerson: (p?.contact_person as string) ?? "",
          address: (p?.address as string) ?? "",
          zip: (p?.zip as string) ?? "",
          city: (p?.city as string) ?? "",
          phone: (p?.phone as string) ?? "",
          email: (p?.email as string) ?? "",
          iban: (p?.iban as string) ?? "",
          accountHolder: (p?.account_holder as string) ?? "",
          taxId: (p?.tax_id as string) ?? "",
        })
      } catch {
        setCompanyData({})
      }
    }
    loadCompany()
  }, [isDemoMode])

  // Load order and quote from API
  useEffect(() => {
    async function loadOrder() {
      try {
        if (isDemoMode) {
          const mockOrder = getMockOrderById(orderId)
          if (mockOrder) {
            setOrder(mockOrder)
            setStatus(mockOrder.status)
            if (mockOrder.photos && mockOrder.photos.length > 0) {
              setWizardData({ photos: mockOrder.photos })
            }
          }
          setQuoteItems(null)
          setOrderInvoices([])
          setInvoiceFilledFromQuote(false)
        } else {
          const supabaseOrder = await getOrderById(orderId)
          if (supabaseOrder) {
            const mappedOrder = mapSupabaseOrderToProOrder(supabaseOrder)
            setOrder(mappedOrder)
            setStatus(mappedOrder.status)
            if (supabaseOrder.order_wizard_data) {
              setWizardData({ photos: supabaseOrder.order_wizard_data.photos || [] })
            }
          }
          const { data: sessionData } = await supabase.auth.getSession()
          const token = sessionData.session?.access_token
          const quoteRes = await fetch(`/api/pro/orders/${orderId}/quote`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          const quoteData = await quoteRes.json()
          if (quoteData?.success && quoteData?.quote) {
            if (quoteData.quote.items?.length) setQuoteItems(quoteData.quote.items)
            else setQuoteItems(null)
            setQuoteOfferSentAt(quoteData.quote.offerSentAt ?? null)
            setQuoteCustomerAcceptedAt(quoteData.quote.customerAcceptedAt ?? null)
            if (quoteData.quote.offerToken) {
              const base = typeof window !== "undefined" ? window.location.origin : ""
              setOfferUrl(base ? `${base}/offer/${encodeURIComponent(quoteData.quote.offerToken)}` : null)
            } else setOfferUrl(null)
          } else {
            setQuoteItems(null)
            setQuoteOfferSentAt(null)
            setQuoteCustomerAcceptedAt(null)
            setOfferUrl(null)
            setInvoiceFilledFromQuote(false)
          }
          const invRes = await fetch("/api/pro/invoices", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
          const invData = await invRes.json()
          if (invData?.success && Array.isArray(invData.invoices)) {
            setOrderInvoices(
              (invData.invoices as any[])
                .filter((i: any) => i.order_id === orderId)
                .map((i: any) => ({ id: i.id, status: i.status, gross_amount: i.gross_amount, created_at: i.created_at }))
            )
          } else setOrderInvoices([])
        }
      } catch (error) {
        console.error("Failed to load order:", error)
        if (!isDemoMode) {
          const mockOrder = getMockOrderById(orderId)
          if (mockOrder) {
            setOrder(mockOrder)
            setStatus(mockOrder.status)
          }
          setQuoteItems(null)
          setOrderInvoices([])
          setInvoiceFilledFromQuote(false)
        }
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [orderId, isDemoMode])

  // Rechnung aus KVA vorausfüllen (einmalig wenn KVA-Daten da sind)
  useEffect(() => {
    if (isDemoMode || invoiceFilledFromQuote || !quoteItems || quoteItems.length === 0) return
    setInvoiceItems(quoteItems.map((i) => ({ ...i, id: i.id || `inv-${Math.random().toString(36).slice(2, 9)}` })))
    setInvoiceFilledFromQuote(true)
  }, [quoteItems, isDemoMode, invoiceFilledFromQuote])

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
  const iconColor = order.damageType === "KFZ" ? "text-[#B8903A]" : "text-blue-500"

  const handleWizardComplete = (data: WizardData) => {
    setWizardData(data)
  }

  const handleSaveQuoteItems = async (items: { id: string; description: string; quantity: number; unit: string; unitPrice: number; total: number }[]) => {
    if (isDemoMode || !order) return
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const res = await fetch(`/api/pro/orders/${order.id}/quote`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ items }),
    })
    const data = await res.json()
    if (data?.success) {
      setQuoteItems(items)
      return
    }
    alert(data?.error ?? "Speichern fehlgeschlagen")
    throw new Error(data?.error ?? "Speichern fehlgeschlagen")
  }

  const handleQuoteApprove = async () => {
    if (!order || isDemoMode) return
    setQuoteApproved(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch(`/api/pro/orders/${order.id}/quote/send`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (data?.success && data?.offerUrl) {
        setOfferUrl(data.offerUrl)
        setQuoteOfferSentAt(data.offerSentAt ?? new Date().toISOString())
        setOfferJustSent(true)
        setTimeout(() => setOfferJustSent(false), 8000)
      }
      if (!data?.success) {
        setQuoteApproved(false)
        alert(data?.error ?? "Angebot konnte nicht freigegeben werden.")
      }
    } catch (e) {
      console.error("Quote send error:", e)
      setQuoteApproved(false)
      alert("Angebot konnte nicht freigegeben werden.")
    }
  }

  const invoiceNetTotal = invoiceItems.reduce((s, i) => s + i.total, 0)
  const invoiceVatAmount = (invoiceNetTotal * (parseInt(vatRate, 10) || 0)) / 100
  const invoiceGrossTotal = invoiceNetTotal + invoiceVatAmount

  const handleInvoiceItemChange = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        const next = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          const q = field === "quantity" ? (value as number) : item.quantity
          const p = field === "unitPrice" ? (value as number) : item.unitPrice
          next.total = Math.max(0, q) * Math.max(0, p)
        }
        return next
      })
    )
  }
  const handleAddInvoicePosition = () => {
    setInvoiceItems((prev) => [
      ...prev,
      { id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, description: "Neue Position", quantity: 1, unit: "Stk.", unitPrice: 0, total: 0 },
    ])
  }
  const handleRemoveInvoicePosition = (itemId: string) => {
    setInvoiceItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const handleCreateInvoice = async () => {
    if (!order || isDemoMode) return
    if (invoiceItems.length === 0 || invoiceNetTotal <= 0) {
      setInvoiceMessage({ type: "error", text: "Bitte mindestens eine Position mit Betrag anlegen." })
      return
    }
    setInvoiceCreating(true)
    setInvoiceMessage(null)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const description = invoiceItems.map((i) => `${i.description} (${i.quantity} ${i.unit})`).join("; ")
      const res = await fetch("/api/pro/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          order_id: order.id,
          net_amount: invoiceNetTotal,
          vat_rate: parseInt(vatRate, 10) || 19,
          description: description || null,
          due_date: dueDate || null,
        }),
      })
      const data = await res.json()
      if (data?.success) {
        setInvoiceMessage({ type: "success", text: "Rechnung erstellt. Sie erscheint im Rechnungscenter." })
        if (data.invoice?.id) setOrderInvoices((prev) => [...prev, { id: data.invoice.id, status: data.invoice.status ?? "draft", gross_amount: data.invoice.gross_amount, created_at: data.invoice.created_at }])
      } else {
        setInvoiceMessage({ type: "error", text: data?.error ?? "Rechnung konnte nicht erstellt werden." })
      }
    } catch (e) {
      setInvoiceMessage({ type: "error", text: "Fehler beim Erstellen der Rechnung." })
    } finally {
      setInvoiceCreating(false)
    }
  }

  const handleMarkInvoicePaid = async (invoiceId: string) => {
    if (isDemoMode || !order) return
    setMarkingPaidId(invoiceId)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch(`/api/pro/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: "paid" }),
      })
      const data = await res.json()
      if (data?.success) {
        setOrderInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "paid" } : inv)))
      } else alert(data?.error ?? "Status konnte nicht aktualisiert werden.")
    } catch (e) {
      alert("Fehler beim Markieren als bezahlt.")
    } finally {
      setMarkingPaidId(null)
    }
  }

  // Read-only Schritt-Anzeige aus Order + Quote + Rechnungen (kein manueller Status mehr)
  const getStepLabel = (): string => {
    if (status === "CANCELLED") return "Storniert"
    if (orderInvoices.some((inv) => inv.status === "paid")) return "Abgeschlossen"
    if (orderInvoices.length > 0) return "Rechnung erstellt"
    if (quoteCustomerAcceptedAt) return "Vom Kunden angenommen"
    if (quoteOfferSentAt) return "KVA versendet"
    if (status === "IN_PROGRESS") return "In Bearbeitung"
    if (status === "DONE") return "Abgeschlossen"
    return "Neu"
  }
  const stepLabel = getStepLabel()
  const stepBadgeColor =
    stepLabel === "Storniert"
      ? "bg-red-100 text-red-800"
      : stepLabel === "Abgeschlossen" || stepLabel === "Rechnung erstellt"
        ? "bg-green-100 text-green-800"
        : stepLabel === "Vom Kunden angenommen" || stepLabel === "KVA versendet"
          ? "bg-amber-100 text-amber-800"
          : stepLabel === "In Bearbeitung"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-blue-100 text-blue-800"

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
                quoteOfferSentAt={quoteOfferSentAt}
                quoteCustomerAcceptedAt={quoteCustomerAcceptedAt}
                orderInvoices={orderInvoices}
              />
            </div>
          </div>
          <div className="sticky top-20">
            <QuotePreview
              orderId={order.id}
              customerName={order.customerName}
              customerAddress={order.customerAddress || `${order.zip} ${order.city}`}
              wizardData={wizardData}
              initialItems={quoteItems}
              offerSentAt={quoteOfferSentAt}
              customerAcceptedAt={quoteCustomerAcceptedAt}
              onSaveItems={isDemoMode ? undefined : handleSaveQuoteItems}
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
      <div className="lg:hidden space-y-4 pb-24">
        <Link href="/pro/orders" className="text-sm text-slate-500 inline-block">
          ← Zurück
        </Link>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Auftrag #{order.id.slice(0, 8)}</h1>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${stepBadgeColor}`}>
              {stepLabel}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Customer Info */}
        <div className="pro-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase">Kunde</h2>
          <div>
            <p className="text-base font-semibold text-slate-900">{order.customerName}</p>
            {order.customerPhone && (
              <a href={`tel:${order.customerPhone}`} className="flex items-center space-x-2 text-sm text-slate-600 mt-1">
                <Phone className="w-4 h-4" />
                <span>{order.customerPhone}</span>
              </a>
            )}
            {order.customerEmail && (
              <a href={`mailto:${order.customerEmail}`} className="flex items-center space-x-2 text-sm text-slate-600 mt-1">
                <Mail className="w-4 h-4" />
                <span className="truncate">{order.customerEmail}</span>
              </a>
            )}
            <div className="flex items-center space-x-2 text-sm text-slate-600 mt-2">
              <MapPin className="w-4 h-4" />
              <span>{order.zip} {order.city}</span>
            </div>
            {order.customerAddress && (
              <p className="text-sm text-slate-600 mt-1">{order.customerAddress}</p>
            )}
          </div>
        </div>

        {/* Damage Info */}
        <div className="pro-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase">Schaden</h2>
          <div>
            <p className="text-sm font-medium text-slate-900 mb-2">{damageTypeLabels[order.damageType]}</p>
            {order.description && (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.description}</p>
            )}
          </div>
          {order.photos && order.photos.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Fotos ({order.photos.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {order.photos.slice(0, 6).map((photo, idx) => (
                  <div key={idx} className="aspect-square bg-slate-200 rounded-lg overflow-hidden">
                    <span className="text-xs text-slate-400 p-1">Foto {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        {wizardData && (
          <div className="pro-card p-4">
            <OrderTimeline
              orderCreatedAt={order.createdAt}
              wizardData={wizardData}
              status={status}
              quoteOfferSentAt={quoteOfferSentAt}
              quoteCustomerAcceptedAt={quoteCustomerAcceptedAt}
              orderInvoices={orderInvoices}
            />
          </div>
        )}

        {/* Actions */}
        <div className="pro-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase">Aktionen</h2>
          <div className="space-y-2">
            {/* Annehmen: anzeigen wenn Auftrag noch „neu“ ist (statusDb), unabhängig von assigned_to */}
            {(order.statusDb === "neu" || (order.status === "NEW" && !order.assigned_to)) && (
              <Button
                onClick={async () => {
                  try {
                    const { data: sessionData } = await supabase.auth.getSession()
                    const token = sessionData.session?.access_token
                    
                    const res = await fetch(`/api/pro/orders/${order.id}/accept`, {
                      method: "POST",
                      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                    })
                    const data = await res.json()
                    if (data.success) {
                      // Reload page to show updated status
                      window.location.reload()
                    } else {
                      alert(data.error || "Fehler beim Annehmen des Auftrags")
                    }
                  } catch (error) {
                    console.error("Error accepting order:", error)
                    alert("Fehler beim Annehmen des Auftrags")
                  }
                }}
                className="w-full bg-[#B8903A] text-white hover:bg-[#A67C2A]"
              >
                <Check className="w-4 h-4 mr-2" />
                Auftrag annehmen
              </Button>
            )}
            <Button
              onClick={() => setShowWizard(true)}
              className="w-full bg-[#B8903A] text-white hover:bg-[#A67C2A]"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Vor-Ort-Assistent starten
            </Button>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Schritt</p>
              <p className={`text-sm font-medium ${stepLabel === "Abgeschlossen" || stepLabel === "Rechnung erstellt" ? "text-green-700" : stepLabel === "Storniert" ? "text-red-700" : "text-slate-900"}`}>
                {stepLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Quote Preview if wizard data exists */}
        {wizardData && (
          <div className="pro-card p-4">
            <QuotePreview
              orderId={order.id}
              customerName={order.customerName}
              customerAddress={order.customerAddress || `${order.zip} ${order.city}`}
              wizardData={wizardData}
              initialItems={quoteItems}
              offerSentAt={quoteOfferSentAt}
              customerAcceptedAt={quoteCustomerAcceptedAt}
              onSaveItems={isDemoMode ? undefined : handleSaveQuoteItems}
              onApprove={handleQuoteApprove}
            />
          </div>
        )}
      </div>

      {/* Desktop: volle Breite und Höhe – Sidebar gibt genug Rand */}
      <div className="hidden lg:flex lg:flex-col w-full min-h-[calc(100vh-8rem)]">
        <div className="grid flex-1 lg:grid-cols-12 gap-0 min-h-0 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {/* LEFT COLUMN: Tabs und Hauptinhalt (9 cols) */}
        <div className="lg:col-span-9 bg-white flex flex-col border-r border-slate-200 min-h-0">
          {/* Tabs */}
          <div className="border-b border-slate-200 flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "text-slate-900 border-b-2 border-[#B8903A] bg-slate-50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab("quote")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "quote"
                  ? "text-slate-900 border-b-2 border-[#B8903A] bg-slate-50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Angebot
            </button>
            <button
              onClick={() => setActiveTab("invoice")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "invoice"
                  ? "text-slate-900 border-b-2 border-[#B8903A] bg-slate-50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Receipt className="w-4 h-4 inline mr-2" />
              Rechnung
            </button>
            <button
              onClick={() => setActiveTab("protocol")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "protocol"
                  ? "text-slate-900 border-b-2 border-[#B8903A] bg-slate-50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Protokoll
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Linke Spalte: nur Intern (Automatisch zuweisen / Manuell zuweisen) */}
                <div className="space-y-4">
                  {(order.statusDb === "neu" || (order.status === "NEW" && !order.assigned_to)) && (
                    <Button
                      onClick={async () => {
                        try {
                          const { data: sessionData } = await supabase.auth.getSession()
                          const token = sessionData.session?.access_token
                          const res = await fetch(`/api/pro/orders/${order.id}/accept`, {
                            method: "POST",
                            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                          })
                          const data = await res.json()
                          if (data.success) window.location.reload()
                          else alert(data.error || "Fehler beim Annehmen des Auftrags")
                        } catch (error) {
                          console.error("Error accepting order:", error)
                          alert("Fehler beim Annehmen des Auftrags")
                        }
                      }}
                      className="w-full bg-[#B8903A] text-white hover:bg-[#A67C2A]"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Auftrag annehmen
                    </Button>
                  )}
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
                      onAutoAssign={async () => {
                        if (employees.length > 0) {
                          await new Promise((resolve) => setTimeout(resolve, 1000))
                          setAssignedEmployee(employees[0].id)
                          console.log(`Order ${order.id} auto-assigned to ${employees[0].name}`)
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Rechte Spalte der Übersicht: Kunde, Ursprung, Status */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xs font-semibold text-slate-500 uppercase mb-2">Kunde</h2>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Name</p>
                        <p className="text-sm font-semibold text-slate-900">{order.customerName}</p>
                      </div>
                      {order.customerPhone && (
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="flex items-center space-x-2 text-sm text-slate-700 hover:text-[#B8903A] transition-colors"
                        >
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{order.customerPhone}</span>
                        </a>
                      )}
                      {order.customerEmail && (
                        <a
                          href={`mailto:${order.customerEmail}`}
                          className="flex items-center space-x-2 text-sm text-slate-700 hover:text-[#B8903A] transition-colors break-all"
                        >
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span>{order.customerEmail}</span>
                        </a>
                      )}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Adresse</p>
                        <p className="text-sm text-slate-900">
                          {order.customerAddress || [order.zip, order.city].filter(Boolean).join(" ").trim() || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-slate-500 uppercase mb-2">Ursprung</h2>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
                        <span className="text-sm font-medium text-slate-900">
                          {damageTypeLabels[order.damageType]}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Schadenbeschreibung</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {order.description || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-slate-500 uppercase mb-2">Schritt</h2>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${stepBadgeColor}`}>
                      {stepLabel}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "quote" && (
              <div className="space-y-4">
                {wizardData ? (
                  <>
                    <QuotePreview
                      orderId={order.id}
                      customerName={order.customerName}
                      customerAddress={order.customerAddress || `${order.zip} ${order.city}`}
                      wizardData={wizardData}
                      initialItems={quoteItems}
                      offerSentAt={quoteOfferSentAt}
                      customerAcceptedAt={quoteCustomerAcceptedAt}
                      onSaveItems={isDemoMode ? undefined : handleSaveQuoteItems}
                      onApprove={handleQuoteApprove}
                    />
                    {!isDemoMode && (
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                          <h3 className="text-base font-bold text-slate-900">Angebot an Kunden senden</h3>
                          <p className="text-sm text-slate-500 mt-0.5">So kommt der Kunde zur Angebotsseite und kann annehmen</p>
                        </div>
                        <div className="p-6 space-y-4">
                          {offerJustSent && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                              <Check className="w-5 h-5 flex-shrink-0" />
                              <span><strong>Link erstellt.</strong> Teilen Sie den Link unten mit Ihrem Kunden (z. B. per E-Mail oder WhatsApp). Der Kunde öffnet den Link und kann das Angebot annehmen.</span>
                            </div>
                          )}
                          {offerUrl ? (
                            <>
                              <p className="text-sm text-slate-700">Kunden-Link (diesen Link an den Kunden senden):</p>
                              <div className="flex gap-2 items-center flex-wrap">
                                <input readOnly value={offerUrl} className="flex-1 min-w-0 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 font-mono" />
                                <Button type="button" variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(offerUrl); }}>Kopieren</Button>
                                <a href={offerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#B8903A] text-slate-900 rounded-lg font-semibold text-sm hover:bg-[#A67C2A] transition-colors">
                                  Als Kunde testen (öffnet Kundenansicht)
                                </a>
                              </div>
                              <p className="text-xs text-slate-500">Der Kunde öffnet diesen Link, sieht das Angebot, bestätigt AGB/Datenschutz, unterschreibt und klickt auf „Kostenpflichtig beauftragen“. Danach ist der Auftrag angenommen.</p>
                            </>
                          ) : (
                            <>
                              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                                <li>Kostenvoranschlag oben prüfen und ggf. <strong>Bearbeiten</strong> nutzen.</li>
                                <li>Auf <strong>„Angebot freigeben & Senden“</strong> klicken – dann erscheint hier der Kunden-Link.</li>
                                <li>Link <strong>kopieren</strong> und per E-Mail oder WhatsApp an den Kunden senden.</li>
                                <li>Kunde öffnet den Link, sieht das Angebot und kann es annehmen (Unterschrift + Bestätigung).</li>
                              </ol>
                              <p className="text-sm text-slate-600">Noch kein Link? Klicken Sie oben im Kasten auf <strong>„Angebot freigeben & Senden“</strong>.</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">Bitte zuerst Vor-Ort-Daten erfassen</p>
                    <Button
                      onClick={() => setShowWizard(true)}
                      className="bg-[#B8903A] text-slate-900 hover:bg-[#A67C2A]"
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Vor-Ort-Assistent starten
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "invoice" && (
              <div className="space-y-4">
                {/* Rechnung – gleiches Layout wie Kostenvoranschlag */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 max-w-2xl">
                  <div className="space-y-6">
                    {quoteItems && quoteItems.length > 0 && (
                      <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        Vorausgefüllt aus dem Kostenvoranschlag. Alle Angaben können Sie anpassen.
                      </p>
                    )}
                    <div className="border-b border-slate-300 pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">Rechnung</h2>
                          <p className="text-sm text-slate-500 mt-1">Auftrag: {order.id.slice(0, 8)}…</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Datum</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {new Date().toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">An</p>
                        <p className="text-sm font-medium text-slate-900">{order.customerName}</p>
                        <p className="text-sm text-slate-600">{order.customerAddress || `${order.zip} ${order.city}`}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Von</p>
                        <p className="text-sm font-medium text-slate-900">{companyData.companyName || "Ihr Handwerksbetrieb"}</p>
                        {companyData.contactPerson && <p className="text-sm text-slate-600">{companyData.contactPerson}</p>}
                        {companyData.address && <p className="text-sm text-slate-600">{companyData.address}</p>}
                        {(companyData.zip || companyData.city) && (
                          <p className="text-sm text-slate-600">{[companyData.zip, companyData.city].filter(Boolean).join(" ")}</p>
                        )}
                        {companyData.phone && <p className="text-sm text-slate-600">{companyData.phone}</p>}
                        {companyData.email && <p className="text-sm text-slate-600">{companyData.email}</p>}
                      </div>
                    </div>
                    {/* Positionen-Tabelle wie im KVA */}
                    <div className="border-t border-slate-300 pt-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 text-xs font-semibold text-slate-600 uppercase">Position</th>
                            <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-24">Menge</th>
                            <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-28">Einheit</th>
                            <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-28">Einzelpreis</th>
                            <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-24">Gesamt</th>
                            <th className="w-10" />
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceItems.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100">
                              <td className="py-2">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleInvoiceItemChange(item.id, "description", e.target.value)}
                                  placeholder="Beschreibung"
                                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-[#B8903A] focus:border-[#B8903A] bg-white"
                                />
                              </td>
                              <td className="py-2 text-right">
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={item.quantity}
                                  onChange={(e) => handleInvoiceItemChange(item.id, "quantity", parseInt(e.target.value, 10) || 0)}
                                  className="w-full px-2 py-1.5 text-sm text-right border border-slate-300 rounded focus:ring-2 focus:ring-[#B8903A] focus:border-[#B8903A] bg-white"
                                />
                              </td>
                              <td className="py-2 text-right">
                                <input
                                  type="text"
                                  value={item.unit}
                                  onChange={(e) => handleInvoiceItemChange(item.id, "unit", e.target.value)}
                                  placeholder="z. B. Stk., Std., m"
                                  className="w-full px-2 py-1.5 text-sm text-right border border-slate-300 rounded focus:ring-2 focus:ring-[#B8903A] focus:border-[#B8903A] bg-white"
                                />
                              </td>
                              <td className="py-2 text-right">
                                <input
                                  type="number"
                                  step={0.01}
                                  min={0}
                                  value={item.unitPrice}
                                  onChange={(e) => handleInvoiceItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1.5 text-sm text-right border border-slate-300 rounded focus:ring-2 focus:ring-[#B8903A] focus:border-[#B8903A] bg-white"
                                />
                              </td>
                              <td className="py-2 text-sm font-semibold text-slate-900 text-right">
                                {item.total.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                              </td>
                              <td className="py-2 pl-1">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInvoicePosition(item.id)}
                                  className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Position entfernen"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button
                        type="button"
                        onClick={handleAddInvoicePosition}
                        className="mt-3 flex items-center gap-2 text-sm font-medium text-[#B8903A] hover:text-[#A67C2A] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Position hinzufügen
                      </button>
                    </div>
                    <div className="border-t border-slate-300 pt-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">MwSt (%)</label>
                          <Select value={vatRate} onValueChange={setVatRate}>
                            <SelectTrigger className="bg-white border-slate-200">
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
                      <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Nettobetrag</span>
                            <span className="font-medium text-slate-900">
                              {invoiceNetTotal.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">MwSt. ({vatRate}%)</span>
                            <span className="font-medium text-slate-900">
                              {invoiceVatAmount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-300">
                            <span className="font-bold text-slate-900">Gesamtbetrag</span>
                            <span className="font-bold text-lg text-slate-900">
                              {invoiceGrossTotal.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Zahlungsziel</label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="bg-white border-slate-200 max-w-[200px]"
                      />
                    </div>
                    {invoiceMessage && (
                      <p className={`text-sm ${invoiceMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                        {invoiceMessage.text}
                      </p>
                    )}
                    <div className="border-t border-slate-200 pt-6">
                      <Button
                        onClick={handleCreateInvoice}
                        disabled={invoiceCreating}
                        className="w-full py-3 bg-[#B8903A] text-slate-900 hover:bg-[#A67C2A] disabled:opacity-50 font-semibold"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        {invoiceCreating ? "Wird erstellt…" : "Rechnung erstellen"}
                      </Button>
                      {invoiceMessage?.type === "success" && (
                        <Link href="/pro/billing" className="block text-center text-sm text-[#B8903A] hover:underline mt-3">
                          Zum Rechnungscenter
                        </Link>
                      )}
                    </div>
                    {(companyData.companyName || companyData.iban || companyData.taxId) && (
                      <div className="border-t border-slate-200 pt-4 mt-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Handwerksbetrieb / Zahlungsinformationen</p>
                        {companyData.companyName && <p className="text-sm font-medium text-slate-900">{companyData.companyName}</p>}
                        {(companyData.address || companyData.zip || companyData.city) && (
                          <p className="text-sm text-slate-600">
                            {[companyData.address, [companyData.zip, companyData.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                          </p>
                        )}
                        {(companyData.iban || companyData.accountHolder) && (
                          <p className="text-sm text-slate-600 mt-1">
                            {companyData.accountHolder && <span>Kontoinhaber: {companyData.accountHolder}</span>}
                            {companyData.accountHolder && companyData.iban && " · "}
                            {companyData.iban && <span>IBAN: {companyData.iban}</span>}
                          </p>
                        )}
                        {companyData.taxId && <p className="text-sm text-slate-600">USt-IdNr. / Steuernr.: {companyData.taxId}</p>}
                      </div>
                    )}
                  </div>
                </div>
                {!isDemoMode && orderInvoices.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-2xl">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                      <h3 className="text-base font-bold text-slate-900">Rechnungen zu diesem Auftrag</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Als bezahlt markieren, sobald der Kunde gezahlt hat.</p>
                    </div>
                    <div className="p-4 space-y-2">
                      {orderInvoices.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-700">
                            Rechnung {inv.gross_amount != null ? `${Number(inv.gross_amount).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}` : ""}{" "}
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${inv.status === "paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                              {inv.status === "paid" ? "Bezahlt" : "Offen"}
                            </span>
                          </span>
                          {inv.status !== "paid" && (
                            <Button
                              type="button"
                              size="sm"
                              disabled={markingPaidId === inv.id}
                              onClick={() => handleMarkInvoicePaid(inv.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {markingPaidId === inv.id ? "Wird gespeichert…" : "Als bezahlt markieren"}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
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

        {/* Rechte Sidebar: Extern (Karten) oben, darunter Die Baustelle + Zurück */}
        <div className="lg:col-span-3 bg-slate-100 p-4 space-y-4 overflow-y-auto flex flex-col min-h-0">
          {/* Extern mit Karten – dort wo vorher Kundendaten waren */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase mb-3">Extern</h2>
            <ExternalRequest
              orderId={order.id}
              orderZip={order.zip}
              onRequest={async (trade, urgency, date) => {
                await new Promise((resolve) => setTimeout(resolve, 1500))
                console.log(`External request: ${trade}, urgency: ${urgency}, date: ${date}`)
              }}
            />
          </div>

          {/* Die Baustelle + Zurück */}
          <div className="pt-2 border-t border-slate-300 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase">Die Baustelle</h3>
                <p className="text-xs text-slate-400 mt-0.5">Auftrag #{order.id.slice(0, 8)}</p>
              </div>
              <Link href="/pro/orders">
                <Button variant="outline" size="sm" className="text-xs h-7 px-2">Zurück</Button>
              </Link>
            </div>
            <OrderTimeline
              orderCreatedAt={order.createdAt}
              wizardData={wizardData}
              status={status}
              quoteOfferSentAt={quoteOfferSentAt}
              quoteCustomerAcceptedAt={quoteCustomerAcceptedAt}
              orderInvoices={orderInvoices}
            />
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
