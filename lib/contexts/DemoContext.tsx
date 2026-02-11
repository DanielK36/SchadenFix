"use client"

import React, { createContext, useContext, useState } from "react"

interface DemoContextType {
  isDemoMode: boolean
  setIsDemoMode: (value: boolean) => void
  toggleDemoMode: () => void
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

function getInitialDemoMode(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem("demoMode") === "true"
  } catch {
    return false
  }
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoModeState] = useState(getInitialDemoMode)

  const setIsDemoMode = (value: boolean) => {
    setIsDemoModeState(value)
    localStorage.setItem("demoMode", value ? "true" : "false")
  }

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode)
  }

  return (
    <DemoContext.Provider value={{ isDemoMode, setIsDemoMode, toggleDemoMode }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoMode() {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoProvider")
  }
  return context
}
