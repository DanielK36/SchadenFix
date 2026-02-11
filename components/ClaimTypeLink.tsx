"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ClaimTypeCard } from "@/components/ClaimTypeCard"

interface ClaimTypeLinkProps {
  id: string
  icon: string
  label: string
  description: string
}

export function ClaimTypeLink({ id, icon, label, description }: ClaimTypeLinkProps) {
  const searchParams = useSearchParams()
  const refCode = searchParams.get("ref")
  const href = refCode ? `/melden/${id}?ref=${encodeURIComponent(refCode)}` : `/melden/${id}`

  const handleClick = () => {
    // Analytics Event
    if (typeof window !== "undefined") {
      console.log(`📊 Analytics: select_type`, { type: id })
    }
  }

  return (
    <Link href={href} onClick={handleClick}>
      <ClaimTypeCard icon={icon} label={label} description={description} />
    </Link>
  )
}

