"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

export default function PartnerForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!email.trim()) {
      setError("Bitte E-Mail eingeben")
      return
    }

    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/partner/login/reset`,
      })

      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }

      setMessage(
        "Falls ein Konto zu dieser E-Mail existiert, wurde ein Link zum Zurücksetzen des Passworts verschickt. Bitte Posteingang und Spam prüfen."
      )
    } catch (err: any) {
      setError(err?.message ?? "Ein Fehler ist aufgetreten")
    } finally {
      setLoading(false)
    }
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
                <h1 className="text-2xl font-semibold text-[#EAEAEA]">Passwort vergessen</h1>
                <p className="text-sm text-[#6B7280]">Partner Portal</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#6B7280]">
            Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link zum Zurücksetzen des Passworts.
          </p>

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
                autoComplete="email"
                className="bg-[#0A0A0A] border-[#333333] text-[#EAEAEA]"
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-200">{message}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B8903A] text-white hover:bg-[#A67C2A] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Wird gesendet…" : "Link senden"}
            </Button>
          </form>

          <div className="border-t border-[#333333] pt-4">
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
    </div>
  )
}
