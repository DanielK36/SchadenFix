"use client"

import { useState, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import GoldArcLayout from "@/components/goldArc/GoldArcLayout"
import StatusBar from "@/components/goldArc/StatusBar"
import HeaderArc from "@/components/goldArc/HeaderArc"
import GoldButton from "@/components/goldArc/GoldButton"
import SuccessBar from "@/components/goldArc/SuccessBar"
import GoldArcFooter from "@/components/goldArc/GoldArcFooter"
import { TextInput } from "@/components/goldArc/TextFields"

export default function GoldArcRueckrufPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || ""
  const desc = searchParams.get("desc") || ""

  const [formData, setFormData] = useState({
    phone: "",
    plz: "",
    name: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.phone.trim()) {
      newErrors.phone = "Telefonnummer ist erforderlich."
    }
    if (!formData.plz.trim()) {
      newErrors.plz = "PLZ ist erforderlich."
    } else if (!/^\d{5}$/.test(formData.plz)) {
      newErrors.plz = "PLZ muss 5-stellig sein."
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/gold-arc/rueckruf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          description: desc,
          tel: formData.phone,
          plz: formData.plz,
          name: formData.name,
        }),
      })

      if (response.ok) {
        router.push("/gold-arc/erfolg")
      } else {
        setErrors({ submit: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." })
      }
    } catch (error) {
      setErrors({ submit: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <GoldArcLayout>
      <StatusBar />
      <HeaderArc />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3 text-center mb-6">
          <h1 className="text-3xl font-semibold text-white">Wie erreichen wir Sie?</h1>
          <p className="text-base text-gray-300">Ein geprüfter Handwerker ruft Sie innerhalb weniger Minuten an.</p>
        </div>

        <div className="space-y-5">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs text-gray-300">Telefon *</span>
            <TextInput
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+49 151 123456"
            />
            {errors.phone && <span className="text-xs text-[#F87171]">{errors.phone}</span>}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs text-gray-300">PLZ *</span>
            <TextInput
              type="text"
              inputMode="numeric"
              value={formData.plz}
              onChange={(e) => setFormData({ ...formData, plz: e.target.value })}
              placeholder="12345"
              maxLength={5}
            />
            {errors.plz && <span className="text-xs text-[#F87171]">{errors.plz}</span>}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs text-gray-300">Name (optional)</span>
            <TextInput
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Max Mustermann"
            />
          </label>
        </div>

        {errors.submit && <p className="text-sm text-[#F87171]">{errors.submit}</p>}

        <GoldButton label={isSubmitting ? "Wird gesendet..." : "Handwerker informieren"} type="submit" disabled={isSubmitting} />
      </form>

      <p className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-300">
        <span>✅ Keine Kosten</span>
        <span>✅ Direkter Rückruf</span>
        <span>✅ Heute möglich</span>
      </p>
      
      <SuccessBar step={2} total={2} />
      <GoldArcFooter />
    </GoldArcLayout>
  )
}
