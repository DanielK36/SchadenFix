"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

export function VersionSwitcher() {
  const pathname = usePathname()
  const isV2 = pathname?.startsWith("/v2")
  const isV3 = pathname?.startsWith("/v3")
  
  // Nur in Entwicklung anzeigen
  if (process.env.NODE_ENV === "production") {
    return null
  }

  // Clean path für Switcher
  let basePath = pathname || "/"
  if (isV2) {
    basePath = pathname.replace("/v2", "") || "/"
  }
  if (isV3) {
    basePath = pathname.replace("/v3", "") || "/"
  }
  
  // Sonderfälle für claim routes
  if (basePath.startsWith("/claim/")) {
    basePath = basePath.replace("/claim/", "/melden/")
  }
  if (basePath.startsWith("/thanks")) {
    basePath = "/danke"
  }
  
  const v1Path = basePath
  const v2Path = `/v2${basePath === "/danke" ? "/thanks" : basePath === "/melden/" ? "/claim/" : basePath}`
  const v3Path = `/v3${basePath === "/danke" ? "/thanks" : basePath === "/melden/" ? "/claim/" : basePath}`

  return (
    <div className="fixed top-2 right-2 z-50 flex gap-1 rounded-full bg-white px-1 py-0.5 text-xs shadow-md border border-gray-200">
      <Link
        href={v1Path}
        className={`px-2 py-0.5 rounded-full transition-colors ${
          !isV2 && !isV3 ? "bg-amber-500 text-white font-medium" : "text-gray-600 hover:bg-amber-100"
        }`}
      >
        v1
      </Link>
      <Link
        href={v2Path}
        className={`px-2 py-0.5 rounded-full transition-colors ${
          isV2 && !isV3 ? "bg-amber-500 text-white font-medium" : "text-gray-600 hover:bg-amber-100"
        }`}
      >
        v2
      </Link>
      <Link
        href={v3Path}
        className={`px-2 py-0.5 rounded-full transition-colors ${
          isV3 ? "bg-amber-500 text-white font-medium" : "text-gray-600 hover:bg-amber-100"
        }`}
      >
        v3
      </Link>
    </div>
  )
}

