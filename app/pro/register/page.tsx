"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProRole } from "@/lib/types/pro"
import { ChevronRight, ChevronLeft } from "lucide-react"

const steps = [
  { id: 1, title: "Basisdaten" },
  { id: 2, title: "Adresse & PLZ" },
  { id: 3, title: "Bank & Abrechnung" },
  { id: 4, title: "Dokumente" },
]

export default function ProRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Basisdaten
  const [role, setRole] = useState<ProRole>("HANDWERKER")
  const [companyName, setCompanyName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

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

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Registration complete
      router.push("/pro/dashboard")
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
              <div className="w-12 h-12 bg-[#FFD700] rounded-xl flex items-center justify-center">
                <span className="text-[#1A1A1A] font-bold text-xl">SP</span>
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
                        ? "bg-[#FFD700] text-[#111827]"
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
                      currentStep > step.id ? "bg-[#FFD700]" : "bg-gray-200"
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
                  <label className="text-sm font-medium text-[#374151] block mb-2">Rolle</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as ProRole)}
                    className="w-full h-10 rounded-md border border-[#EAEAEA] px-3 text-sm bg-white"
                  >
                    <option value="HANDWERKER">Handwerker</option>
                    <option value="WERKSTATT">Werkstatt</option>
                    <option value="GUTACHTER">Gutachter</option>
                    <option value="ANWALT">Anwalt</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-2">
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
                  <label className="text-sm font-medium text-[#374151] block mb-2">
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
                  <label className="text-sm font-medium text-[#374151] block mb-2">E-Mail</label>
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
                  <label className="text-sm font-medium text-[#374151] block mb-2">Telefon</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 151 12345678"
                    required
                    className="bg-white"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-2">Straße</label>
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
                    <label className="text-sm font-medium text-[#374151] block mb-2">PLZ</label>
                    <Input
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="41061"
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#374151] block mb-2">Ort</label>
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
                  <label className="text-sm font-medium text-[#374151] block mb-2">
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
                  <label className="text-sm font-medium text-[#374151] block mb-2">IBAN</label>
                  <Input
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="DE89 3704 0044 0532 0130 00"
                    required
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-2">
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
                  <label htmlFor="sepa" className="text-sm text-[#374151]">
                    SEPA-Lastschriftmandat erteilen
                  </label>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-2">
                    Gewerbenachweis
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setBusinessLicense(e.target.files?.[0] || null)}
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-2">
                    Versicherungsnachweis (Betriebshaftpflicht)
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
                  <label htmlFor="agb" className="text-sm text-[#374151]">
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
              className="bg-[#FFD700] text-[#111827] hover:bg-[#E0A63F] flex items-center space-x-2"
            >
              <span>{currentStep === 4 ? "Registrierung abschließen" : "Weiter"}</span>
              {currentStep < 4 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
