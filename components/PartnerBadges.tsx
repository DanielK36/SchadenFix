"use client"

import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"

interface Partner {
  name: string
  email: string
  whatsapp?: string
}

interface PartnerBadgesProps {
  partners: Partner[]
}

export function PartnerBadges({ partners }: PartnerBadgesProps) {
  if (partners.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Ihre Meldung wurde an unser Team weitergeleitet.</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium mb-2">Weitergeleitet an:</p>
      <div className="flex flex-wrap gap-2">
        {partners.map((partner, idx) => (
          <Badge key={idx} variant="secondary" className="text-sm">
            {partner.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

