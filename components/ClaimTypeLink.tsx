"use client"

import Link from "next/link"
import { ClaimTypeCard } from "@/components/ClaimTypeCard"

interface ClaimTypeLinkProps {
  id: string
  icon: string
  label: string
  description: string
}

export function ClaimTypeLink({ id, icon, label, description }: ClaimTypeLinkProps) {
  const handleClick = () => {
    // Analytics Event
    if (typeof window !== "undefined") {
      console.log(`📊 Analytics: select_type`, { type: id })
    }
  }

  return (
    <Link href={`/melden/${id}`} onClick={handleClick}>
      <ClaimTypeCard icon={icon} label={label} description={description} />
    </Link>
  )
}

