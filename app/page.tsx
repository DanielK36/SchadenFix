"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function StartPage() {
  const router = useRouter()
  const [clicked, setClicked] = useState(false)

  const handleClick = () => {
    if (clicked) return
    setClicked(true)
    setTimeout(() => router.push("/gold-arc/melden"), 600)
  }

  return (
    <main className="min-h-screen bg-[#05090E] flex items-center justify-center">
      <div className="max-w-[430px] w-full px-6">
        <div className="relative w-full cursor-pointer" onClick={handleClick}>
          <Image
            src="/sp-startseite.png"
            alt="Portal"
            width={360}
            height={640}
            className={`portal-img ${clicked ? "portal-click" : "portal-hover"}`}
            priority
          />

          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
              clicked ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 w-full flex items-center justify-center">
              <h1 className="text-3xl font-semibold text-[#FFF7E5] text-center">
                Schaden?
              </h1>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-gray-200 text-sm">
          Tippen Sie hier, wir kümmern uns sofort.
        </p>
      </div>
    </main>
  )
}

