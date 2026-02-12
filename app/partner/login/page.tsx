"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signInPro } from "@/lib/auth"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"

function PartnerLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setIsDemoMode } = useDemoMode()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Pre-fill email from query parameter if present
  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { user, error: authError } = await signInPro(email, password)

      if (authError || !user) {
        const msg = authError?.message ?? ""
        const isInvalidCreds = /invalid login credentials|invalid_login_credentials/i.test(msg)
        if (isInvalidCreds) {
          setError(
            "E-Mail oder Passwort ist falsch. " +
            "Falls Supabase gerade gewartet wird, bitte in ein paar Minuten erneut versuchen oder den Demo-Modus nutzen."
          )
        } else {
          setError(msg || "Anmeldung fehlgeschlagen")
        }
        setLoading(false)
        return
      }

      const roles = Array.isArray(user.profile?.roles) ? user.profile?.roles : []
      const hasPartnerAccess = user.profile?.role === "partner" || roles.includes("partner")

      if (!hasPartnerAccess) {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token

        if (!token) {
          setError("Sie haben keinen Partner-Zugang")
          setLoading(false)
          return
        }

        const enableRes = await fetch("/api/partner/enable", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        const enableData = await enableRes.json().catch(() => null)
        if (!enableRes.ok || !enableData?.success) {
          setError(enableData?.error || "Partner-Zugang konnte nicht aktiviert werden")
          setLoading(false)
          return
        }
      }

      // Success - redirect to dashboard
      router.push("/partner")
    } catch (err: any) {
      const msg = err?.message ?? ""
      const isInvalidCreds = /invalid login credentials|invalid_login_credentials/i.test(msg)
      if (isInvalidCreds) {
        setError(
          "E-Mail oder Passwort ist falsch. " +
          "Falls Supabase gerade gewartet wird, bitte in ein paar Minuten erneut versuchen oder den Demo-Modus nutzen."
        )
      } else {
        setError(msg || "Ein Fehler ist aufgetreten")
      }
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    setIsDemoMode(true)
    router.push("/partner")
  }

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1A1A] rounded-2xl border border-[#B8903A]/20 shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-[#B8903A] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SP</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#EAEAEA]">Partner Portal</h1>
                <p className="text-sm text-[#6B7280]">Ihr Partner-Cockpit</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#EAEAEA]">
                E-Mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                required
                className="bg-[#0A0A0A] border-[#333333] text-[#EAEAEA]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-[#EAEAEA]">
                  Passwort
                </label>
                <Link
                  href="/partner/login/forgot"
                  className="text-xs text-[#B8903A] hover:underline"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  required
                  autoComplete="current-password"
                  className="bg-[#0A0A0A] border-[#333333] text-[#EAEAEA] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[#6B7280] hover:text-[#EAEAEA]"
                  tabIndex={-1}
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
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

          <div className="border-t border-[#333333] pt-4">
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
            <Link href="/partner/register" className="text-[#B8903A] hover:underline font-medium">
              Jetzt registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PartnerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-white">Laden...</div>
      </div>
    }>
      <PartnerLoginForm />
    </Suspense>
  )
}
