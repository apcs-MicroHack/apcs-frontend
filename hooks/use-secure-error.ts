"use client"

import { useCallback } from "react"
import { maskEmail, maskPhone } from "@/lib/security"

// ── Secure Error Messages ────────────────────────────────────

const GENERIC_ERROR = "An unexpected error occurred. Please try again."
const NETWORK_ERROR = "Unable to connect. Please check your internet connection."
const SESSION_ERROR = "Your session has expired. Please log in again."

// Patterns that indicate sensitive data in error messages
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /password/i,
  /secret/i,
  /token/i,
  /bearer/i,
  /authorization/i,
  /credit[_-]?card/i,
  /ssn|social[_-]?security/i,
  /\b\d{16}\b/,  // Credit card numbers
  /\b\d{9}\b/,   // SSN
]

// Known safe error codes that can be shown to users
const SAFE_ERROR_CODES: Record<string, string> = {
  "INVALID_CREDENTIALS": "Invalid email or password.",
  "USER_NOT_FOUND": "Account not found.",
  "USER_DISABLED": "This account has been disabled.",
  "EMAIL_NOT_VERIFIED": "Please verify your email address.",
  "INVALID_OTP": "Invalid verification code.",
  "OTP_EXPIRED": "Verification code has expired.",
  "BOOKING_NOT_FOUND": "Booking not found.",
  "SLOT_UNAVAILABLE": "This time slot is no longer available.",
  "CAPACITY_FULL": "Terminal capacity is full for this time.",
  "DUPLICATE_BOOKING": "A booking already exists for this time.",
  "VALIDATION_ERROR": "Please check your input and try again.",
  "RATE_LIMITED": "Too many requests. Please wait before trying again.",
  "PERMISSION_DENIED": "You don't have permission to perform this action.",
  "RESOURCE_LOCKED": "This resource is currently locked.",
}

// ── Error Sanitization ───────────────────────────────────────

function containsSensitiveData(message: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(message))
}

function sanitizeErrorMessage(error: unknown): string {
  // Handle network errors
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return NETWORK_ERROR
  }

  // Extract error details
  const axiosError = error as any
  const status = axiosError?.response?.status
  const errorCode = axiosError?.response?.data?.code
  const errorMessage = axiosError?.response?.data?.error ?? axiosError?.message

  // Handle authentication errors
  if (status === 401) {
    return SESSION_ERROR
  }

  // Check for known safe error codes
  if (errorCode && SAFE_ERROR_CODES[errorCode]) {
    return SAFE_ERROR_CODES[errorCode]
  }

  // If we have a message, sanitize it
  if (typeof errorMessage === "string") {
    // Check for sensitive data
    if (containsSensitiveData(errorMessage)) {
      return GENERIC_ERROR
    }

    // Limit message length
    if (errorMessage.length > 200) {
      return GENERIC_ERROR
    }

    // Remove stack traces and technical details
    const cleanMessage = errorMessage
      .replace(/at\s+\S+\s*\([^)]+\)/g, "")
      .replace(/Error:\s*/i, "")
      .replace(/\s+/g, " ")
      .trim()

    return cleanMessage || GENERIC_ERROR
  }

  return GENERIC_ERROR
}

// ── Hook ─────────────────────────────────────────────────────

interface UseSecureErrorReturn {
  /** Sanitize an error for display to users */
  sanitizeError: (error: unknown) => string
  /** Check if error is a network error */
  isNetworkError: (error: unknown) => boolean
  /** Check if error is an auth error */
  isAuthError: (error: unknown) => boolean
  /** Get masked email for error display */
  maskEmail: (email: string) => string
  /** Get masked phone for error display */
  maskPhone: (phone: string) => string
}

/**
 * Hook for secure error handling that prevents
 * sensitive information leakage in error messages
 */
export function useSecureError(): UseSecureErrorReturn {
  const sanitizeError = useCallback((error: unknown): string => {
    return sanitizeErrorMessage(error)
  }, [])

  const isNetworkError = useCallback((error: unknown): boolean => {
    return (
      error instanceof TypeError ||
      (error as any)?.code === "ECONNREFUSED" ||
      (error as any)?.message === "Network Error"
    )
  }, [])

  const isAuthError = useCallback((error: unknown): boolean => {
    const status = (error as any)?.response?.status
    return status === 401 || status === 403
  }, [])

  return {
    sanitizeError,
    isNetworkError,
    isAuthError,
    maskEmail,
    maskPhone,
  }
}

/**
 * Standalone sanitize function for use outside React components
 */
export { sanitizeErrorMessage as sanitizeError }
