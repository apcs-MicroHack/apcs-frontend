"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { checkRateLimit, getRateLimitReset, clearRateLimit } from "@/lib/security"

interface UseRateLimitOptions {
  /** Unique key for this rate limit */
  key: string
  /** Maximum allowed attempts in the window */
  maxAttempts: number
  /** Time window in milliseconds */
  windowMs: number
  /** Callback when rate limit is exceeded */
  onLimited?: (remainingMs: number) => void
}

interface UseRateLimitReturn {
  /** Check if action is allowed */
  checkLimit: () => boolean
  /** Whether currently rate limited */
  isLimited: boolean
  /** Remaining ms until reset (0 if not limited) */
  resetIn: number
  /** Reset the rate limit */
  reset: () => void
  /** Number of remaining attempts */
  remainingAttempts: number
}

/**
 * Hook for client-side rate limiting of actions
 *
 * @example
 * const { checkLimit, isLimited, resetIn } = useRateLimit({
 *   key: "login-attempts",
 *   maxAttempts: 5,
 *   windowMs: 60000, // 1 minute
 * })
 *
 * const handleSubmit = () => {
 *   if (!checkLimit()) {
 *     toast.error(`Too many attempts. Try again in ${Math.ceil(resetIn / 1000)}s`)
 *     return
 *   }
 *   // proceed with action
 * }
 */
export function useRateLimit({
  key,
  maxAttempts,
  windowMs,
  onLimited,
}: UseRateLimitOptions): UseRateLimitReturn {
  const [isLimited, setIsLimited] = useState(false)
  const [resetIn, setResetIn] = useState(0)
  const [remainingAttempts, setRemainingAttempts] = useState(maxAttempts)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update resetIn countdown
  useEffect(() => {
    if (!isLimited) return

    intervalRef.current = setInterval(() => {
      const remaining = getRateLimitReset(key)
      setResetIn(remaining)
      if (remaining <= 0) {
        setIsLimited(false)
        setRemainingAttempts(maxAttempts)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isLimited, key, maxAttempts])

  const checkLimit = useCallback((): boolean => {
    const allowed = checkRateLimit(key, maxAttempts, windowMs)

    if (!allowed) {
      const remaining = getRateLimitReset(key)
      setIsLimited(true)
      setResetIn(remaining)
      setRemainingAttempts(0)
      onLimited?.(remaining)
      return false
    }

    // Update remaining attempts (rough estimate)
    setRemainingAttempts((prev) => Math.max(0, prev - 1))
    return true
  }, [key, maxAttempts, windowMs, onLimited])

  const reset = useCallback(() => {
    clearRateLimit(key)
    setIsLimited(false)
    setResetIn(0)
    setRemainingAttempts(maxAttempts)
  }, [key, maxAttempts])

  return {
    checkLimit,
    isLimited,
    resetIn,
    reset,
    remainingAttempts,
  }
}

/**
 * Format remaining time for display
 */
export function formatRateLimitTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000)
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""}`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`
}
