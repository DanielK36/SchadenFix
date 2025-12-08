"use client"

import Link from "next/link"

export default function GoldArcFooter() {
  return (
    <footer className="mt-auto pt-8 pb-6 border-t border-[#1F232C]">
      <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
        <Link href="/impressum" className="hover:text-[#FFD66A] transition-colors">
          Impressum
        </Link>
        <span>•</span>
        <Link href="/datenschutz" className="hover:text-[#FFD66A] transition-colors">
          Datenschutz
        </Link>
      </div>
    </footer>
  )
}

