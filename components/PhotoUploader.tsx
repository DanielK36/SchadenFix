"use client"

// In Demo-Modus verwenden wir den lokalen Uploader
// Für Produktion mit Uploadthing: Importiere hier die Uploadthing-Version
import { PhotoUploaderDemo } from "./PhotoUploaderDemo"

interface PhotoUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
}

export function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  // Demo-Modus: Nutze lokalen Uploader
  // In Produktion würde hier eine Prüfung auf Uploadthing-Keys erfolgen
  return <PhotoUploaderDemo value={value} onChange={onChange} />
}

