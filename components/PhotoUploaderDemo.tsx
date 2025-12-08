"use client"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface PhotoUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
}

export function PhotoUploaderDemo({ value, onChange }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)

    // Demo: Erstelle Data URLs für lokale Vorschau
    const newUrls: string[] = []
    for (const file of files) {
      if (file.size > 4 * 1024 * 1024) {
        alert(`Datei ${file.name} ist zu groß (max. 4 MB)`)
        continue
      }

      // Erstelle lokale URL für Vorschau
      const url = URL.createObjectURL(file)
      newUrls.push(url)

      // Simuliere Upload-Verzögerung
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    onChange([...value, ...newUrls])
    setUploading(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removePhoto = (urlToRemove: string) => {
    // Revoke object URL um Memory zu sparen
    URL.revokeObjectURL(urlToRemove)
    onChange(value.filter((url) => url !== urlToRemove))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {value.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
            <Image
              src={url}
              alt={`Upload ${idx + 1}`}
              fill
              className="object-cover"
              unoptimized // Wichtig für object URLs
            />
            <button
              type="button"
              onClick={() => removePhoto(url)}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {value.length < 10 && (
          <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
              disabled={uploading}
            />
            <label
              htmlFor="photo-upload"
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Wird hochgeladen...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Foto hinzufügen</span>
                </div>
              )}
            </label>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Sie können bis zu 10 Fotos hochladen. Max. 4 MB pro Bild. (Demo-Modus: Fotos werden nur lokal angezeigt)
      </p>
    </div>
  )
}

