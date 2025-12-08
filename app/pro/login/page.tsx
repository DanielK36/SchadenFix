"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ProLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Dummy login - redirect to dashboard
    router.push("/pro/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-[#FFD700] rounded-xl flex items-center justify-center">
                <span className="text-[#1A1A1A] font-bold text-xl">SP</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#1A1A1A]">Schadenportal Pro</h1>
                <p className="text-sm text-[#6B7280]">Ihr Auftrags-Cockpit</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#374151]">
                E-Mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                required
                className="bg-white border-[#EAEAEA]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#374151]">
                Passwort
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white border-[#EAEAEA]"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link href="/pro/forgot-password" className="text-[#FFD700] hover:underline">
                Passwort vergessen?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FFD700] text-[#111827] hover:bg-[#E0A63F] font-semibold"
            >
              Anmelden
            </Button>
          </form>

          <div className="text-center text-sm text-[#6B7280]">
            Noch kein Zugang?{" "}
            <Link href="/pro/register" className="text-[#FFD700] hover:underline font-medium">
              Jetzt registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
