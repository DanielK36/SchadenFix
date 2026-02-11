"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signInPro } from "@/lib/auth"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { AlertCircle } from "lucide-react"

export default function ProLoginPage() {
  const router = useRouter()
  const { setIsDemoMode } = useDemoMode()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { user, error: authError } = await signInPro(email, password)

      if (authError || !user) {
        setError(authError?.message || "Anmeldung fehlgeschlagen")
        setLoading(false)
        return
      }

      // Real login → ensure demo mode is off so dashboard/orders show real data
      setIsDemoMode(false)
      // Success - redirect to dashboard
      router.push("/pro/dashboard")
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten")
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    setIsDemoMode(true)
    router.push("/pro/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-[#B8903A] rounded-xl flex items-center justify-center">
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
              <label htmlFor="email" className="text-sm font-medium text-[#6B7280]">
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
              <label htmlFor="password" className="text-sm font-medium text-[#6B7280]">
                Passwort
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                required
                className="bg-white border-[#EAEAEA]"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link href="/pro/forgot-password" className="text-[#B8903A] hover:underline">
                Passwort vergessen?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B8903A] text-white hover:bg-[#A67C2A] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Anmeldung..." : "Anmelden"}
            </Button>
          </form>

          <div className="border-t border-[#EAEAEA] pt-4">
            <Button
              type="button"
              onClick={handleDemoMode}
              variant="outline"
              className="w-full border-[#B8903A] text-[#B8903A] hover:bg-[#B8903A] hover:text-white font-semibold"
            >
              Demo-Modus starten
            </Button>
          </div>

          <div className="text-center text-sm text-[#6B7280]">
            Noch kein Zugang?{" "}
            <Link href="/pro/register" className="text-[#B8903A] hover:underline font-medium">
              Jetzt registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
