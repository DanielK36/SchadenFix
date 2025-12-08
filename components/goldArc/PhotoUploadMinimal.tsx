"use client"

import { useState, ChangeEvent } from "react"

interface PhotoUploadMinimalProps {
  onFileSelect?: (file: File | null) => void
}

export default function PhotoUploadMinimal({ onFileSelect }: PhotoUploadMinimalProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    onFileSelect?.(selectedFile)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-300">Foto hinzufügen (optional)</p>
      <label className="block">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-full border border-[rgba(255,214,106,0.5)] rounded-2xl px-4 py-3 text-center cursor-pointer hover:border-[#FFD66A] transition-colors bg-[#070C12] min-h-[48px] flex items-center justify-center">
          <span className="text-sm text-gray-300">
            {file ? "✓ Foto ausgewählt" : "📷 Foto aufnehmen oder auswählen"}
          </span>
        </div>
      </label>
    </div>
  )
}
