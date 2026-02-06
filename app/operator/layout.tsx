"use client"

import React from "react"

import { useState } from "react"
import { OperatorSidebar } from "@/components/operator/operator-sidebar"
import { OperatorHeader } from "@/components/operator/operator-header"
import { cn } from "@/lib/utils"

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMobileOpen(false)
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <OperatorSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 block lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "transition-transform duration-300"
        )}
      >
        <OperatorSidebar
          collapsed={false}
          onToggle={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[250px]"
        )}
      >
        <OperatorHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
