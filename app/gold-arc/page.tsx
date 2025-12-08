"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function GoldArcStartPage() {
  const router = useRouter()
  const [isPressed, setIsPressed] = useState(false)
  const [isGlowing, setIsGlowing] = useState(false)
  const [isZooming, setIsZooming] = useState(false)

  const handleClick = () => {
    setIsPressed(true)
    setIsGlowing(true)
    
    // Portal-Zoom-Effekt starten
    setTimeout(() => {
      setIsZooming(true)
    }, 150)
    
    // Navigation nach Zoom-Effekt
    setTimeout(() => {
      router.push("/gold-arc/melden")
    }, 600)
  }

  return (
    <main className="min-h-screen bg-[#05090E] flex items-center justify-center relative overflow-hidden">
      {/* Portal-Zoom Overlay */}
      <AnimatePresence>
        {isZooming && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Zoom-Effekt: Der Kreis wird riesig und füllt den Bildschirm */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 1, opacity: 1 }}
              animate={{
                scale: [1, 3, 5],
                opacity: [1, 0.8, 0],
              }}
              transition={{
                duration: 0.6,
                ease: "easeIn",
              }}
            >
              {/* Goldener Ring wird riesig */}
              <div className="w-80 h-80 rounded-full border-4 border-[#D4AF37] flex items-center justify-center relative">
                {/* Intensiver Glow beim Zoom */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      "0 0 40px rgba(212,175,55,0.8), 0 0 80px rgba(212,175,55,0.4)",
                      "0 0 200px rgba(212,175,55,1), 0 0 400px rgba(212,175,55,0.8)",
                      "0 0 500px rgba(212,175,55,0.6), 0 0 800px rgba(212,175,55,0.3)",
                    ],
                  }}
                  transition={{ duration: 0.6 }}
                />
                {/* Innerer Kreis - ohne Text beim Zoom */}
                <div className="w-64 h-64 rounded-full bg-[#0A0E13] border-2 border-[#1A1F26] flex items-center justify-center">
                  {/* Text wird beim Zoom ausgeblendet */}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="max-w-[430px] w-full px-6 flex flex-col items-center"
        animate={
          isZooming
            ? {
                scale: [1, 1.2, 2],
                opacity: [1, 0.8, 0],
              }
            : {}
        }
        transition={
          isZooming
            ? {
                duration: 0.6,
                ease: "easeIn",
              }
            : {}
        }
      >
        {/* Der große interaktive Notfall-Knopf */}
        <motion.button
          onClick={handleClick}
          className="relative w-80 h-80 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/30 rounded-full"
          whileTap={{ scale: 0.95 }}
          animate={isPressed || isZooming ? {} : { scale: [1, 1.02, 1] }}
          transition={
            isPressed || isZooming
              ? { duration: 0.1 }
              : {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          {/* Glow-Effekt beim Klick */}
          {isGlowing && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 1.3, 1.5] }}
              transition={{ duration: 0.4 }}
              style={{
                background: "radial-gradient(circle, rgba(212,175,55,0.6) 0%, transparent 70%)",
              }}
            />
          )}

          {/* Pulsierender goldener Ring (Ruhezustand) */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-[#D4AF37]"
            animate={
              isPressed || isZooming
                ? {}
                : {
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.05, 1],
                  }
            }
            transition={
              isPressed || isZooming
                ? {}
                : {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
            style={{
              boxShadow: isGlowing
                ? "0 0 40px rgba(212,175,55,0.8), 0 0 80px rgba(212,175,55,0.4)"
                : "0 0 20px rgba(212,175,55,0.3)",
            }}
          />

          {/* Innerer dunkler Kreis */}
          <div className="relative w-64 h-64 rounded-full bg-[#0A0E13] border-2 border-[#1A1F26] flex items-center justify-center z-10">
            {/* Text "Schaden?" */}
            <motion.h1
              className="text-4xl font-semibold text-[#FFF7E5] text-center"
              animate={
                isZooming
                  ? { opacity: 0, scale: 0.8 }
                  : isPressed
                    ? { scale: 0.95 }
                    : {}
              }
              transition={
                isZooming
                  ? { duration: 0.2, ease: "easeIn" }
                  : { duration: 0.1 }
              }
            >
              Schaden?
            </motion.h1>
          </div>
        </motion.button>

        {/* Text unter dem Kreis - ebenfalls klickbar */}
        <motion.button
          onClick={handleClick}
          className="mt-8 text-center text-gray-200 text-sm cursor-pointer hover:text-[#D4AF37] transition-colors focus:outline-none"
          whileTap={{ scale: 0.95 }}
        >
          Tippen Sie hier, wir kümmern uns sofort.
        </motion.button>
      </motion.div>
    </main>
  )
}
