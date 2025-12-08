"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Drop, Scales } from "phosphor-react"
import { CarIcon, FireIcon, GlassIcon } from "@/components/icons/DamageIcons"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
}

export default function GoldArcMeldenPage() {
  const router = useRouter()

  const handleSelect = (key: string) => {
    router.push(`/gold-arc/beschreibung?type=${key}`)
  }

  return (
    <main className="min-h-screen lg:overflow-hidden flex flex-col lg:justify-center items-center relative bg-[#050505] py-12 lg:py-20">
      {/* SVG Gradients Definition - Global */}
      <svg width="0" height="0" className="absolute z-0">
        <defs>
          {/* KFZ: Gold zu Gelb */}
          <linearGradient id="gradient-kfz" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
          
          {/* Glas: Türkis zu Cyan */}
          <linearGradient id="gradient-glas" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          
          {/* Wasserschaden: Hellblau zu Dunkelblau */}
          <linearGradient id="gradient-wasser" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          
          {/* Feuerschaden: Rot zu Orange */}
          <linearGradient id="gradient-feuer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          
          {/* Rechtsfall: Ice Blue / Indigo */}
          <linearGradient id="gradient-recht" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header - Relativ positioniert mit festem Margin */}
      <div className="relative w-full text-center z-10 shrink-0 mb-8">
        <p className="text-xs md:text-sm text-neutral-500 uppercase tracking-widest mb-2 md:mb-3">
          Schadenportal
        </p>
        <div className="flex justify-center mb-2 md:mb-4">
          <div className="relative w-full max-w-[280px] md:max-w-[400px] h-[70px] md:h-[100px]">
            {/* Sonnenfinsternis-Effekt */}
            <div
              className="absolute inset-0 rounded-full z-0"
              style={{
                background: "radial-gradient(ellipse 140px 45px at 50% 0%, rgba(212, 175, 55, 0.5) 0%, rgba(212, 175, 55, 0.2) 30%, transparent 70%)",
                filter: "blur(8px)",
              }}
            />
            {/* Haupt-Bogen */}
            <svg
              width="280"
              height="90"
              viewBox="0 0 280 90"
              className="w-full max-w-[280px] md:max-w-[400px] h-auto relative z-10"
            >
              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#FFD700" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3" />
                </linearGradient>
                <filter id="arcGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 10 45 Q 140 -15 270 45"
                fill="none"
                stroke="url(#arcGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#arcGlow)"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(212,175,55,0.6)) drop-shadow(0 0 16px rgba(212,175,55,0.3))",
                }}
              />
            </svg>
          </div>
        </div>
        <h1 className="text-xl md:text-3xl font-light text-white mb-1 tracking-wide">
          Welche Art von Schaden?
        </h1>
        <p className="text-xs md:text-base text-neutral-400 font-light">
          Ein Klick – wir übernehmen.
        </p>
      </div>

      {/* Grid - Mobile: Grid, Desktop: Flex */}
      <motion.div
        className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-xs mx-auto lg:flex lg:flex-wrap lg:justify-center lg:gap-6 lg:max-w-[800px] px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* KFZ */}
        <motion.button
          key="KFZ"
          onClick={() => handleSelect("KFZ")}
          variants={cardVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative bg-[#111] border border-white/10 rounded-3xl w-full aspect-square lg:w-52 lg:h-52 flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-white/5"
        >
          <CarIcon className="w-12 h-12 lg:w-16 lg:h-16" />
          <span className="text-xs lg:text-sm font-light text-neutral-300 relative z-10">KFZ</span>
        </motion.button>

        {/* Glas */}
        <motion.button
          key="GLAS"
          onClick={() => handleSelect("GLAS")}
          variants={cardVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative bg-[#111] border border-white/10 rounded-3xl w-full aspect-square lg:w-52 lg:h-52 flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-white/5"
        >
          <GlassIcon className="w-12 h-12 lg:w-16 lg:h-16" />
          <span className="text-xs lg:text-sm font-light text-neutral-300 relative z-10">Glas</span>
        </motion.button>

        {/* Wasser */}
        <motion.button
          key="WASSER"
          onClick={() => handleSelect("GEBAEUDE")}
          variants={cardVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative bg-[#111] border border-white/10 rounded-3xl w-full aspect-square lg:w-52 lg:h-52 flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-white/5"
        >
          <Drop weight="fill" className="w-12 h-12 lg:w-16 lg:h-16" style={{ color: "#60A5FA" }} />
          <span className="text-xs lg:text-sm font-light text-neutral-300 relative z-10">Wasser</span>
        </motion.button>

        {/* Feuer */}
        <motion.button
          key="FEUER"
          onClick={() => handleSelect("FEUER")}
          variants={cardVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative bg-[#111] border border-white/10 rounded-3xl w-full aspect-square lg:w-52 lg:h-52 flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-white/5"
        >
          <FireIcon className="w-12 h-12 lg:w-16 lg:h-16" />
          <span className="text-xs lg:text-sm font-light text-neutral-300 relative z-10">Feuer</span>
        </motion.button>

        {/* Rechtsfall - volle Breite auf Mobile (col-span-2), normale Größe auf Desktop */}
        <motion.button
          key="RECHT"
          onClick={() => handleSelect("RECHT")}
          variants={cardVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative bg-[#111] border border-white/10 rounded-3xl w-full aspect-[2/1] lg:w-52 lg:h-52 lg:aspect-square col-span-2 lg:col-span-1 flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-white/5"
        >
          <Scales weight="fill" className="w-12 h-12 lg:w-20 lg:h-20 transform lg:scale-125" style={{ color: "#818CF8" }} />
          <span className="text-xs lg:text-sm font-light text-neutral-300 relative z-10">Rechtsfall</span>
        </motion.button>
      </motion.div>

      {/* Footer - Relativ positioniert am Ende */}
      <footer className="relative w-full mt-auto pt-8 pb-6 lg:pb-8 z-10">
        <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm text-neutral-500">
          <a href="/impressum" className="hover:text-neutral-400 transition-colors">
            Impressum
          </a>
          <span>•</span>
          <a href="/datenschutz" className="hover:text-neutral-400 transition-colors">
            Datenschutz
          </a>
        </div>
      </footer>
    </main>
  )
}
