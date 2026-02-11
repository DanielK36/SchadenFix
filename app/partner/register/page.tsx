"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signInPro } from "@/lib/auth"
import { AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function PartnerRegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agbAccepted, setAgbAccepted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email || !password || !companyName || !contactPerson) {
      setError("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein")
      return
    }

    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein")
      return
    }

    if (!agbAccepted) {
      setError("Bitte akzeptieren Sie die AGB")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/partner-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          companyName,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        // Check if user already exists (multiple possible error messages)
        const errorMessage = data?.details || data?.error || ""
        const alreadyExists =
          data?.code === "USER_EXISTS" ||
          res.status === 409 ||
          errorMessage.toLowerCase().includes("already") ||
          errorMessage.toLowerCase().includes("registered") ||
          errorMessage.toLowerCase().includes("exists") ||
          errorMessage.toLowerCase().includes("duplicate") ||
          errorMessage.toLowerCase().includes("user already registered")

        if (alreadyExists) {
          // Try to sign in with provided credentials
          console.log("User exists, attempting sign in...")
          const { user: existingUser, error: signInError } = await signInPro(email, password)
          
          if (signInError || !existingUser) {
            // Password doesn't match - redirect to login
            console.log("Sign in failed:", signInError?.message)
            setError(
              "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich mit Ihrem bestehenden Passwort an."
            )
            setTimeout(() => {
              router.push("/partner/login?email=" + encodeURIComponent(email))
            }, 2000)
            setLoading(false)
            return
          }

          // User signed in successfully - enable partner access
          console.log("Sign in successful, enabling partner access...")
          const { data: sessionData } = await supabase.auth.getSession()
          const token = sessionData.session?.access_token
          
          if (!token) {
            console.error("No session token after sign in")
            setError("Anmeldung erfolgreich, aber Session konnte nicht erstellt werden. Bitte erneut versuchen.")
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
          console.log("Enable response:", enableRes.status, enableData)
          
          if (!enableRes.ok || !enableData?.success) {
            const errorMsg = enableData?.error || enableData?.details || "Partner-Zugang konnte nicht aktiviert werden"
            console.error("Failed to enable partner access:", errorMsg)
            setError(errorMsg + ". Bitte kontaktieren Sie den Support.")
            setLoading(false)
            return
          }

          // Success - redirect to partner dashboard
          console.log("Partner access enabled successfully")
          router.push("/partner")
          return
        }

        console.error("Registration failed:", errorMessage)
        setError(data?.details || data?.error || "Registrierung fehlgeschlagen")
        setLoading(false)
        return
      }

      const { user: signedIn, error: signInError } = await signInPro(email, password)
      if (signInError || !signedIn) {
        setError(signInError?.message || "Account erstellt, aber Login fehlgeschlagen. Bitte anmelden.")
        setLoading(false)
        return
      }

      router.push("/partner")
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1A1A] rounded-2xl border border-[#B8903A]/20 shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-[#B8903A] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SP</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#EAEAEA]">Partner Registrierung</h1>
                <p className="text-sm text-[#6B7280]">Schadenportal Partner</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium text-[#EAEAEA]">
                Firmenname
              </label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Mustermann GmbH"
                required
                className="bg-[#0A0A0A] border-[#333333] text-[#EAEAEA]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contactPerson" className="text-sm font-medium text-[#EAEAEA]">
                Ansprechpartner
              </label>
              <Input
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Max Mustermann"
                required
                className="bg-[#0A0A0A] border-[#333333] text-[#EAEAEA]"
              />
            </div>

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
              <label htmlFor="password" className="text-sm font-medium text-[#EAEAEA]">
                Passwort
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                required
                autoComplete="new-password"
                className="bg-[#0A0A0A] border-[#333333] text-[#EAEAEA]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[#EAEAEA]">
                Passwort bestätigen
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=""
                required
                autoComplete="new-password"
                className="bg-[#0A0A0A] border-[#333333] text-[#EAEAEA]"
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="agb"
                checked={agbAccepted}
                onChange={(e) => setAgbAccepted(e.target.checked)}
                className="mt-1"
                required
              />
              <label htmlFor="agb" className="text-sm text-[#EAEAEA]">
                Ich akzeptiere die{" "}
                <Link href="/agb" className="text-[#B8903A] hover:underline">
                  AGB
                </Link>{" "}
                und den{" "}
                <Link href="/datenschutz" className="text-[#B8903A] hover:underline">
                  Datenschutz
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B8903A] text-white hover:bg-[#A67C2A] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registrierung läuft..." : "Registrierung abschließen"}
            </Button>
          </form>

          <div className="text-center text-sm text-[#6B7280]">
            Bereits registriert?{" "}
            <Link href="/partner/login" className="text-[#B8903A] hover:underline font-medium">
              Jetzt anmelden
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
