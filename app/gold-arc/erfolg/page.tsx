"use client"

import { useRouter } from "next/navigation"
import GoldArcLayout from "@/components/goldArc/GoldArcLayout"
import StatusBar from "@/components/goldArc/StatusBar"
import GoldButton from "@/components/goldArc/GoldButton"
import GoldArcFooter from "@/components/goldArc/GoldArcFooter"

export default function GoldArcErfolgPage() {
  const router = useRouter()

  return (
    <GoldArcLayout className="items-center">
      <StatusBar />

      <div className="relative w-full max-w-[430px] mt-8 mb-8 flex flex-col items-center text-center px-6 py-16">
        {/* Starker goldener Glow - mehrere Layer */}
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at center, rgba(255,214,106,0.6) 0%, rgba(255,214,106,0.4) 30%, rgba(255,214,106,0.2) 50%, rgba(255,214,106,0.1) 70%, transparent 90%)",
            filter: "blur(40px)",
          }}
        />
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at center, rgba(255,214,106,0.4) 0%, rgba(255,214,106,0.2) 40%, transparent 80%)",
            filter: "blur(20px)",
          }}
        />
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-3xl font-semibold text-white">Wir sind sofort da.</h1>
          <p className="text-base text-gray-300 max-w-sm leading-relaxed">
            Ihr Handwerker wurde informiert und meldet sich in Kürze. Auf Wunsch kommt er heute noch zu Ihnen und kümmert
            sich vor Ort um alles – inklusive Zusammenfassung Ihres Schadens zur Weiterleitung.
          </p>
          <GoldButton label="Zur Startseite" className="mt-8" onClick={() => router.push("/gold-arc")} />
        </div>
      </div>
      
      <GoldArcFooter />
    </GoldArcLayout>
  )
}
