"use client"

interface SuccessBarProps {
  step: number
  total?: number
}

export default function SuccessBar({ step, total = 2 }: SuccessBarProps) {
  const segments = Array.from({ length: total }, (_, idx) => idx + 1)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {segments.map((value) => (
          <div
            key={value}
            className={`flex-1 h-1.5 rounded-full ${
              value <= step ? "bg-gradient-to-r from-[#FFD66A] via-[#F7B84B] to-[#FFD66A]" : "bg-[#1f1f28]"
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#FFD66A]/80 text-center">
        Schritt {step} von {total}
      </p>
    </div>
  )
}

