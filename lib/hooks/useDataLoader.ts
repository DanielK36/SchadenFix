"use client"

import { useState, useEffect, useCallback } from "react"
import { useDemoMode } from "./useDemoMode"

/**
 * Generic hook for loading data in demo mode vs real mode
 * @param loadRealData Function that loads real data from API/DB
 * @param mockData Mock data to use in demo mode
 * @returns Object with data, loading state, and error
 */
export function useDataLoader<T>(
  loadRealData: () => Promise<T>,
  mockData: T
): {
  data: T | null
  loading: boolean
  error: Error | null
  reload: () => Promise<void>
} {
  const { isDemoMode } = useDemoMode()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (isDemoMode) {
        // Use mock data in demo mode
        setData(mockData)
      } else {
        // Load real data
        const realData = await loadRealData()
        setData(realData)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load data")
      setError(error)
      // Fallback to mock data on error (only if not in demo mode)
      if (!isDemoMode) {
        setData(mockData)
      }
    } finally {
      setLoading(false)
    }
  }, [isDemoMode, loadRealData, mockData])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    reload: loadData,
  }
}
