"use client"

import { useState, useEffect } from "react"
import { Copy, QrCode, ChevronDown, ChevronUp } from "lucide-react"
import { AnimatedButton } from "@/components/partner/AnimatedButton"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function PartnerMaterialsPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [expandedText, setExpandedText] = useState<string | null>(null)
  const [affiliateLink, setAffiliateLink] = useState("https://beispiel.de/aff123")

  useEffect(() => {
    async function loadLink() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch("/api/partner/affiliate-link", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (data?.success && data.link?.url) {
          setAffiliateLink(data.link.url)
        }
      } catch (error) {
        console.warn("Failed to load affiliate link:", error)
      }
    }
    loadLink()
  }, [])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    
    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    // Toast
    toast.success("Kopiert! ✅", {
      duration: 2000,
    })
    
    setTimeout(() => setCopied(null), 2000)
  }

  const marketingTexts = [
    {
      id: "email",
      title: "E-Mail Text",
      text: "Hallo,\n\nich möchte Ihnen unser Schadenportal empfehlen. Mit diesem Service können Sie Schäden schnell und unkompliziert melden.\n\nHier geht's direkt zum Portal: " + affiliateLink,
    },
    {
      id: "whatsapp",
      title: "WhatsApp Text",
      text: "Hey! 👋\n\nKennst du schon unser Schadenportal? Perfekt für schnelle Schadensmeldungen!\n\n" + affiliateLink,
    },
    {
      id: "social",
      title: "Social Media Text",
      text: "🚗💥 Schaden passiert? Unser Schadenportal macht die Meldung zum Kinderspiel! Schnell, einfach und zuverlässig.\n\n" + affiliateLink + "\n\n#Schadenportal #Versicherung",
    },
  ]

  return (
    <div className="space-y-4 page-transition">
      <div>
        <h1 className="text-white text-2xl font-bold">Werbemittel</h1>
        <p className="text-[#6B7280] mt-0.5 text-xs">Ihr persönlicher Affiliate-Link und Werbetexte</p>
      </div>

      {/* Affiliate Link */}
      <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Affiliate-Link</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={affiliateLink}
            readOnly
            className="flex-1 bg-[#000000] border border-[#B8903A]/20 rounded-lg px-4 py-3 text-sm text-white"
          />
          <AnimatedButton
            onClick={() => handleCopy(affiliateLink, "link")}
            className="bg-[#B8903A] text-[#000000] rounded-lg py-3 px-5 font-semibold text-sm flex items-center gap-2 hover:bg-[#A67C2A] transition-colors whitespace-nowrap"
          >
            <Copy className="w-4 h-4" />
            <span>{copied === "link" ? "Kopiert" : "Kopieren"}</span>
          </AnimatedButton>
        </div>

        {/* QR Code - Collapsible */}
        <div className="mt-4">
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-2 text-[#6B7280] hover:text-white text-sm transition-colors"
          >
            {showQR ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>QR-Code {showQR ? "ausblenden" : "anzeigen"}</span>
          </button>
          {showQR && (
            <div className="mt-3 p-4 bg-white rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-24 h-24 mx-auto text-[#000000] mb-2" />
                <p className="text-[#000000] text-xs">QR-Code scannen</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Marketing Texts - Accordion */}
      <div className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Werbetexte</h2>
        <div className="space-y-2">
          {marketingTexts.map((item) => {
            const isExpanded = expandedText === item.id
            return (
              <div key={item.id} className="bg-[#000000] rounded-xl overflow-hidden">
                <div
                  onClick={() => setExpandedText(isExpanded ? null : item.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                >
                  <span className="text-white text-sm font-medium">{item.title}</span>
                  <div className="flex items-center gap-2">
                    <AnimatedButton
                      onClick={(e) => {
                        e?.stopPropagation()
                        handleCopy(item.text, item.id)
                      }}
                      className="bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied === item.id ? "✓" : "Kopieren"}</span>
                    </AnimatedButton>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                    )}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-3 pb-3">
                    <textarea
                      value={item.text}
                      readOnly
                      rows={4}
                      className="w-full bg-[#1A1A1A] border border-white/5 rounded-lg px-3 py-2 text-xs text-white resize-none"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
