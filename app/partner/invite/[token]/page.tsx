"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { signInPro } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

interface InvitationData {
  id: string
  inviteeEmail: string
  inviterCompanyName: string
  expiresAt: string
  createdAt: string
}

export default function PartnerInvitePage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Token fehlt")
      setLoading(false)
      return
    }

    // Fetch invitation details
    fetch(`/api/partner/invite/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInvitation(data.invitation)
        } else {
          setError(data.error || "Einladung nicht gefunden")
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching invitation:", err)
        setError("Fehler beim Laden der Einladung")
        setLoading(false)
      })
  }, [token])

  const handleAccept = async () => {
    if (!token) return

    setAccepting(true)
    setError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) {
        setError("Bitte melde dich zuerst an")
        setAccepting(false)
        return
      }

      const res = await fetch(`/api/partner/invite/${token}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        // Redirect to partner dashboard after 2 seconds
        setTimeout(() => {
          router.push("/partner")
        }, 2000)
      } else {
        setError(data.error || "Einladung konnte nicht akzeptiert werden")
        setAccepting(false)
      }
    } catch (err: any) {
      console.error("Error accepting invitation:", err)
      setError("Fehler beim Akzeptieren der Einladung")
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#B8903A] animate-spin mx-auto mb-4" />
          <p className="text-[#EAEAEA]">Lade Einladung...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#1A1A1A] rounded-2xl border border-red-500/20 shadow-lg p-8 space-y-6">
            <div className="text-center space-y-2">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h1 className="text-2xl font-semibold text-[#EAEAEA]">
                Einladung ungültig
              </h1>
              <p className="text-sm text-[#6B7280]">{error}</p>
            </div>
            <Link href="/partner/login">
              <Button className="w-full bg-[#B8903A] text-white hover:bg-[#A67C2A]">
                Zum Partner Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#1A1A1A] rounded-2xl border border-[#B8903A]/20 shadow-lg p-8 space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h1 className="text-2xl font-semibold text-[#EAEAEA]">
                Einladung akzeptiert!
              </h1>
              <p className="text-sm text-[#6B7280]">
                Du wirst zum Partner Portal weitergeleitet...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
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
                <h1 className="text-2xl font-semibold text-[#EAEAEA]">
                  Partner-Einladung
                </h1>
                <p className="text-sm text-[#6B7280]">Schadenportal Partner</p>
              </div>
            </div>
          </div>

          {invitation && (
            <div className="space-y-4">
              <div className="bg-[#0A0A0A] rounded-lg p-4 space-y-2">
                <p className="text-sm text-[#6B7280]">Eingeladen von</p>
                <p className="text-lg font-semibold text-[#EAEAEA]">
                  {invitation.inviterCompanyName}
                </p>
              </div>

              <div className="bg-[#0A0A0A] rounded-lg p-4 space-y-2">
                <p className="text-sm text-[#6B7280]">E-Mail</p>
                <p className="text-[#EAEAEA]">{invitation.inviteeEmail}</p>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full bg-[#B8903A] text-white hover:bg-[#A67C2A] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Akzeptiere...
                  </>
                ) : (
                  "Einladung akzeptieren"
                )}
              </Button>

              <p className="text-xs text-center text-[#6B7280]">
                Durch das Akzeptieren wirst du mit{" "}
                <strong>{invitation.inviterCompanyName}</strong> verknüpft.
              </p>
            </div>
          )}

          <div className="border-t border-[#333333] pt-4">
            <Link href="/partner/login">
              <Button
                variant="outline"
                className="w-full border-[#B8903A] text-[#B8903A] hover:bg-[#B8903A] hover:text-white"
              >
                Zum Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
