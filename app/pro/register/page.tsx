"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProRole } from "@/lib/types/pro"
import { ChevronRight, ChevronLeft, AlertCircle } from "lucide-react"
import { signInPro } from "@/lib/auth"
import { professionOptions } from "@/lib/constants/professions"

const steps = [
  { id: 1, title: "Basisdaten" },
  { id: 2, title: "Adresse & PLZ" },
  { id: 3, title: "Bank & Abrechnung" },
  { id: 4, title: "Dokumente" },
]

export default function ProRegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [partnerRef, setPartnerRef] = useState<string | null>(null)

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) setPartnerRef(ref)
  }, [searchParams])

  // Step 1: Basisdaten
  const [companyName, setCompanyName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [professions, setProfessions] = useState<string[]>([])

  // Step 2: Adresse
  const [street, setStreet] = useState("")
  const [zip, setZip] = useState("")
  const [city, setCity] = useState("")
  const [zipAreas, setZipAreas] = useState("")

  // Step 3: Bank
  const [iban, setIban] = useState("")
  const [accountHolder, setAccountHolder] = useState("")
  const [sepaMandate, setSepaMandate] = useState(false)

  // Step 4: Dokumente
  const [businessLicense, setBusinessLicense] = useState<File | null>(null)
  const [insurance, setInsurance] = useState<File | null>(null)
  const [agbAccepted, setAgbAccepted] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Registration complete - create account
      await handleRegister()
    }
  }

  const handleRegister = async () => {
    setError(null)

    // Validation
    if (!email || !password) {
      setError("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    if (professions.length === 0) {
      setError("Bitte wählen Sie mindestens ein Gewerk aus")
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
      const res = await fetch("/api/auth/pro-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          companyName: companyName || undefined,
          professions: professions,
          partnerRef: partnerRef || undefined,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        setError(data?.details || data?.error || "Registrierung fehlgeschlagen")
        setLoading(false)
        return
      }

      // Login after server-side signup
      const { user: signedIn, error: signInError } = await signInPro(email, password)
      if (signInError || !signedIn) {
        setError(signInError?.message || "Account erstellt, aber Login fehlgeschlagen. Bitte anmelden.")
        setLoading(false)
        return
      }

      router.push("/pro/dashboard")
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten")
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-[#B8903A] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SP</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#1A1A1A]">Registrierung</h1>
                <p className="text-sm text-[#6B7280]">Schadenportal Pro</p>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.id
                        ? "bg-[#B8903A] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="text-xs mt-2 text-center text-gray-600 hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.id ? "bg-[#B8903A]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">
                    Firmenname
                  </label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Mustermann GmbH"
                    required
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">
                    Ansprechpartner
                  </label>
                  <Input
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Max Mustermann"
                    required
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">E-Mail</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ihre@email.de"
                    required
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">Passwort</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    required
                    autoComplete="new-password"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">Passwort bestätigen</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=""
                    required
                    autoComplete="new-password"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">Telefon</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 151 12345678"
                    required
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">
                    Gewerke <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-[#6B7280] mb-3">
                    Wählen Sie mindestens ein Gewerk aus, das Sie anbieten
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-[#EAEAEA] rounded-md p-3 bg-white">
                    {professionOptions.map((prof) => (
                      <label
                        key={prof.key}
                        className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                          professions.includes(prof.key)
                            ? "bg-[#B8903A]/10 border-2 border-[#B8903A]"
                            : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={professions.includes(prof.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfessions([...professions, prof.key])
                            } else {
                              setProfessions(professions.filter((p) => p !== prof.key))
                            }
                          }}
                          className="rounded border-gray-300 text-[#B8903A] focus:ring-[#B8903A]"
                        />
                        <span className="text-lg">{prof.icon}</span>
                        <span className="text-sm text-[#6B7280]">{prof.label}</span>
                      </label>
                    ))}
                  </div>
                  {professions.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Bitte wählen Sie mindestens ein Gewerk aus
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">Straße</label>
                  <Input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Musterstraße 12"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#6B7280] block mb-2">PLZ</label>
                    <Input
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="41061"
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#6B7280] block mb-2">Ort</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mönchengladbach"
                      required
                      className="bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">
                    PLZ-Gebiete (z.B. 41061-41069)
                  </label>
                  <Input
                    value={zipAreas}
                    onChange={(e) => setZipAreas(e.target.value)}
                    placeholder="41061-41069, 41169-41179"
                    className="bg-white"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">IBAN</label>
                  <Input
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="DE89 3704 0044 0532 0130 00"
                    required
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">
                    Kontoinhaber
                  </label>
                  <Input
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Mustermann GmbH"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="sepa"
                    checked={sepaMandate}
                    onChange={(e) => setSepaMandate(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="sepa" className="text-sm text-[#6B7280]">
                    SEPA-Lastschriftmandat erteilen
                  </label>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">
                    Gewerbenachweis (optional)
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setBusinessLicense(e.target.files?.[0] || null)}
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280] block mb-2">
                    Versicherungsnachweis (Betriebshaftpflicht) (optional)
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setInsurance(e.target.files?.[0] || null)}
                    className="bg-white"
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
                  <label htmlFor="agb" className="text-sm text-[#6B7280]">
                    Ich akzeptiere die AGB und den Datenschutz
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-[#EAEAEA]">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Zurück</span>
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="bg-[#B8903A] text-white hover:bg-[#A67C2A] flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {loading 
                  ? "Registrierung läuft..." 
                  : currentStep === 4 
                    ? "Registrierung abschließen" 
                    : "Weiter"}
              </span>
              {currentStep < 4 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
