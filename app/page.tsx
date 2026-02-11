"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { DamageBentoGrid } from "@/components/ui/BentoGrid";
import { persistRefFromUrl } from "@/lib/referral-storage";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { DamageForm } from "@/components/ui/DamageForm";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { ChevronDown } from "lucide-react";

export default function ImmersivePage() {
  const searchParams = useSearchParams();
  const [hasStarted, setHasStarted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTriggeredRef = useRef(false);
  const { scrollY } = useScroll({ container: containerRef });

  // Referral-Code aus URL sofort speichern, damit er beim Formular-Absenden noch da ist
  useEffect(() => {
    persistRefFromUrl(searchParams.get("ref"));
  }, [searchParams]);

  // State für Navigation: 'grid' (Auswahl), 'form' (Details) oder 'success' (Fertig)
  const [view, setView] = useState<'grid' | 'form' | 'success'>('grid');
  const [selectedCategory, setSelectedCategory] = useState("");

  // State für Fortschritt
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  // Wheel-Event für Scroll-Erkennung (nur beim ersten Scrollen)
  React.useEffect(() => {
    if (hasStarted) return; // Keine Scroll-Erkennung mehr, wenn bereits gestartet
    
    let rafId: number | null = null;
    
    const handleWheel = (e: WheelEvent) => {
      // Nach unten scrollen: Starte App (nur beim ersten Mal)
      if (!scrollTriggeredRef.current && e.deltaY > 5) {
        e.preventDefault();
        
        // Verwende requestAnimationFrame für smooth Transition
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          scrollTriggeredRef.current = true;
          setHasStarted(true);
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [hasStarted]);

  // Touch-Event für Mobile-Geräte (nur beim ersten Scrollen)
  React.useEffect(() => {
    if (hasStarted) return; // Keine Scroll-Erkennung mehr, wenn bereits gestartet
    
    let touchStartY = 0;
    let touchStartTime = 0;
    let rafId: number | null = null;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY === 0) return;
      
      // Verhindere immer das Scrollen, wenn noch nicht gestartet
      e.preventDefault();
      
      const touchCurrentY = e.touches[0].clientY;
      const deltaY = touchStartY - touchCurrentY;
      const timeDelta = Date.now() - touchStartTime;
      
      // Nach unten scrollen: Starte App (nur beim ersten Mal)
      // Mindestens 20px Bewegung und nicht zu schnell (um versehentliche Trigger zu vermeiden)
      if (!scrollTriggeredRef.current && deltaY > 20 && timeDelta > 50) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          scrollTriggeredRef.current = true;
          setHasStarted(true);
        });
      }
    };

    const handleTouchEnd = () => {
      touchStartY = 0;
      touchStartTime = 0;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [hasStarted]);

  const handleClick = () => {
    if (!hasStarted && !isVideoPlaying) {
      // Starte Video
      setIsVideoPlaying(true);
      videoRef.current?.play();
      
      // Nach kurzer Verzögerung zur nächsten Phase wechseln
      // (Video läuft im Hintergrund weiter)
      setTimeout(() => {
        setHasStarted(true);
        setIsVideoPlaying(false);
      }, 1500); // 1.5 Sekunden nach Start
    }
  };

  const handleVideoEnd = () => {
    // Fallback: Falls Video doch endet (sollte bei loop nicht passieren)
    setIsVideoPlaying(false);
    setHasStarted(true);
  };

  // LOGIK: Wenn eine Kategorie gewählt wird
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setView('form'); // Wechsel zum Formular
    setCurrentStep(1); // Jetzt sind wir offiziell in Schritt 1
  };

  // LOGIK: Zurück Button im Formular
  const handleBackToGrid = () => {
    setView('grid');
    setCurrentStep(0); // Zurück auf "Bereit" Status
    setSelectedCategory("");
  };

  // LOGIK: Weiter Button im Formular
  const handleFormNext = (step: number) => {
    setCurrentStep(step);
    // Wenn Schritt 4 erreicht, zeigen wir die Success-Seite
    if (step === 4) {
      setView('success');
    }
  };

  const handleReset = () => {
    scrollTriggeredRef.current = false;
    setHasStarted(false);
    setView('grid');
    setCurrentStep(0);
    setIsVideoPlaying(false);
    // Video zurücksetzen
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  };

  return (
    <div 
      ref={containerRef} 
      onClick={() => !hasStarted && setHasStarted(true)}
      className={`relative w-full bg-[#F8FAFC] text-stone-900 font-sans selection:bg-stone-200 transition-colors duration-1000 flex flex-col items-center
        ${hasStarted ? 'h-[100dvh] overflow-hidden justify-start' : 'h-[100dvh] overflow-hidden justify-center touch-none'}
      `}
    >
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         {/* Noise (gibt Textur) */}
         <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply"></div>
         
         {/* TRICK 1: DER LICHT-SPOT 
            Wir machen die Mitte (from-white) heller und ziehen den Verlauf (via-...) weiter nach außen.
            Das "brückt" den Unterschied zwischen dem hellen Video-Start und dem grauen Hintergrund.
         */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[70vh] 
            bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] 
            from-[#F8FAFC] via-[#F8FAFC] to-transparent opacity-100">
         </div>
      </div>

      {/* --- HEADER --- */}
      <motion.div 
        initial={{ y: hasStarted ? -100 : 0, opacity: hasStarted ? 0 : 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full flex flex-col items-center ${hasStarted ? 'pt-12 pb-0' : 'pb-10'}`}
      >
        {/* WÜRFEL / LOGO - PERMANENTER ELEMENT (NIEMALS UNMOUNTEN) */}
        <div className="relative flex justify-center items-center z-10">
            <motion.div
              layout
              transition={{ 
                layout: { 
                  duration: 1.2, 
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: "spring",
                  stiffness: 200,
                  damping: 25
                } 
              }}
              onClick={hasStarted ? handleReset : undefined}
              className={`
                relative overflow-hidden z-10 shadow-2xl will-change-transform
                ${hasStarted 
                  ? 'w-16 h-16 rounded-[1.2rem] mt-0 cursor-pointer hover:scale-105 active:scale-95 [mask-image:radial-gradient(circle_at_center,black_55%,transparent_80%)]' 
                  : 'w-[70vw] max-w-[320px] aspect-square rounded-[2.5rem] mt-0 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_70%)]'
                }
              `}
            >
              <motion.div
                animate={{
                  scale: hasStarted ? 1.25 : 1.1,
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{ willChange: 'transform' }}
                className="w-full h-full"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onEnded={handleVideoEnd}
                  poster="/cube-poster.webp"
                  className="w-full h-full object-cover"
                  style={{
                    filter: hasStarted ? 'brightness(1) contrast(1) saturate(1)' : 'brightness(0.92) contrast(1.08) saturate(0.85)',
                    transition: 'filter 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  }}
                >
                  <source src="/cube-repair-loop.mp4" type="video/mp4" />
                </video>
              </motion.div>
              {/* Overlay für bessere Integration auf Desktop - passt Video an Hintergrund an */}
              {!hasStarted && (
                <motion.div 
                  className="absolute inset-0 bg-[#F8FAFC]/30 mix-blend-overlay pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          </div>

            {/* TEXT BEREICH */}
            <AnimatePresence mode="wait">
              {!hasStarted ? (
                <motion.div 
                  key="hero-text"
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="text-center px-4 mt-6 w-full z-20 max-w-sm"
                >
                  <div className="flex flex-col items-center">
                    <h1 className="text-5xl font-black text-stone-900 tracking-tighter mb-4 leading-[0.9]">Schaden?</h1>
                    <p className="text-stone-500 font-medium tracking-tight">Wir regeln das. <span className="text-stone-900 border-b border-stone-300">Sofort.</span></p>
                  </div>
                </motion.div>
              ) : (
            <motion.div 
              key="header-content"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="text-center px-4 mt-0 w-full max-w-sm relative z-10"
            >
              {view === 'grid' && (
                <>
                  <h2 className="text-2xl font-bold text-stone-900 tracking-tight leading-tight">In 2 Minuten erledigt.</h2>
                  <TrustBadges />
                </>
              )}
              {(view === 'form' || view === 'success') && (
                <div className="h-4"></div>
              )}
            </motion.div>
              )}
            </AnimatePresence>

        {!hasStarted && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 1 }} 
            className="absolute bottom-[-40px] text-stone-400/60"
          >
            <ChevronDown className="animate-bounce w-8 h-8" strokeWidth={1.5} />
          </motion.div>
        )}
      </motion.div>

      {/* --- MAIN CONTENT AREA --- */}
      <AnimatePresence mode="wait">
        {hasStarted && (
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-full flex-1 overflow-y-auto no-scrollbar pt-2"
          >
            {/* ENTWEDER GRID, FORM ODER SUCCESS ANZEIGEN */}
            {view === 'grid' ? (
                 <DamageBentoGrid onSelect={handleCategorySelect} />
            ) : view === 'form' ? (
                 <DamageForm category={selectedCategory} onBack={handleBackToGrid} onNext={handleFormNext} currentStep={currentStep} />
            ) : (
                 <SuccessScreen onReset={handleReset} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FOOTER BAR --- */}
      <AnimatePresence>
        {hasStarted && (
             <ProgressBar step={currentStep} total={totalSteps} />
        )}
      </AnimatePresence>

    </div>
  );
}
