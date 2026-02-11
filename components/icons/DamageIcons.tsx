"use client"

import React from "react"

interface IconProps {
  className?: string
  size?: number
  glowColor?: string
}

/**
 * Unified Icon Style Guide:
 * - Thin-line (outlined) style
 * - Base color: rgba(255, 255, 255, 0.75) 
 * - Hover: Full white with colored glow aura
 * - All icons use consistent stroke width (1.5-2)
 */

// Car Icon - Thin Line Style
export function CarIcon({ className = "", size = 32 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M240,112H229.2L201.42,49.5A16,16,0,0,0,186.8,40H69.2a16,16,0,0,0-14.62,9.5L26.8,112H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V192h96v16a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V128h8a8,8,0,0,0,0-16ZM69.2,56H186.8l24.89,56H44.31ZM64,208H40V192H64Zm128,0V192h24v16Zm24-32H40V128H216ZM56,152a8,8,0,0,1,8-8H80a8,8,0,0,1,0,16H64A8,8,0,0,1,56,152Zm112,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H176A8,8,0,0,1,168,152Z" />
    </svg>
  )
}

// Fire Icon - Thin Line Style
export function FireIcon({ className = "", size = 32 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M143.38,17.85a8,8,0,0,0-12.63,3.41l-22,60.41L84.59,58.26a8,8,0,0,0-11.93.89C51,86.29,40,107.89,40,132a88,88,0,0,0,176,0C216,79.63,168.54,35.65,143.38,17.85ZM128,204a52.06,52.06,0,0,1-52-52c0-19.36,8.11-36.59,24.09-51.19l24.58,22.51a8,8,0,0,0,13.22-3.56L157.75,60.3C184.25,84.55,200,110.74,200,132A72.08,72.08,0,0,1,128,204Z" />
    </svg>
  )
}

// Glass/Window Icon - Thin Line Style
export function GlassIcon({ className = "", size = 32 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="32" y="48" width="192" height="160" rx="8" />
      <line x1="128" y1="48" x2="128" y2="208" />
      <line x1="32" y1="128" x2="224" y2="128" />
      {/* Crack effect for "broken glass" */}
      <path d="M168,88l-20,20l12,12l-16,16" strokeDasharray="4 2" opacity="0.6" />
    </svg>
  )
}

// Water/Drop Icon - Thin Line Style
export function WaterIcon({ className = "", size = 32 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M128,24S48,104,48,152a80,80,0,0,0,160,0C208,104,128,24,128,24Z" />
      <path d="M88,176a40,40,0,0,0,80,0c0-40-40-80-40-80S88,136,88,176Z" opacity="0.4" />
    </svg>
  )
}

// Scales/Legal Icon - Thin Line Style  
export function ScalesIcon({ className = "", size = 32 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="128" y1="40" x2="128" y2="216" />
      <line x1="104" y1="216" x2="152" y2="216" />
      <line x1="56" y1="56" x2="200" y2="56" />
      <path d="M24,120l32-64,32,64a32,32,0,0,1-64,0Z" />
      <path d="M168,120l32-64,32,64a32,32,0,0,1-64,0Z" />
      <circle cx="128" cy="56" r="12" />
    </svg>
  )
}
