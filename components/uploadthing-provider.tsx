"use client"

export function UploadthingAppProvider({ children }: { children: React.ReactNode }) {
  // Uploadthing works without a provider in Next.js App Router
  return <>{children}</>
}

