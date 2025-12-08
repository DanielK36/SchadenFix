"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import GoldArcLayout from "@/components/goldArc/GoldArcLayout"
import StatusBar from "@/components/goldArc/StatusBar"
import HeaderArc from "@/components/goldArc/HeaderArc"
import GoldButton from "@/components/goldArc/GoldButton"
import PhotoUploadMinimal from "@/components/goldArc/PhotoUploadMinimal"
import SuccessBar from "@/components/goldArc/SuccessBar"
import GoldArcFooter from "@/components/goldArc/GoldArcFooter"
import { TextArea } from "@/components/goldArc/TextFields"

export default function GoldArcBeschreibungPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || ""

  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  const handleNext = () => {
    if (!description.trim()) {
      setError("Bitte beschreiben Sie den Schaden kurz.")
      return
    }
    setError("")
    router.push(`/gold-arc/rueckruf?type=${encodeURIComponent(type)}&desc=${encodeURIComponent(description.trim())}`)
  }

  return (
    <GoldArcLayout>
      <StatusBar />
      <HeaderArc />

      <section className="space-y-3 text-center mb-6">
        <h1 className="text-3xl font-semibold text-white">Was ist passiert?</h1>
        <p className="text-base text-gray-300">Beschreiben Sie kurz den Schaden.</p>
      </section>

      <TextArea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="z.B. Wasserrohr geplatzt, Wasser läuft aus…"
      />
      {error && <p className="text-xs text-[#F87171] -mt-2">{error}</p>}

      <PhotoUploadMinimal />

      <GoldButton label="Weiter" onClick={handleNext} />
      
      <SuccessBar step={1} total={2} />
      <GoldArcFooter />
    </GoldArcLayout>
  )
}
