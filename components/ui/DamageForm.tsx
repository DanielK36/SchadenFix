"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { persistRefFromUrl, getRefForClaim, clearRefAfterSubmit } from "@/lib/referral-storage";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ArrowLeft, ArrowRight } from "lucide-react";

interface DamageFormProps {
  category: string;
  onBack: () => void;
  onNext?: (step: number) => void;
  currentStep?: number;
}

// Kategorie-spezifische Optionen
const categoryOptions: Record<string, string[]> = {
  "Wasserschaden": ["Rohrbruch", "Feuchtigkeit", "Rückstau", "Überschwemmung", "Leckage"],
  "Feuer": ["Brand", "Rauchschaden", "Elektro-Schaden", "Kaminbrand", "Sonstiger Feuerschaden"],
  "Glas": ["Riss", "Bruch", "Spalt", "Beschädigung", "Vollständig"],
  "KFZ": ["Unfall", "Parkrempler", "Wildunfall", "Hagel", "Vandalismus", "Sonstiger Schaden"],
  "Recht": ["Schadenersatz", "Rückforderung", "Rechtsberatung"],
};

// Quick Tags für Beschreibung (nur zusätzliche Infos, keine Doppelungen mit Hauptoptionen)
const quickTags: Record<string, string[]> = {
  "Wasserschaden": ["Stark", "Tropft", "Keller", "Bad"],
  "Feuer": ["Rauch", "Stark", "Klein"],
  "Glas": ["Frontscheibe", "Fenster", "Tür", "Dusche"],
  "KFZ": [],
  "Recht": [],
};

// Erreichbarkeits-Optionen
const availabilityOptions = [
  "Vormittag (8-12 Uhr)",
  "Mittag (12-14 Uhr)",
  "Nachmittag (14-18 Uhr)",
  "Abend (18-20 Uhr)",
  "Flexibel",
];

export const DamageForm = ({ category, onBack, onNext, currentStep = 1 }: DamageFormProps) => {
  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  
  // Schritt 2: Schadenort (VOR Kontaktdaten)
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  
  // Schritt 3: Persönliche Daten
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState("");
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Referral-Code aus URL in sessionStorage speichern, damit er beim Navigieren nicht verloren geht
  const refFromUrl = searchParams.get("ref");
  useEffect(() => {
    persistRefFromUrl(refFromUrl);
  }, [refFromUrl]);

  const options = categoryOptions[category] || [];
  const tags = quickTags[category] || [];
  const canContinueStep1 = description.trim().length > 0 || selectedOption !== null;
  const canContinueStep2 = street.trim().length > 0 && zipCode.trim().length > 0 && city.trim().length > 0;
  const canContinueStep3 = firstName.trim().length > 0 && lastName.trim().length > 0 && phone.trim().length > 0 && email.includes("@");
  
  const handleNext = () => {
    if (currentStep === 1 && canContinueStep1) {
      onNext?.(2);
    } else if (currentStep === 2 && canContinueStep2) {
      onNext?.(3);
    } else if (currentStep === 3 && canContinueStep3) {
      handleSubmit();
    }
  };
  
  const handleSubmit = async () => {
    if (!canContinueStep3) return;
    
    setIsSubmitting(true);
    
    try {
      // Map category to API type
      const typeMap: Record<string, string> = {
        "Wasserschaden": "wasser",
        "Feuer": "feuer",
        "Glas": "glas",
        "KFZ": "kfz",
        "Recht": "recht",
      };
      
      const type = typeMap[category] || "wasser";
      
      // Ensure description is at least 5 characters (API requirement)
      const finalDescription = description.trim() || `${category} Schaden`;
      if (finalDescription.length < 5) {
        alert("Bitte beschreiben Sie den Schaden genauer (mindestens 5 Zeichen).");
        setIsSubmitting(false);
        return;
      }
      
      // Ensure PLZ is exactly 5 digits
      if (!/^\d{5}$/.test(zipCode)) {
        alert("Bitte geben Sie eine gültige 5-stellige PLZ ein.");
        setIsSubmitting(false);
        return;
      }
      
      // Build API payload according to claimSchema
      const payload = {
        type,
        description: finalDescription,
        occurredAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago to satisfy validation
        locationText: `${street}, ${city}`.trim() || city.trim() || "Unbekannt",
        plz: zipCode,
        wish: ["nur_rueckruf"], // Use correct enum value
        contact: {
          name: `${firstName} ${lastName}`.trim(),
          email: email.trim(),
          phone: phone.trim(),
          preferredContactMethod: "telefon" as const,
        },
        photos: [], // Empty array is valid
        consents: {
          partner: true, // Required
          agent: false,
        },
      };
      
      console.log("📤 Submitting claim:", payload);
      
      // Referral-Code: zuerst aus URL, sonst aus sessionStorage (falls beim Navigieren verloren)
      const refCode = getRefForClaim(searchParams.get("ref"));
      const apiUrl = refCode ? `/api/claim?ref=${encodeURIComponent(refCode)}` : "/api/claim";
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      
      console.log("📥 API Response:", result);
      
      if (!response.ok) {
        // Log full error details
        console.error("❌ API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          result,
        });
      }
      
      if (result.success) {
        clearRefAfterSubmit();
        // Show success screen
        onNext?.(4);
      } else {
        // Better error handling - show Zod validation errors if present
        let errorMsg = result.error || "Bitte versuchen Sie es erneut";
        if (result.errors && Array.isArray(result.errors)) {
          const zodErrors = result.errors.map((e: any) => `${e.path?.join('.') || 'Feld'}: ${e.message || e.error}`).join('\n');
          errorMsg = `Validierungsfehler:\n${zodErrors}`;
        }
        console.error("❌ API Error:", errorMsg);
        alert(`Fehler: ${errorMsg}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("❌ Submit error:", error);
      alert("Fehler beim Absenden. Bitte versuchen Sie es erneut.");
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    if (currentStep === 2) {
      onNext?.(1);
    } else if (currentStep === 3) {
      onNext?.(2);
    } else {
      onBack();
    }
  };


  const handleTagClick = (tag: string) => {
    if (description.trim() === "") {
      setDescription(tag);
    } else {
      setDescription(description + ", " + tag);
    }
  };
  
  return (
    <div className="w-full max-w-md md:w-full md:max-w-none mx-auto px-4 md:px-12 lg:px-16 xl:px-24 pb-32">
      <AnimatePresence mode="wait">
        {currentStep === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Dynamische Headline */}
            <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 tracking-tighter mb-2 md:mb-3">
                    {category} melden
                </h2>
                <p className="text-stone-500 font-medium text-base md:text-lg">
                    Wählen Sie die zutreffende Option.
                </p>
            </div>

            {/* 2-Spalten-Grid für Optionen - Kompakte flache Rechtecke */}
            {options.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {options.map((item, i) => (
                  <motion.button
                    key={i}
                    onClick={() => {
                      setSelectedOption(item);
                      setDescription(`${item}: `);
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      h-16 md:h-20 rounded-xl transition-all
                      flex items-center justify-center text-center px-4 md:px-6
                      ${selectedOption === item 
                        ? 'bg-stone-900 text-white shadow-md' 
                        : 'bg-white text-stone-900 border border-stone-200 shadow-sm hover:border-stone-300'
                      }
                    `}
                  >
                    <span className="font-semibold text-sm md:text-base leading-tight">
                      {item}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Beschreibung mit Quick Tags - Direkt unter Grid */}
            <div className="space-y-3 md:space-y-4">
                <label className="text-sm md:text-base font-bold text-stone-900 ml-1">Beschreibung</label>
                <textarea 
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (selectedOption && !e.target.value.startsWith(selectedOption)) {
                        setSelectedOption(null);
                      }
                    }}
                    className="w-full bg-white rounded-2xl p-3 md:p-4 border border-stone-100 shadow-sm focus:ring-2 focus:ring-black/5 focus:outline-none resize-none text-stone-900 placeholder:text-stone-400 min-h-[100px] md:min-h-[120px] text-sm md:text-base"
                    placeholder="z.B. Wasserrohr geplatzt, Wasser läuft aus..."
                />
                
                {/* Quick Tags - untereinander */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 active:scale-95 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* Foto Upload - Flacher Platzhalter */}
            <div className="space-y-2">
                 <label className="text-sm font-bold text-stone-900 ml-1">Foto (Optional)</label>
                 <button className="w-full h-32 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-all bg-white/50 active:scale-95">
                    <Camera size={24} />
                    <span className="text-sm font-medium">Foto aufnehmen oder hochladen</span>
                 </button>
            </div>
          </motion.div>
        ) : currentStep === 2 ? (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Headline */}
            <div>
                <h2 className="text-3xl font-black text-stone-900 tracking-tighter mb-2">
                    Schadenort
                </h2>
                <p className="text-stone-500 font-medium">
                    Wo ist der Schaden aufgetreten?
                </p>
            </div>

            {/* iOS Grouped Style Container */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 divide-y divide-stone-100">
              {/* Straße & Hausnummer */}
              <div className="px-4 py-3">
                <input 
                    type="text"
                    name="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    autoComplete="street-address"
                    className="w-full bg-transparent border-0 focus:outline-none text-stone-900 placeholder:text-stone-400 text-base"
                    placeholder="Straße & Hausnummer"
                />
              </div>

              {/* PLZ und Ort */}
              <div className="grid grid-cols-[30%_1fr] gap-2 px-4 py-3">
                <input 
                    type="text"
                    name="zip"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    autoComplete="postal-code"
                    inputMode="numeric"
                    className="bg-transparent border-0 focus:outline-none text-stone-900 placeholder:text-stone-400 text-base"
                    placeholder="PLZ"
                />
                <input 
                    type="text"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    autoComplete="address-level2"
                    className="bg-transparent border-0 focus:outline-none text-stone-900 placeholder:text-stone-400 text-base"
                    placeholder="Ort"
                />
              </div>
            </div>
          </motion.div>
        ) : currentStep === 3 ? (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Headline */}
            <div>
                <h2 className="text-3xl font-black text-stone-900 tracking-tighter mb-2">
                    Ihre Kontaktdaten
                </h2>
                <p className="text-stone-500 font-medium">
                    Damit wir Sie erreichen können.
                </p>
            </div>

            {/* iOS Grouped Style Container */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 divide-y divide-stone-100">
              {/* Vorname */}
              <div className="flex items-center px-4 py-3">
                <label className="text-sm font-medium text-stone-700 w-24 flex-shrink-0">Vorname</label>
                <input 
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className="flex-1 bg-transparent border-0 focus:outline-none text-stone-900 placeholder:text-stone-400 text-right"
                    placeholder="Max"
                />
              </div>

              {/* Nachname */}
              <div className="flex items-center px-4 py-3">
                <label className="text-sm font-medium text-stone-700 w-24 flex-shrink-0">Nachname</label>
                <input 
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    className="flex-1 bg-transparent border-0 focus:outline-none text-stone-900 placeholder:text-stone-400 text-right"
                    placeholder="Mustermann"
                />
              </div>

              {/* E-Mail */}
              <div className="flex items-center px-4 py-3">
                <label className="text-sm font-medium text-stone-700 w-24 flex-shrink-0">E-Mail</label>
                <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="flex-1 bg-transparent border-0 focus:outline-none text-stone-900 placeholder:text-stone-400 text-right"
                    placeholder="max@example.com"
                />
              </div>

              {/* Telefonnummer */}
              <div className="flex items-center px-4 py-3">
                <label className="text-sm font-medium text-stone-700 w-24 flex-shrink-0">Telefon</label>
                <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    className="flex-1 bg-transparent border-0 focus:outline-none text-stone-900 placeholder:text-stone-400 text-right"
                    placeholder="+49 123 456789"
                />
              </div>

              {/* Erreichbarkeit */}
              <div className="flex items-center px-4 py-3">
                <label className="text-sm font-medium text-stone-700 w-24 flex-shrink-0">Erreichbar</label>
                <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="flex-1 bg-transparent border-0 focus:outline-none text-stone-900 text-right appearance-none"
                >
                    <option value="">Bitte wählen...</option>
                    {availabilityOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Fixed Navigation Buttons am unteren Rand */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[#deded7] via-[#deded7] to-transparent pointer-events-none">
        <div className="max-w-md md:w-full md:max-w-none mx-auto px-4 md:px-12 lg:px-16 xl:px-24 flex gap-3 pointer-events-auto">
          <button 
            onClick={handleBack}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-stone-300 text-stone-700 font-medium hover:bg-white transition-colors active:scale-95 bg-white"
          >
            <ArrowLeft size={18} />
            <span>Zurück</span>
          </button>
          <button 
            onClick={handleNext}
            disabled={
              isSubmitting ||
              (currentStep === 1 && !canContinueStep1) ||
              (currentStep === 2 && !canContinueStep2) ||
              (currentStep === 3 && !canContinueStep3)
            }
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95"
          >
            <span>{isSubmitting ? "Sende…" : currentStep === 3 ? "Fertig" : "Weiter"}</span>
            {currentStep !== 3 && !isSubmitting && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
