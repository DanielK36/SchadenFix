"use client"

export default function HeaderArc() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[280px] h-[90px]">
        {/* Sonnenfinsternis-Effekt: Radialer Gradient nach oben */}
        <div
          className="absolute inset-0 rounded-full"
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
          className="w-full max-w-[280px] h-auto relative z-10"
          aria-label="Goldener Header Arc"
        >
          <defs>
            {/* Goldener Gradient für den Bogen */}
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#FFD700" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3" />
            </linearGradient>
            
            {/* Glow-Filter */}
            <filter id="arcGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Goldener Bogen - dicker und glühend */}
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
  )
}
