"use client"

import React from "react"

import { useState } from "react"
import Image from "next/image"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRateLimit, formatRateLimitTime } from "@/hooks/use-rate-limit"
import { rules, validate } from "@/lib/security"
import type { LoginResponse } from "@/services/types"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSent, setResetSent] = useState(false)

  // 2FA state
  const [needs2FA, setNeeds2FA] = useState(false)
  const [otpUserId, setOtpUserId] = useState("")
  const [otp, setOtp] = useState("")

  // Rate limiting for login attempts
  const loginRateLimit = useRateLimit({
    key: "login-attempts",
    maxAttempts: 5,
    windowMs: 60 * 1000, // 1 minute
  })

  // Rate limiting for OTP attempts
  const otpRateLimit = useRateLimit({
    key: `otp-attempts-${otpUserId}`,
    maxAttempts: 3,
    windowMs: 60 * 1000,
  })

  // Rate limiting for password reset
  const resetRateLimit = useRateLimit({
    key: "password-reset",
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Rate limit check
    if (!loginRateLimit.checkLimit()) {
      setError(`Too many login attempts. Please try again in ${formatRateLimitTime(loginRateLimit.resetIn)}.`)
      return
    }

    // Input validation
    const emailValidation = validate(email, [
      rules.required("Email is required"),
      rules.email(),
      rules.noScriptTags(),
    ])
    if (!emailValidation.valid) {
      setError(emailValidation.errors[0])
      return
    }

    const passwordValidation = validate(password, [
      rules.required("Password is required"),
      rules.minLength(1),
      rules.noScriptTags(),
    ])
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0])
      return
    }

    setIsLoading(true)

    try {
      const { authService } = await import("@/services")
      // Trim and lowercase email (no HTML sanitization needed for API data)
      const result = await authService.login(email.trim().toLowerCase(), password)

      // Backend asked for OTP verification
      if ("requires2FA" in result && result.requires2FA) {
        setNeeds2FA(true)
        setOtpUserId(result.userId)
        setIsLoading(false)
        loginRateLimit.reset() // Reset rate limit on successful first factor
        return
      }

      // Normal login — route by role (result is now LoginResponse)
      const loginResult = result as LoginResponse
      loginRateLimit.reset()
      const role = loginResult.user.role
      if (role === "ADMIN") window.location.href = "/admin"
      else if (role === "OPERATOR") window.location.href = "/operator"
      else window.location.href = "/carrier"
    } catch (err: unknown) {
      console.error("Login error:", err)
      const axiosErr = err as any
      // Handle network/CORS errors
      if (axiosErr?.code === "ERR_NETWORK") {
        setError("Unable to connect to server. Please check your connection.")
      } else if (axiosErr?.message) {
        // Show more details for debugging
        setError(axiosErr?.response?.data?.error ?? axiosErr.message)
      } else {
        setError(axiosErr?.response?.data?.error ?? "Invalid credentials")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Rate limit check
    if (!otpRateLimit.checkLimit()) {
      setError(`Too many OTP attempts. Please try again in ${formatRateLimitTime(otpRateLimit.resetIn)}.`)
      return
    }

    // OTP validation
    const otpValidation = validate(otp, [
      rules.required("OTP is required"),
      rules.minLength(6),
      rules.maxLength(6),
      rules.alphanumeric("OTP must be numeric"),
    ])
    if (!otpValidation.valid) {
      setError(otpValidation.errors[0])
      return
    }

    setIsLoading(true)
    try {
      const { authService } = await import("@/services")
      const result = await authService.verifyOtp(otpUserId, otp.trim())
      otpRateLimit.reset()
      const role = result.user.role
      if (role === "ADMIN") window.location.href = "/admin"
      else if (role === "OPERATOR") window.location.href = "/operator"
      else window.location.href = "/carrier"
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.error ?? "Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Rate limit check
    if (!resetRateLimit.checkLimit()) {
      setError(`Too many reset attempts. Please try again in ${formatRateLimitTime(resetRateLimit.resetIn)}.`)
      return
    }

    // Email validation
    const emailValidation = validate(resetEmail, [
      rules.required("Email is required"),
      rules.email(),
    ])
    if (!emailValidation.valid) {
      setError(emailValidation.errors[0])
      return
    }

    setIsLoading(true)

    try {
      const { authService } = await import("@/services")
      await authService.forgotPassword(resetEmail.trim().toLowerCase())
    } catch {
      // silently succeed to not reveal account existence
    }

    setResetSent(true)
    setIsLoading(false)

    setTimeout(() => {
      setShowForgotPassword(false)
      setResetSent(false)
      setResetEmail("")
    }, 3000)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding / Hero */}
      <div className="relative hidden w-[55%] lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/port-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-[hsl(215,70%,10%)]/80" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          {/* Logo area */}
          <div className="flex items-center gap-3">
            <Image
              src="/apcs-logo-white.svg"
              alt="APCS Logo"
              width={200}
              height={80}
              className="h-20 w-auto"
            />
          </div>

          {/* Center content */}
          <div className="max-w-lg">
            <h2 className="font-heading text-4xl font-bold leading-tight text-[hsl(0,0%,100%)] text-balance">
              Streamline Your Port Operations
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[hsl(210,20%,75%)]">
              Manage bookings, monitor capacity, and optimize container logistics with our unified maritime platform.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6">
              <div className="rounded-lg border border-[hsl(215,40%,25%)] bg-[hsl(215,60%,12%)]/50 p-4 backdrop-blur-sm">
                <p className="font-heading text-2xl font-bold text-[hsl(185,60%,55%)]">
                  2.4M+
                </p>
                <p className="mt-1 text-xs text-[hsl(210,20%,65%)]">
                  Containers Handled
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(215,40%,25%)] bg-[hsl(215,60%,12%)]/50 p-4 backdrop-blur-sm">
                <p className="font-heading text-2xl font-bold text-[hsl(185,60%,55%)]">
                  98.7%
                </p>
                <p className="mt-1 text-xs text-[hsl(210,20%,65%)]">
                  On-Time Rate
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(215,40%,25%)] bg-[hsl(215,60%,12%)]/50 p-4 backdrop-blur-sm">
                <p className="font-heading text-2xl font-bold text-[hsl(185,60%,55%)]">
                  150+
                </p>
                <p className="mt-1 text-xs text-[hsl(210,20%,65%)]">
                  Active Carriers
                </p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-xs text-[hsl(210,20%,50%)]">
            &copy; 2026 APCS. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel - Login Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 lg:w-[45%] lg:px-16">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center justify-center lg:hidden">
          <Image
            src="/apcs-logo.svg"
            alt="APCS Logo"
            width={160}
            height={60}
            className="h-14 w-auto"
          />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access your APCS dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {needs2FA ? (
            /* ── OTP Verification Form ── */
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <p className="text-sm text-muted-foreground">
                A verification code has been sent to your email. Enter it below.
              </p>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-foreground">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="h-11 bg-muted/50 text-center text-lg tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus:bg-background"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Verifying...
                  </div>
                ) : (
                  "Verify"
                )}
              </Button>

              <button
                type="button"
                onClick={() => { setNeeds2FA(false); setOtp(""); setError("") }}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            /* ── Login Form ── */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-muted/50 pl-10 text-foreground placeholder:text-muted-foreground focus:bg-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-muted/50 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:bg-background"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-border text-primary accent-primary"
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Keep me signed in
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {"Don't have an account? "}
            <button type="button" className="font-medium text-accent hover:text-accent/80 transition-colors">
              Contact your administrator
            </button>
          </p>
        </div>

        {/* Forgot Password Dialog */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl font-bold">
                Reset your password
              </DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>
            
            {resetSent ? (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-6 text-center">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Password reset instructions have been sent to your email!
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="name@company.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="h-11 bg-muted/50 pl-10 text-foreground placeholder:text-muted-foreground focus:bg-background"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Sending...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

