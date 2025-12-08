"use client"

import { useEffect, useState } from "react"
import { Mic, Check } from "lucide-react"
import { motion } from "framer-motion"
import type { WizardData } from "../OrderWizard"

interface OrderWizardScreen3Props {
  selectedTask: string
  photos: string[]
  documentationData?: {
    room?: string
    pipe?: string
    material?: string
    dimension?: number
    damageType?: string
    measures?: string[]
  }
  onUpdate: (updates: Partial<WizardData>) => void
  onCanProceedChange: (canProceed: boolean) => void
}

const rooms = ["Badezimmer", "Küche", "Keller", "Wohnzimmer", "Steigschacht"]
const pipes = ["Kaltwasser", "Warmwasser", "Abwasser", "Heizung", "Fußbodenhzg."]
const materials = ["Kupfer", "Edelstahl", "Mehrschicht", "Kunststoff"]
const damageTypes = ["Lochfraß", "Riss", "Verbindung undicht", "Nagelbohrung"]
const measures = ["Wasser abgestellt", "Leitung entleert", "Notabdichtung", "Keine"]

export function OrderWizardScreen3({
  selectedTask,
  photos,
  documentationData = {},
  onUpdate,
  onCanProceedChange,
}: OrderWizardScreen3Props) {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [room, setRoom] = useState(documentationData.room || "")
  const [pipe, setPipe] = useState(documentationData.pipe || "")
  const [material, setMaterial] = useState(documentationData.material || "")
  const [dimension, setDimension] = useState(documentationData.dimension || 15)
  const [damageType, setDamageType] = useState(documentationData.damageType || "")
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>(documentationData.measures || [])
  const [notes, setNotes] = useState(documentationData.notes || "")
  const [isRecording, setIsRecording] = useState(false)

  // Auto-advance through questions (only forward, not backward)
  useEffect(() => {
    if (room && currentQuestion === 1) {
      setTimeout(() => setCurrentQuestion(2), 300) // Small delay for smooth transition
    } else if (pipe && currentQuestion === 2) {
      setTimeout(() => setCurrentQuestion(3), 300)
    } else if (material && currentQuestion === 3) {
      setTimeout(() => setCurrentQuestion(4), 300)
    } else if (damageType && currentQuestion === 4) {
      setTimeout(() => setCurrentQuestion(5), 300)
    }
  }, [room, pipe, material, damageType, currentQuestion])

  // Validate and update canProceed
  useEffect(() => {
    const isValid = !!(room && pipe && material && damageType && selectedMeasures.length > 0)
    onCanProceedChange(isValid)
    
    // Save documentation data (always save, even if not complete)
    onUpdate({
      documentationData: {
        room,
        pipe,
        material,
        dimension,
        damageType,
        measures: selectedMeasures,
        notes,
      },
    })
  }, [room, pipe, material, dimension, damageType, selectedMeasures, notes, onCanProceedChange, onUpdate])

  const toggleMeasure = (measure: string) => {
    if (measure === "Keine") {
      setSelectedMeasures(["Keine"])
    } else {
      const newMeasures = selectedMeasures.includes(measure)
        ? selectedMeasures.filter((m) => m !== measure)
        : [...selectedMeasures.filter((m) => m !== "Keine"), measure]
      setSelectedMeasures(newMeasures.length > 0 ? newMeasures : ["Keine"])
    }
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
  }

  // Generate summary text
  const generateSummary = () => {
    if (!room || !pipe || !material || !damageType) return ""
    
    const measuresText = selectedMeasures.length > 0 && !selectedMeasures.includes("Keine")
      ? selectedMeasures.join(", ")
      : "Keine Sofortmaßnahmen"
    
    // Format pipe name correctly (remove "leitung" if already in name)
    const pipeName = pipe.includes("leitung") ? pipe : `${pipe}leitung`
    
    return `Leckage an ${pipeName} (${material}, DN${dimension}) im ${room}. Ursache: ${damageType}. Maßnahme: ${measuresText}.`
  }

  return (
    <div className="h-full flex flex-col px-4 py-6">
      <div className="flex-1 flex flex-col">
        {/* Question 1: Room */}
        {currentQuestion === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Betroffener Raum?
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Wähle den betroffenen Raum
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {rooms.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRoom(r)
                    if (navigator.vibrate) {
                      navigator.vibrate(50)
                    }
                  }}
                  className={`px-6 py-3 rounded-full font-semibold transition-all active:scale-[0.98] ${
                    room === r
                      ? "bg-[#D4AF37] text-slate-900 shadow-md"
                      : "bg-white border-2 border-slate-200 text-slate-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Question 2: Pipe */}
        {currentQuestion === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Betroffene Leitung?
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Wähle die betroffene Leitung
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {pipes.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPipe(p)
                    if (navigator.vibrate) {
                      navigator.vibrate(50)
                    }
                  }}
                  className={`px-6 py-3 rounded-full font-semibold transition-all active:scale-[0.98] ${
                    pipe === p
                      ? "bg-[#D4AF37] text-slate-900 shadow-md"
                      : "bg-white border-2 border-slate-200 text-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Question 3: Material & Dimension */}
        {currentQuestion === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Material & Art?
            </h1>
            <p className="text-slate-500 text-center mb-6">
              Wähle das Material
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {materials.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMaterial(m)
                    if (navigator.vibrate) {
                      navigator.vibrate(50)
                    }
                  }}
                  className={`px-6 py-3 rounded-full font-semibold transition-all active:scale-[0.98] ${
                    material === m
                      ? "bg-[#D4AF37] text-slate-900 shadow-md"
                      : "bg-white border-2 border-slate-200 text-slate-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            
            {material && (
              <div className="mt-6">
                <p className="text-slate-500 text-center mb-4">
                  Dimension: DN{dimension}
                </p>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="5"
                  value={dimension}
                  onChange={(e) => {
                    setDimension(Number(e.target.value))
                    if (navigator.vibrate) {
                      navigator.vibrate(20)
                    }
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>DN15</span>
                  <span>DN50</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Question 4: Damage Type */}
        {currentQuestion === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Schadensbild?
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Wähle das Schadensbild
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {damageTypes.map((dt) => (
                <button
                  key={dt}
                  onClick={() => {
                    setDamageType(dt)
                    if (navigator.vibrate) {
                      navigator.vibrate(50)
                    }
                  }}
                  className={`px-6 py-3 rounded-full font-semibold transition-all active:scale-[0.98] ${
                    damageType === dt
                      ? "bg-[#D4AF37] text-slate-900 shadow-md"
                      : "bg-white border-2 border-slate-200 text-slate-700"
                  }`}
                >
                  {dt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Question 5: Measures */}
        {currentQuestion === 5 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Sofortmaßnahmen?
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Wähle alle durchgeführten Maßnahmen
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {measures.map((m) => {
                const isSelected = selectedMeasures.includes(m)
                return (
                  <button
                    key={m}
                    onClick={() => toggleMeasure(m)}
                    className={`px-6 py-3 rounded-full font-semibold transition-all active:scale-[0.98] ${
                      isSelected
                        ? "bg-[#D4AF37] text-slate-900 shadow-md"
                        : "bg-white border-2 border-slate-200 text-slate-700"
                    }`}
                  >
                    {m}
                    {isSelected && (
                      <Check className="w-4 h-4 inline-block ml-2" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Summary Preview */}
        {room && pipe && material && damageType && selectedMeasures.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200"
          >
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Zusammenfassung
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {generateSummary()}
            </p>
          </motion.div>
        )}

        {/* Notes Textarea with Voice Recording */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Ergänzende Notizen (Optional)
          </label>
          <div className="relative">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Haupthahn klemmt, Mieter war nicht da..."
              className="w-full min-h-[80px] px-4 py-3 pr-12 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] resize-none"
            />
            {/* Voice Recording Button (WhatsApp-style) */}
            <button
              onClick={() => {
                setIsRecording(!isRecording)
                if (navigator.vibrate) {
                  navigator.vibrate(50)
                }
                // Simulate voice recording and transcription
                if (!isRecording) {
                  // Simulate recording for 3 seconds
                  setTimeout(() => {
                    setIsRecording(false)
                    // Simulate transcription - insert text into textarea
                    const transcribedText = "Haupthahn klemmt, Mieter war nicht da. "
                    setNotes((prev) => prev + transcribedText)
                  }, 3000)
                }
              }}
              className={`absolute right-3 bottom-3 p-2 rounded-full transition-all ${
                isRecording
                  ? "bg-red-100 text-red-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              aria-label="Sprachnotiz aufnehmen"
            >
              <motion.div
                animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
              >
                <Mic className="w-5 h-5" />
              </motion.div>
            </button>
          </div>
          {isRecording && (
            <p className="text-xs text-red-600 mt-2 flex items-center space-x-1">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              <span>Aufnahme läuft...</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
