"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ProForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async () => {
    setError(null)
    setMessage(null)
    if (!email) {
      setError("Bitte E-Mail eingeben")
      return
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pro/login`,
    })

    if (resetError) {
      setError(resetError.message)
      return
    }

    setMessage("Wir haben dir einen Reset-Link geschickt.")
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Passwort zurücksetzen</h1>
        <p className="text-sm text-[#6B7280]">Gib deine E-Mail ein, um einen Reset-Link zu erhalten.</p>
        <input
          className="pro-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-Mail"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}
        <button className="pro-button-primary" onClick={handleReset}>
          Link senden
        </button>
      </div>
    </div>
  )
}
