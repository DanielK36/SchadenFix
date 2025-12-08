"use client"

import { ButtonHTMLAttributes } from "react"

type GoldButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
}

export default function GoldButton({ label, className = "", ...props }: GoldButtonProps) {
  return (
    <button
      {...props}
      className={`w-full rounded-full py-3 text-sm font-semibold text-black bg-gradient-to-r from-[#FFD66A] to-[#F7B84B] shadow-[0_0_20px_rgba(247,184,75,0.45)] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {label}
    </button>
  )
}

