"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Download, CheckCircle2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import confetti from "canvas-confetti"

// Dynamically import SignatureCanvas to avoid SSR issues
const SignatureCanvas = dynamic(
  () => import("react-signature-canvas"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-48 rounded-lg bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Lade Signaturfeld...</p>
      </div>
    )
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

interface OfferData {
  id: string
  customerName: string
  customerAddress: string
  damageType: string
  items: OfferItem[]
  netTotal: number
  vatAmount: number
  grossTotal: number
  createdAt: string
}

// Mock function - in production, this would fetch from API
function getOfferById(offerId: string): OfferData | null {
  // Simulate API call
  return {
    id: offerId,
    customerName: "Familie Mustermann",
    customerAddress: "Musterstraße 12, 41061 Mönchengladbach",
    damageType: "Wasserschaden",
    items: [
      {
        id: "leak_detection",
        description: "Pauschale Leckortung inkl. Anfahrt",
        quantity: 1,
        unit: "Pauschale",
        unitPrice: 150.0,
        total: 150.0,
      },
      {
        id: "emergency_seal",
        description: "Notabdichtung Kupferleitung, Material & Lohn",
        quantity: 1,
        unit: "Pauschale",
        unitPrice: 85.0,
        total: 85.0,
      },
    ],
    netTotal: 235.0,
    vatAmount: 44.65,
    grossTotal: 279.65,
    createdAt: new Date().toISOString(),
  }
}

export default function OfferPage() {
  const params = useParams()
  const router = useRouter()
  const offerId = params.offerId as string
  const [offer, setOffer] = useState<OfferData | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [signaturePad, setSignaturePad] = useState<any>(null)

  useEffect(() => {
    // Load offer data
    const offerData = getOfferById(offerId)
    setOffer(offerData)
  }, [offerId])

  const handleSignatureEnd = () => {
    if (signaturePad && !signaturePad.isEmpty()) {
      setHasSignature(true)
    }
  }

  const handleClearSignature = () => {
    if (signaturePad) {
      signaturePad.clear()
      setHasSignature(false)
    }
  }

  const handleSubmit = async () => {
    if (!hasSignature || !offer) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // Update order status (simulated)
      console.log("Order approved:", offerId)
    }, 1500)
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Angebot wird geladen...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">SP</span>
            </div>
            <span className="font-semibold text-slate-900">Ihr Handwerksbetrieb</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Angebot</p>
            <p className="text-sm font-semibold text-slate-900">#{offer.id}</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Hallo {offer.customerName.split(" ")[0]},
          </h1>
          <p className="text-slate-600 mb-6">
            Hier ist Ihr Angebot für den {offer.damageType}.
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-[#D4AF37]">
              {offer.grossTotal.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-slate-500 text-sm">inkl. MwSt.</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Offer Details Accordion */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-900">Angebotsdetails</span>
            <span className="text-sm text-slate-500">
              {showDetails ? "Ausblenden" : "Details anzeigen"}
            </span>
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 border-t border-slate-200">
                  <div className="space-y-4 pt-4">
                    {offer.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{item.description}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 ml-4">
                          {item.total.toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Nettobetrag</span>
                      <span className="text-slate-900">
                        {offer.netTotal.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">MwSt. (19%)</span>
                      <span className="text-slate-900">
                        {offer.vatAmount.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-900">Gesamtbetrag</span>
                      <span className="font-bold text-lg text-[#D4AF37]">
                        {offer.grossTotal.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                  </div>
                  <button className="mt-4 w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>PDF herunterladen</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Signature Section */}
        {!isSubmitted && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Unterschrift
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Bitte unterschreiben Sie mit dem Finger oder der Maus
            </p>
            <div className="border-2 border-slate-200 rounded-lg bg-white relative">
              <SignatureCanvas
                ref={(ref) => setSignaturePad(ref)}
                canvasProps={{
                  className: "w-full h-48 rounded-lg",
                }}
                onEnd={handleSignatureEnd}
                backgroundColor="#FFFFFF"
                penColor="#1A1A1A"
              />
            </div>
            <button
              onClick={handleClearSignature}
              className="mt-3 text-sm text-slate-500 hover:text-slate-700 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Löschen</span>
            </button>
          </div>
        )}

        {/* Success Message */}
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
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Vielen Dank!
            </h2>
            <p className="text-green-700">
              Wir melden uns zwecks Terminabstimmung.
            </p>
          </motion.div>
        )}
      </div>

      {/* Sticky Action Bar */}
      {!isSubmitted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-50 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <motion.button
              onClick={handleSubmit}
              disabled={!hasSignature || isSubmitting}
              animate={hasSignature ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: hasSignature ? Infinity : 0 }}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                hasSignature && !isSubmitting
                  ? "bg-[#D4AF37] text-slate-900 shadow-md active:scale-[0.98]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Wird gesendet..." : "Kostenpflichtig beauftragen"}
            </motion.button>
            {!hasSignature && (
              <p className="text-xs text-slate-400 text-center mt-2">
                Bitte unterschreiben Sie zuerst
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

