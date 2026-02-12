"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { Download, CheckCircle2, X, FileDown } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import confetti from "canvas-confetti"
import { jsPDF } from "jspdf"

// Dynamically import SignatureCanvas to avoid SSR issues
const SignatureCanvas = dynamic(
  () => import("react-signature-canvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 rounded-lg bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Lade Signaturfeld...</p>
      </div>
    ),
  }
) as any

interface OfferItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface CompanyData {
  companyName?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  zip?: string
  city?: string
  iban?: string
  accountHolder?: string
  taxId?: string
  logoUrl?: string
}

interface OfferData {
  id: string
  orderId: string
  customerName: string
  customerAddress: string
  damageType: string
  items: OfferItem[]
  netTotal: number
  vatAmount: number
  grossTotal: number
  offerSentAt?: string
  customerAcceptedAt?: string
  alreadyAccepted: boolean
  company?: CompanyData | null
}

function formatEuro(value: number) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Lesbare Angebotsnummer (kein langer Token). */
function formatOfferNumber(offer: OfferData): string {
  const id = (offer.orderId || offer.id || "").toString()
  if (id.length >= 8) return "KVA-" + id.slice(0, 8).toUpperCase()
  if (id) return "KVA-" + id.toUpperCase()
  return "KVA-"
}

/** Schadensart lesbar: kfz → KFZ, wasser → Wasserschaden. */
function formatDamageTypeLabel(type: string): string {
  if (!type) return "—"
  const t = type.trim().toLowerCase()
  const upper = ["kfz", "glas", "wasser", "feuer", "gebaeude", "rechtsfall"]
  if (upper.includes(t) || t.length <= 4) return type.trim().toUpperCase()
  return type.trim().charAt(0).toUpperCase() + type.trim().slice(1).toLowerCase()
}

/** Adresse in max. 3 Zeilen, keine doppelten Teile. */
function formatAddressLines(address: string): string[] {
  if (!address || !address.trim()) return []
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean)
  const seen = new Set<string>()
  const unique: string[] = []
  for (const p of parts) {
    if (seen.has(p)) continue
    seen.add(p)
    unique.push(p)
  }
  if (unique.length <= 3) return unique
  return [unique[0], unique.slice(1, -1).join(", "), unique[unique.length - 1]]
}

function generateKvaPdf(offer: OfferData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 25
  const contentW = pageW - margin * 2
  let y = margin

  const colorTitle = [30, 41, 59]
  const colorLabel = [100, 116, 139]
  const colorLine = [148, 163, 184]
  const colorAccent = [212, 175, 55]
  const rowHeightBase = 10
  const company = offer.company

  const offerNo = formatOfferNumber(offer)
  const damageLabel = formatDamageTypeLabel(offer.damageType || "")
  const addrLines = formatAddressLines(offer.customerAddress || "")

  // —— Kopfbereich ——
  doc.setFontSize(24)
  doc.setFont(undefined, "bold")
  doc.setTextColor(...colorTitle)
  doc.text("Kostenvoranschlag", margin, y)
  y += 10

  doc.setFontSize(10)
  doc.setFont(undefined, "normal")
  doc.setTextColor(...colorLabel)
  doc.text(`Angebotsnummer: ${offerNo}`, margin, y)
  doc.text(`Datum: ${new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}`, pageW - margin, y, { align: "right" })
  y += 8

  doc.setDrawColor(...colorLine)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageW - margin, y)
  y += 12

  // —— An / Von (2 Spalten) ——
  const col2X = margin + contentW / 2
  const vonStartY = y
  doc.setFontSize(8)
  doc.setFont(undefined, "bold")
  doc.setTextColor(...colorLabel)
  doc.text("AN", margin, y)
  doc.text("VON", col2X, y)
  y += 6
  doc.setFont(undefined, "normal")
  doc.setFontSize(11)
  doc.setTextColor(...colorTitle)
  doc.text(offer.customerName || "Kunde", margin, y)
  doc.text(company?.companyName || "Ihr Handwerksbetrieb", col2X, y)
  y += 6
  doc.setFontSize(10)
  doc.setTextColor(...colorLabel)
  // AN: Kundenadresse (linke Spalte)
  addrLines.slice(0, 3).forEach((line: string) => {
    doc.text(line, margin, y)
    y += 5
  })
  if (addrLines.length === 0) y += 5
  // VON: Handwerkerdaten unter dem Firmennamen (rechte Spalte, erst unter „Von“ / Firmenname)
  let vonY = vonStartY + 6 + 5 // eine Zeile unter Firmenname
  if (company?.contactPerson) {
    doc.text(company.contactPerson, col2X, vonY)
    vonY += 5
  }
  if (company?.address) {
    doc.text(company.address, col2X, vonY)
    vonY += 5
  }
  if (company?.zip || company?.city) {
    doc.text([company.zip, company.city].filter(Boolean).join(" "), col2X, vonY)
    vonY += 5
  }
  if (company?.phone) {
    doc.text(company.phone, col2X, vonY)
    vonY += 5
  }
  if (company?.email) {
    doc.text(company.email, col2X, vonY)
    vonY += 5
  }
  y = Math.max(y, vonY) + 6

  doc.setFontSize(10)
  doc.setTextColor(...colorTitle)
  doc.text(`Schadensart: ${damageLabel}`, margin, y)
  y += 14

  // —— Tabelle: feste Spaltengeometrie, Rahmen zuerst, Text strikt in Zellen ——
  const tableLeft = margin
  const tableRight = margin + contentW
  const colDesc = tableLeft
  const colDescW = 68
  const colQty = colDesc + colDescW
  const colQtyW = 14
  const colUnit = colQty + colQtyW
  const colUnitW = 18
  const colPrice = colUnit + colUnitW
  const colPriceW = 24
  const colTotal = colPrice + colPriceW
  const colTotalW = tableRight - colTotal
  const cellPad = 2
  const descMaxW = colDescW - cellPad * 2

  doc.setDrawColor(...colorLine)
  doc.setLineWidth(0.2)

  const drawRowLine = (yRow: number) => {
    doc.line(tableLeft, yRow, tableRight, yRow)
  }
  const drawVerticalLines = (yTop: number, yBottom: number) => {
    doc.line(tableLeft, yTop, tableLeft, yBottom)
    doc.line(colQty, yTop, colQty, yBottom)
    doc.line(colUnit, yTop, colUnit, yBottom)
    doc.line(colPrice, yTop, colPrice, yBottom)
    doc.line(colTotal, yTop, colTotal, yBottom)
    doc.line(tableRight, yTop, tableRight, yBottom)
  }

  const headerRowH = 8
  const headerTop = y
  drawRowLine(y)
  drawRowLine(y + headerRowH)
  drawVerticalLines(headerTop, y + headerRowH)
  y += headerRowH
  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.setTextColor(...colorLabel)
  const headerMidY = headerTop + headerRowH / 2
  doc.text("Position / Beschreibung", colDesc + cellPad, headerMidY - 1, { maxWidth: descMaxW })
  doc.text("Menge", colQty + colQtyW / 2, headerMidY - 1, { align: "center" })
  doc.text("Einheit", colUnit + colUnitW / 2, headerMidY - 1, { align: "center" })
  doc.text("Einzelpreis", colPrice + colPriceW - cellPad, headerMidY - 1, { align: "right" })
  doc.text("Gesamt", colTotal + colTotalW - cellPad, headerMidY - 1, { align: "right" })
  y += 4

  doc.setFont(undefined, "normal")
  doc.setTextColor(...colorTitle)
  doc.setFontSize(10)
  const lineH = 5
  const items = offer.items || []
  items.forEach((item: OfferItem) => {
    if (y > 232) {
      doc.addPage()
      y = margin + 6
    }
    const desc = (item.description || "—").trim()
    const descLines = doc.splitTextToSize(desc, descMaxW)
    const rowH = Math.max(rowHeightBase, descLines.length * lineH + 6)
    const rowTop = y
    const rowBottom = y + rowH
    drawRowLine(rowTop)
    drawRowLine(rowBottom)
    drawVerticalLines(rowTop, rowBottom)
    descLines.forEach((line: string, i: number) => {
      doc.text(line, colDesc + cellPad, rowTop + 4 + i * lineH)
    })
    const rowMidY = rowTop + rowH / 2
    doc.text(String(item.quantity ?? 0), colQty + colQtyW / 2, rowMidY, { align: "center" })
    doc.text((item.unit || "—").slice(0, 8), colUnit + colUnitW / 2, rowMidY, { align: "center" })
    doc.text(formatEuro(item.unitPrice ?? 0), colPrice + colPriceW - cellPad, rowMidY, { align: "right" })
    doc.text(formatEuro(item.total ?? 0), colTotal + colTotalW - cellPad, rowMidY, { align: "right" })
    y = rowBottom + 2
  })

  y += 6
  drawRowLine(y)
  y += 8

  doc.setFontSize(10)
  doc.setTextColor(...colorTitle)
  doc.text("Nettobetrag", margin + 2, y)
  doc.text(formatEuro(offer.netTotal ?? 0), colTotal + colTotalW - 2, y, { align: "right" })
  y += 7
  doc.text("MwSt. (19 %)", margin + 2, y)
  doc.text(formatEuro(offer.vatAmount ?? 0), colTotal + colTotalW - 2, y, { align: "right" })
  y += 10
  doc.setDrawColor(...colorLine)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 8
  doc.setFont(undefined, "bold")
  doc.setFontSize(12)
  doc.text("Gesamtbetrag (brutto)", margin + 2, y)
  doc.setTextColor(...colorAccent)
  doc.text(formatEuro(offer.grossTotal ?? 0), colTotal + colTotalW - 2, y, { align: "right" })
  doc.setTextColor(...colorTitle)
  doc.setFont(undefined, "normal")

  // —— Footer: Firmendaten + Bank links, Hinweise rechts ——
  const footerY = pageH - 38
  doc.setDrawColor(...colorLine)
  doc.setLineWidth(0.2)
  doc.line(margin, footerY, pageW - margin, footerY)
  const footerLeftW = contentW / 2 - 5
  let fy = footerY + 5
  doc.setFontSize(8)
  doc.setTextColor(...colorLabel)
  if (company?.companyName) {
    doc.setFont(undefined, "bold")
    doc.text(company.companyName, margin, fy)
    fy += 5
    doc.setFont(undefined, "normal")
  }
  if (company?.address) {
    const addrLines = doc.splitTextToSize(company.address, footerLeftW)
    addrLines.forEach((line: string) => { doc.text(line, margin, fy); fy += 4 })
  }
  if (company?.zip || company?.city) {
    doc.text([company.zip, company.city].filter(Boolean).join(" "), margin, fy)
    fy += 4
  }
  if (company?.phone || company?.email) {
    doc.text([company.phone, company.email].filter(Boolean).join("  ·  "), margin, fy)
    fy += 5
  }
  if (company?.iban || company?.accountHolder) {
    if (company.accountHolder) doc.text(`Kontoinhaber: ${company.accountHolder}`, margin, fy)
    if (company.iban) doc.text(`IBAN: ${company.iban}`, margin, fy + (company.accountHolder ? 4 : 0))
    fy += company.accountHolder && company.iban ? 9 : 5
  }
  if (company?.taxId) {
    doc.text(`USt-IdNr. / Steuernr.: ${company.taxId}`, margin, fy)
  }
  doc.text("Dieses Angebot ist 14 Tage gültig. Alle Preise zzgl. der gesetzlichen MwSt.", pageW - margin, footerY + 5, { align: "right", maxWidth: contentW / 2 - 5 })
  doc.text("Vielen Dank für Ihr Vertrauen.", pageW - margin, footerY + 10, { align: "right", maxWidth: contentW / 2 - 5 })

  doc.save(`Kostenvoranschlag_${offerNo}.pdf`)
}

function OfferContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = (params?.offerId as string) || ""
  const [offer, setOffer] = useState<OfferData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasSignature, setHasSignature] = useState(false)
  const [agbAccepted, setAgbAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [signaturePad, setSignaturePad] = useState<any>(null)

  useEffect(() => {
    if (!token) {
      setError("Link ungültig")
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/offer/${encodeURIComponent(token)}`)
        const data = await res.json()
        if (cancelled) return
        if (!data?.success || !data?.offer) {
          setError(data?.error || "Angebot nicht gefunden")
          setOffer(null)
          return
        }
        setOffer(data.offer)
        if (data.offer.alreadyAccepted) setIsSubmitted(true)
      } catch (e) {
        if (!cancelled) setError("Angebot konnte nicht geladen werden")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  const handleSignatureEnd = () => {
    if (signaturePad && !signaturePad.isEmpty()) setHasSignature(true)
  }

  const handleClearSignature = () => {
    if (signaturePad) {
      signaturePad.clear()
      setHasSignature(false)
    }
  }

  const canAccept = hasSignature && agbAccepted && privacyAccepted && offer && !offer.alreadyAccepted

  const handleSubmit = async () => {
    if (!canAccept || !offer || !token) return
    setIsSubmitting(true)
    try {
      const signatureDataUrl = signaturePad && !signaturePad.isEmpty() ? signaturePad.toDataURL("image/png") : undefined
      const res = await fetch(`/api/offer/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureDataUrl,
          agbAccepted: true,
          privacyAccepted: true,
        }),
      })
      const data = await res.json()
      if (data?.success) {
        setIsSubmitted(true)
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      } else {
        alert(data?.error ?? "Annahme fehlgeschlagen")
      }
    } catch (e) {
      alert("Annahme fehlgeschlagen")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Angebot wird geladen...</p>
      </div>
    )
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md text-center">
          <p className="text-slate-700 font-medium mb-2">{error || "Angebot nicht gefunden"}</p>
          <p className="text-sm text-slate-500 mb-4">Der Link ist ungültig oder abgelaufen.</p>
          <Link href="/" className="text-[#B8903A] hover:underline font-medium">Zur Startseite</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#B8903A] rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">SP</span>
            </div>
            <span className="font-semibold text-slate-900">Ihr Handwerksbetrieb</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Angebot</p>
            <p className="text-sm font-semibold text-slate-900">{formatOfferNumber(offer)}</p>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-slate-500 mb-3">Sie haben diesen Link von Ihrem Handwerker erhalten. Hier können Sie das Angebot einsehen und annehmen.</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Hallo {offer.customerName.split(" ")[0] || "Kunde"},
          </h1>
          <p className="text-slate-600 mb-6">
            Hier ist Ihr Angebot für den {formatDamageTypeLabel(offer.damageType || "")}.
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-[#B8903A]">
              {(offer.grossTotal ?? 0).toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-slate-500 text-sm">inkl. MwSt.</span>
          </div>
          <button
            type="button"
            onClick={() => generateKvaPdf(offer)}
            className="mt-6 w-full sm:w-auto py-3 px-5 bg-[#B8903A] text-slate-900 rounded-lg font-semibold hover:bg-[#A67C2A] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <FileDown className="w-5 h-5" />
            <span>KVA als PDF herunterladen</span>
          </button>
          <p className="text-xs text-slate-500 mt-2">
            Zum Einreichen z. B. bei der Versicherung
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* KVA direkt wie auf der Handwerker-Seite (QuotePreview-Layout) */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <div className="space-y-6">
            <div className="border-b border-slate-300 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-slate-900">Kostenvoranschlag</h2>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Angebotsnummer</p>
                  <p className="text-sm font-semibold text-slate-900">{formatOfferNumber(offer)}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">Schadensart: {formatDamageTypeLabel(offer.damageType || "")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">An</p>
                <p className="text-sm font-medium text-slate-900">{offer.customerName}</p>
                <p className="text-sm text-slate-600">
                  {(() => {
                    const lines = formatAddressLines(offer.customerAddress || "")
                    return lines.length ? lines.map((line, i) => <span key={i}>{line}{i < lines.length - 1 ? <br /> : null}</span>) : "—"
                  })()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Von</p>
                <p className="text-sm font-medium text-slate-900">{offer.company?.companyName || "Ihr Handwerksbetrieb"}</p>
                {offer.company?.contactPerson && <p className="text-sm text-slate-600">{offer.company.contactPerson}</p>}
                {offer.company?.address && <p className="text-sm text-slate-600">{offer.company.address}</p>}
                {(offer.company?.zip || offer.company?.city) && (
                  <p className="text-sm text-slate-600">{[offer.company.zip, offer.company.city].filter(Boolean).join(" ")}</p>
                )}
                {offer.company?.phone && <p className="text-sm text-slate-600">{offer.company.phone}</p>}
                {offer.company?.email && <p className="text-sm text-slate-600">{offer.company.email}</p>}
              </div>
            </div>

            <div className="border-t border-slate-300 pt-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-xs font-semibold text-slate-600 uppercase">Position</th>
                    <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-20">Menge</th>
                    <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-24">Einheit</th>
                    <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-28">Einzelpreis</th>
                    <th className="text-right py-2 text-xs font-semibold text-slate-600 uppercase w-24">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {(offer.items || []).map((item: OfferItem, idx: number) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-2 text-sm text-slate-900">{item.description || "—"}</td>
                      <td className="py-2 text-sm text-slate-600 text-right">{item.quantity ?? 0}</td>
                      <td className="py-2 text-sm text-slate-600 text-right">{item.unit || "—"}</td>
                      <td className="py-2 text-sm text-slate-600 text-right">
                        {(item.unitPrice ?? 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                      </td>
                      <td className="py-2 text-sm font-semibold text-slate-900 text-right">
                        {(item.total ?? 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-300 pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Nettobetrag</span>
                    <span className="font-medium text-slate-900">
                      {(offer.netTotal ?? 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">MwSt. (19%)</span>
                    <span className="font-medium text-slate-900">
                      {(offer.vatAmount ?? 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-300">
                    <span className="font-bold text-slate-900">Gesamtbetrag</span>
                    <span className="font-bold text-lg text-[#B8903A]">
                      {(offer.grossTotal ?? 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => generateKvaPdf(offer)}
                className="flex-1 py-3 px-4 bg-[#B8903A] text-slate-900 rounded-lg font-semibold hover:bg-[#A67C2A] transition-colors flex items-center justify-center gap-2"
              >
                <FileDown className="w-5 h-5" />
                <span>KVA als PDF herunterladen</span>
              </button>
              <button
                type="button"
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                onClick={() => window.print()}
              >
                <Download className="w-5 h-5" />
                <span>Seite drucken</span>
              </button>
            </div>

            {(offer.company?.companyName || offer.company?.iban || offer.company?.taxId) && (
              <div className="border-t border-slate-200 pt-4 mt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Handwerksbetrieb / Zahlungsinformationen</p>
                {offer.company.companyName && <p className="text-sm font-medium text-slate-900">{offer.company.companyName}</p>}
                {(offer.company.address || offer.company.zip || offer.company.city) && (
                  <p className="text-sm text-slate-600">
                    {[offer.company.address, [offer.company.zip, offer.company.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                  </p>
                )}
                {(offer.company.iban || offer.company.accountHolder) && (
                  <p className="text-sm text-slate-600 mt-1">
                    {offer.company.accountHolder && <span>Kontoinhaber: {offer.company.accountHolder}</span>}
                    {offer.company.accountHolder && offer.company.iban && " · "}
                    {offer.company.iban && <span>IBAN: {offer.company.iban}</span>}
                  </p>
                )}
                {offer.company.taxId && <p className="text-sm text-slate-600">USt-IdNr. / Steuernr.: {offer.company.taxId}</p>}
                <p className="text-xs text-slate-500 mt-3">Dieses Angebot ist 14 Tage gültig. Alle Preise zzgl. der gesetzlichen MwSt.</p>
              </div>
            )}
          </div>
        </div>

        {!isSubmitted && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Rechtliche Bestätigung</h2>
              <p className="text-sm text-slate-600 mb-4">
                Bitte bestätigen Sie vor der Annahme die folgenden Punkte:
              </p>
              <label className="flex items-start gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={agbAccepted}
                  onChange={(e) => setAgbAccepted(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-[#B8903A] focus:ring-[#B8903A]"
                />
                <span className="text-sm text-slate-700">
                  Ich habe die{" "}
                  <Link href="/agb" target="_blank" rel="noopener noreferrer" className="text-[#B8903A] hover:underline">
                    AGB
                  </Link>{" "}
                  gelesen und akzeptiert.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-[#B8903A] focus:ring-[#B8903A]"
                />
                <span className="text-sm text-slate-700">
                  Ich habe die{" "}
                  <Link href="/datenschutz" target="_blank" rel="noopener noreferrer" className="text-[#B8903A] hover:underline">
                    Datenschutzerklärung
                  </Link>{" "}
                  zur Kenntnis genommen.
                </span>
              </label>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Unterschrift</h2>
              <p className="text-sm text-slate-500 mb-4">
                Bitte unterschreiben Sie mit dem Finger oder der Maus
              </p>
              <div className="border-2 border-slate-200 rounded-lg bg-white relative">
                <SignatureCanvas
                  ref={(ref: any) => setSignaturePad(ref)}
                  canvasProps={{ className: "w-full h-48 rounded-lg" }}
                  onEnd={handleSignatureEnd}
                  backgroundColor="#FFFFFF"
                  penColor="#1A1A1A"
                />
              </div>
              <button
                type="button"
                onClick={handleClearSignature}
                className="mt-3 text-sm text-slate-500 hover:text-slate-700 flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Löschen</span>
              </button>
            </div>
          </>
        )}

        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-4"
            >
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
            </motion.div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Vielen Dank!</h2>
            <p className="text-green-700">Ihr Angebot wurde angenommen. Wir melden uns zwecks Terminabstimmung.</p>
          </motion.div>
        )}
      </div>

      {!isSubmitted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-50 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={!canAccept || isSubmitting}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                canAccept && !isSubmitting
                  ? "bg-[#B8903A] text-slate-900 shadow-md active:scale-[0.98]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Wird gesendet..." : "Kostenpflichtig beauftragen"}
            </motion.button>
            {!canAccept && !isSubmitting && (
              <p className="text-xs text-slate-400 text-center mt-2">
                Bitte bestätigen Sie AGB und Datenschutz sowie Ihre Unterschrift
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OfferPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-slate-500">Lade...</p>
        </div>
      }
    >
      <OfferContent />
    </Suspense>
  )
}
