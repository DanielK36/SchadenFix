"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react"

export default function PartnerResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasRecovery, setHasRecovery] = useState<boolean | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const checkRecovery = async () => {
      const { data } = await supabase.auth.getSession()
      setHasRecovery(!!data.session)
    }
    checkRecovery()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen haben")
      return
    }
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein")
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/partner/login"), 2000)
    } catch (err: any) {
      setError(err?.message ?? "Ein Fehler ist aufgetreten")
    } finally {
      setLoading(false)
    }
  }

  if (hasRecovery === null) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
        <div className="text-[#6B7280] text-sm">Wird geladen…</div>
      </div>
    )
  }

  if (hasRecovery === false) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#1A1A1A] rounded-2xl border border-[#B8903A]/20 shadow-lg p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold text-[#EAEAEA]">Link ungültig oder abgelaufen</h1>
              <p className="text-sm text-[#6B7280]">
                Bitte fordere einen neuen Passwort-Reset an.
              </p>
            </div>
            <Link
              href="/partner/login/forgot"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#B8903A] text-white font-semibold hover:bg-[#A67C2A]"
            >
              Neuen Link anfordern
            </Link>
            <Link
              href="/partner/login"
              className="flex items-center justify-center gap-2 text-sm text-[#B8903A] hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    )
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
                <h1 className="text-2xl font-semibold text-[#EAEAEA]">Neues Passwort setzen</h1>
                <p className="text-sm text-[#6B7280]">Partner Portal</p>
              </div>
            </div>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-200">
                  Dein Passwort wurde geändert. Du wirst zur Anmeldung weitergeleitet.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[#EAEAEA]">
                  Neues Passwort
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={6}
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
              <div className="space-y-2">
                <label htmlFor="confirm" className="text-sm font-medium text-[#EAEAEA]">
                  Passwort wiederholen
                </label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder=""
                    autoComplete="new-password"
                    minLength={6}
                    className="bg-[#0A0A0A] border-[#333333] text-[#EAEAEA] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[#6B7280] hover:text-[#EAEAEA]"
                    tabIndex={-1}
                    aria-label={showConfirm ? "Passwort verbergen" : "Passwort anzeigen"}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                {loading ? "Wird gespeichert…" : "Passwort speichern"}
              </Button>
            </form>
          )}

          {!success && (
            <div className="border-t border-[#333333] pt-4">
              <Link
                href="/partner/login"
                className="flex items-center justify-center gap-2 text-sm text-[#B8903A] hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zur Anmeldung
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
