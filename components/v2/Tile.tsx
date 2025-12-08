"use client"

import Link from "next/link"

interface TileProps {
  id: string
  icon: string
  label: string
  description: string
  href: string
}

export function Tile({ id, icon, label, description, href }: TileProps) {
  return (
    <li>
      <Link href={href} className="group block">
        <div className="rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl transition-transform group-hover:rotate-1">{icon}</span>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{label}</div>
              <div className="text-xs text-gray-500">{description}</div>
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}

