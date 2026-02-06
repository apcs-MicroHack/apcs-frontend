"use client"

import React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { SessionTimeoutDialog } from "@/components/auth/session-timeout-dialog"

interface SecurityProviderProps {
  children: React.ReactNode
}

/**
 * Security Provider wraps the application with authentication context
 * and session management components.
 *
 * Features:
 * - Authentication state management
 * - Role-based access control
 * - Session timeout with warning dialog
 * - Permission checking
 */
export function SecurityProvider({ children }: SecurityProviderProps) {
  return (
    <AuthProvider>
      <SessionTimeoutDialog />
      {children}
    </AuthProvider>
  )
}
