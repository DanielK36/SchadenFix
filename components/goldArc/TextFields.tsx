"use client"

import { forwardRef, TextareaHTMLAttributes, InputHTMLAttributes } from "react"

const baseClasses =
  "w-full bg-[#070C12] border border-[rgba(255,214,106,0.5)] rounded-2xl px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFD66A] transition-colors"

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className = "", ...props },
  ref,
) {
  return <input ref={ref} className={`${baseClasses} ${className}`} {...props} />
})

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { className = "", ...props },
  ref,
) {
  return <textarea ref={ref} className={`${baseClasses} min-h-[140px] resize-none ${className}`} {...props} />
})

