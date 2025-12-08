"use client"

interface PillTagProps {
  label: string
  active?: boolean
  onClick?: () => void
}

export default function PillTag({ label, active = false, onClick }: PillTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
        active ? "border-[#FFD66A] bg-[#FFD66A] text-black" : "border-[rgba(255,214,106,0.5)] text-gray-200"
      }`}
    >
      {label}
    </button>
  )
}

