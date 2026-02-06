"use client"

import React, { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Clock, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

function formatTimeRemaining(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${seconds}s`
}

export function SessionTimeoutDialog() {
  const { logout, extendSession, sessionTimeRemaining, isAuthenticated } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [showExpired, setShowExpired] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    const handleSessionWarning = (event: CustomEvent<{ remaining: number }>) => {
      setShowWarning(true)
      setCountdown(event.detail.remaining)
    }

    const handleSessionExpired = () => {
      setShowWarning(false)
      setShowExpired(true)
    }

    window.addEventListener("session-warning", handleSessionWarning as EventListener)
    window.addEventListener("session-expired", handleSessionExpired as EventListener)

    return () => {
      window.removeEventListener("session-warning", handleSessionWarning as EventListener)
      window.removeEventListener("session-expired", handleSessionExpired as EventListener)
    }
  }, [])

  // Update countdown
  useEffect(() => {
    if (!showWarning || !sessionTimeRemaining) return

    setCountdown(sessionTimeRemaining)

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (!prev || prev <= 1000) {
          clearInterval(interval)
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [showWarning, sessionTimeRemaining])

  const handleExtendSession = () => {
    extendSession()
    setShowWarning(false)
  }

  const handleLogout = async () => {
    await logout()
    setShowWarning(false)
    setShowExpired(false)
  }

  if (!isAuthenticated) return null

  return (
    <>
      {/* Session Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Session Expiring Soon
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Your session will expire in{" "}
                <span className="font-semibold text-warning">
                  {countdown ? formatTimeRemaining(countdown) : "a few minutes"}
                </span>{" "}
                due to inactivity.
              </p>
              <p>Would you like to continue your session?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
            <AlertDialogAction onClick={handleExtendSession}>
              Continue Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Expired Dialog */}
      <AlertDialog open={showExpired}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Clock className="h-5 w-5" />
              Session Expired
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your session has expired due to inactivity. Please log in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLogout}>
              Go to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
