"use client"

import React from "react"
import { useAuth, type Permission } from "@/contexts/auth-context"
import type { Role } from "@/services/types"
import { Loader2, ShieldAlert, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

// ── Loading State ────────────────────────────────────────────

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying authentication...</p>
      </div>
    </div>
  )
}

// ── Unauthorized State ───────────────────────────────────────

function Unauthorized({
  message = "You are not authorized to access this page.",
  showLogin = true,
}: {
  message?: string
  showLogin?: boolean
}) {
  const handleLogin = () => {
    window.location.href = "/"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
        {showLogin && (
          <Button onClick={handleLogin} className="mt-2">
            Go to Login
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Forbidden State (wrong role) ─────────────────────────────

function Forbidden({
  requiredRoles,
  currentRole,
}: {
  requiredRoles: Role[]
  currentRole?: Role
}) {
  const handleBack = () => {
    window.history.back()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <div className="rounded-full bg-warning/10 p-4">
          <Lock className="h-10 w-10 text-warning" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Insufficient Permissions</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          This page requires {requiredRoles.join(" or ")} access.
          {currentRole && ` Your current role is ${currentRole}.`}
        </p>
        <Button variant="outline" onClick={handleBack} className="mt-2">
          Go Back
        </Button>
      </div>
    </div>
  )
}

// ── Protected Route Props ────────────────────────────────────

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Required roles (any of listed roles grants access) */
  roles?: Role | Role[]
  /** Required permissions (all must be satisfied) */
  permissions?: Permission | Permission[]
  /** Custom loading component */
  loadingComponent?: React.ReactNode
  /** Custom unauthorized component */
  unauthorizedComponent?: React.ReactNode
  /** Redirect URL instead of showing unauthorized */
  redirectTo?: string
}

// ── Protected Route Component ────────────────────────────────

export function ProtectedRoute({
  children,
  roles,
  permissions,
  loadingComponent,
  unauthorizedComponent,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, status, hasRole, hasPermission } = useAuth()

  // Loading state
  if (status === "loading") {
    return <>{loadingComponent ?? <AuthLoading />}</>
  }

  // Not authenticated
  if (status === "unauthenticated" || !user) {
    if (redirectTo) {
      if (typeof window !== "undefined") {
        window.location.href = redirectTo
      }
      return <AuthLoading />
    }
    return <>{unauthorizedComponent ?? <Unauthorized />}</>
  }

  // Check role requirements
  if (roles) {
    const roleArray = Array.isArray(roles) ? roles : [roles]
    if (!hasRole(roleArray)) {
      return <Forbidden requiredRoles={roleArray} currentRole={user.role} />
    }
  }

  // Check permission requirements
  if (permissions) {
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
    const hasAllPermissions = permissionArray.every((p) => hasPermission(p))
    if (!hasAllPermissions) {
      return (
        <Unauthorized message="You do not have the required permissions to access this page." />
      )
    }
  }

  // All checks passed
  return <>{children}</>
}

// ── Permission Gate Component ────────────────────────────────
// For conditionally rendering UI elements based on permissions

interface PermissionGateProps {
  children: React.ReactNode
  /** Required permissions (all must be satisfied) */
  permissions?: Permission | Permission[]
  /** Required roles (any grants access) */
  roles?: Role | Role[]
  /** Fallback content if not authorized */
  fallback?: React.ReactNode
}

export function PermissionGate({
  children,
  permissions,
  roles,
  fallback = null,
}: PermissionGateProps) {
  const { hasRole, hasPermission, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  // Check roles
  if (roles) {
    const roleArray = Array.isArray(roles) ? roles : [roles]
    if (!hasRole(roleArray)) {
      return <>{fallback}</>
    }
  }

  // Check permissions
  if (permissions) {
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
    if (!permissionArray.every((p) => hasPermission(p))) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

// ── Role Gate Component ──────────────────────────────────────
// Shorthand for role-only checks

interface RoleGateProps {
  children: React.ReactNode
  roles: Role | Role[]
  fallback?: React.ReactNode
}

export function RoleGate({ children, roles, fallback = null }: RoleGateProps) {
  return (
    <PermissionGate roles={roles} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}
