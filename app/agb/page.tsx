"use client"

import Link from "next/link"

export default function AgbPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto prose prose-slate">
        <h1 className="text-2xl font-bold text-slate-900">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p className="text-slate-600">
          Die AGB Ihres Handwerksbetriebs können hier hinterlegt werden. Für rechtliche Hinweise siehe auch{" "}
          <Link href="/impressum" className="text-[#B8903A] hover:underline">Impressum</Link> und{" "}
          <Link href="/datenschutz" className="text-[#B8903A] hover:underline">Datenschutz</Link>.
        </p>
      </div>
    </div>
  )
}
