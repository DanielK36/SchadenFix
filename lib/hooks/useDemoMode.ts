"use client"

import { useDemoMode as useDemoModeContext } from "@/lib/contexts/DemoContext"

/**
 * Hook to access demo mode state
 * Re-exports useDemoMode from context for convenience
 */
export function useDemoMode() {
  return useDemoModeContext()
}
