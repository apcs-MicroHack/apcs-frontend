"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react"
import type { User, Role, LoginResponse } from "@/services/types"

// ── Session Configuration ────────────────────────────────────

const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes of inactivity
const WARNING_BEFORE_MS = 5 * 60 * 1000 // Show warning 5 minutes before timeout
const ACTIVITY_THROTTLE_MS = 30 * 1000 // Throttle activity detection

// ── Auth State Types ─────────────────────────────────────────

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  verifyOtp: (userId: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  hasRole: (roles: Role | Role[]) => boolean
  hasPermission: (permission: Permission) => boolean
  sessionTimeRemaining: number | null
  extendSession: () => void
}

interface LoginResult {
  success: boolean
  requires2FA?: boolean
  userId?: string
  user?: User
  error?: string
}

// ── Permission Definitions ───────────────────────────────────

export type Permission =
  | "bookings:read"
  | "bookings:write"
  | "bookings:delete"
  | "users:read"
  | "users:write"
  | "users:delete"
  | "terminals:read"
  | "terminals:write"
  | "reports:read"
  | "reports:export"
  | "notifications:manage"
  | "capacity:manage"
  | "fleet:read"
  | "fleet:write"

// Role-based permission matrix
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "bookings:read",
    "bookings:write",
    "bookings:delete",
    "users:read",
    "users:write",
    "users:delete",
    "terminals:read",
    "terminals:write",
    "reports:read",
    "reports:export",
    "notifications:manage",
    "capacity:manage",
    "fleet:read",
    "fleet:write",
  ],
  OPERATOR: [
    "bookings:read",
    "bookings:write",
    "capacity:manage",
    "reports:read",
    "notifications:manage",
  ],
  CARRIER: [
    "bookings:read",
    "bookings:write",
    "fleet:read",
    "fleet:write",
    "reports:read",
  ],
}

// ── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null)

  const lastActivityRef = useRef<number>(Date.now())
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningShownRef = useRef(false)

  // ── Initialize auth state ────────────────────────────────

  const checkAuth = useCallback(async () => {
    try {
      const { authService } = await import("@/services")
      const userData = await authService.getProfile()
      setUser(userData)
      setStatus("authenticated")
      lastActivityRef.current = Date.now()
    } catch {
      setUser(null)
      setStatus("unauthenticated")
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // ── Session timeout management ───────────────────────────

  const updateSessionTime = useCallback(() => {
    const elapsed = Date.now() - lastActivityRef.current
    const remaining = SESSION_TIMEOUT_MS - elapsed

    if (remaining <= 0) {
      // Session expired
      setSessionTimeRemaining(0)
      void handleSessionTimeout()
    } else {
      setSessionTimeRemaining(remaining)

      // Show warning before timeout
      if (remaining <= WARNING_BEFORE_MS && !warningShownRef.current) {
        warningShownRef.current = true
        // Dispatch custom event for UI to show warning
        window.dispatchEvent(
          new CustomEvent("session-warning", { detail: { remaining } })
        )
      }
    }
  }, [])

  const handleSessionTimeout = async () => {
    window.dispatchEvent(new CustomEvent("session-expired"))
    await logout()
  }

  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now()
    warningShownRef.current = false
    setSessionTimeRemaining(SESSION_TIMEOUT_MS)
  }, [])

  // Track user activity
  useEffect(() => {
    if (status !== "authenticated") return

    let lastThrottledUpdate = 0

    const handleActivity = () => {
      const now = Date.now()
      if (now - lastThrottledUpdate > ACTIVITY_THROTTLE_MS) {
        lastActivityRef.current = now
        warningShownRef.current = false
        lastThrottledUpdate = now
      }
    }

    const events = ["mousedown", "keydown", "touchstart", "scroll"]
    events.forEach((event) => window.addEventListener(event, handleActivity))

    // Update session time every 10 seconds
    sessionTimerRef.current = setInterval(updateSessionTime, 10000)
    updateSessionTime()

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity))
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
    }
  }, [status, updateSessionTime])

  // ── Auth methods ─────────────────────────────────────────

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      try {
        const { authService } = await import("@/services")
        const result = await authService.login(email, password)

        if ("requires2FA" in result && result.requires2FA) {
          return {
            success: false,
            requires2FA: true,
            userId: result.userId,
          }
        }

        // Type guard passed - result is LoginResponse
        const loginResult = result as LoginResponse
        setUser(loginResult.user)
        setStatus("authenticated")
        lastActivityRef.current = Date.now()

        return { success: true, user: loginResult.user }
      } catch (err: unknown) {
        const error =
          (err as any)?.response?.data?.error ??
          (err as Error).message ??
          "Login failed"
        return { success: false, error }
      }
    },
    []
  )

  const verifyOtp = useCallback(async (userId: string, otp: string) => {
    const { authService } = await import("@/services")
    const result = await authService.verifyOtp(userId, otp)
    setUser(result.user)
    setStatus("authenticated")
    lastActivityRef.current = Date.now()
  }, [])

  const logout = useCallback(async () => {
    try {
      const { authService } = await import("@/services")
      await authService.logout()
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null)
      setStatus("unauthenticated")
      setSessionTimeRemaining(null)
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { authService } = await import("@/services")
      const userData = await authService.getProfile()
      setUser(userData)
    } catch {
      // User refresh failed, might need to re-auth
    }
  }, [])

  // ── Role & Permission checks ─────────────────────────────

  const hasRole = useCallback(
    (roles: Role | Role[]): boolean => {
      if (!user) return false
      const roleArray = Array.isArray(roles) ? roles : [roles]
      return roleArray.includes(user.role)
    },
    [user]
  )

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false
      const permissions = ROLE_PERMISSIONS[user.role] || []
      return permissions.includes(permission)
    },
    [user]
  )

  // ── Context value ────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    status,
    isAuthenticated: status === "authenticated",
    login,
    verifyOtp,
    logout,
    refreshUser,
    hasRole,
    hasPermission,
    sessionTimeRemaining,
    extendSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hooks ────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useUser() {
  const { user } = useAuth()
  return user
}

export function usePermissions() {
  const { hasPermission, hasRole } = useAuth()
  return { hasPermission, hasRole }
}
