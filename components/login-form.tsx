"use client"

import React from "react"

import { useState } from "react"
import { Eye, EyeOff, Lock, Mail, Anchor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulated login - will be replaced with real auth later
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (!email || !password) {
      setError("Please enter your email and password.")
      setIsLoading(false)
      return
    }

    // Demo role routing
    if (email.includes("admin")) {
      window.location.href = "/admin"
    } else if (email.includes("operator")) {
      window.location.href = "/operator"
    } else {
      window.location.href = "/carrier"
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding / Hero */}
      <div className="relative hidden w-[55%] lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/port-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-[hsl(215,70%,10%)]/80" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          {/* Logo area */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(185,60%,42%)]">
              <Anchor className="h-6 w-6 text-[hsl(0,0%,100%)]" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight text-[hsl(0,0%,100%)]">
                APCS
              </h1>
              <p className="text-xs text-[hsl(210,20%,75%)]">
                Algiers Port Container Service
              </p>
            </div>
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
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Anchor className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground">
              APCS
            </h1>
            <p className="text-xs text-muted-foreground">
              Algiers Port Container Service
            </p>
          </div>
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

          {/* Role hints for demo */}
          <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Demo Access
            </p>
            <div className="space-y-2">
              <RoleHint role="Admin" email="admin@apcs.dz" />
              <RoleHint role="Operator" email="operator@apcs.dz" />
              <RoleHint role="Carrier" email="carrier@apcs.dz" />
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {"Don't have an account? "}
            <button type="button" className="font-medium text-accent hover:text-accent/80 transition-colors">
              Contact your administrator
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function RoleHint({ role, email }: { role: string; email: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="font-medium text-foreground">{role}</span>
      <code className="rounded bg-background px-2 py-0.5 text-muted-foreground">
        {email}
      </code>
    </div>
  )
}
