"use client"

import { MapPin } from "lucide-react"

interface MiniMapProps {
  address: string
  zip: string
  city: string
}

export function MiniMap({ address, zip, city }: MiniMapProps) {
  // In production, this would use a real map library (e.g., Google Maps, Mapbox)
  // For now, we'll show a placeholder with the address
  const fullAddress = `${address}, ${zip} ${city}`
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`

  return (
    <div className="w-full h-48 bg-slate-200 rounded-lg overflow-hidden relative">
      {/* Placeholder Map - In production, replace with actual map component */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-600 font-medium">Karte</p>
        </div>
      </div>
      {/* Clickable overlay to open in Google Maps */}
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/5 transition-colors cursor-pointer"
        title="In Google Maps öffnen"
      >
        <span className="sr-only">Karte öffnen</span>
      </a>
    </div>
  )
}

