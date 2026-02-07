"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  Ship,
  Settings,
  BarChart3,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUnreadCount } from "@/contexts"
import { authService } from "@/services"
import type { User } from "@/services/types"

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: ClipboardList,
  },
  {
    label: "Carriers",
    href: "/admin/carriers",
    icon: Ship,
  },
  {
    label: "Terminal Config",
    href: "/admin/terminals",
    icon: Settings,
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    label: "Audit Log",
    href: "/admin/audit",
    icon: BarChart3,
  },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const unreadCount = useUnreadCount()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let mounted = true
    authService.getProfile().then((u) => {
      if (mounted) setUser(u)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  // Computed display values
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "AD"
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Admin"
  const displayEmail = user?.email ?? "loading…"

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-[hsl(215,70%,10%)] transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[250px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0">
              <Image
                src="/apcs-logo-white.svg"
                alt="APCS Logo"
                width={collapsed ? 40 : 140}
                height={collapsed ? 40 : 50}
                className={collapsed ? "h-10 w-auto" : "h-12 w-auto"}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const isNotifications = item.href === "/admin/notifications"
              const showBadge = isNotifications && unreadCount > 0
              
              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[hsl(210,65%,45%)]/15 text-[hsl(185,60%,55%)]"
                      : "text-[hsl(210,20%,65%)] hover:bg-[hsl(215,55%,18%)] hover:text-[hsl(210,20%,90%)]",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <span className="relative">
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {showBadge && collapsed && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {showBadge && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )

              return (
                <li key={item.href}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    linkContent
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-sidebar-border px-3 py-2">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-lg py-2 text-[hsl(210,20%,55%)] transition-colors hover:bg-[hsl(215,55%,18%)] hover:text-[hsl(210,20%,90%)]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* User */}
        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg p-2",
              collapsed && "justify-center"
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-[hsl(215,55%,20%)] text-xs font-semibold text-[hsl(185,60%,55%)]">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[hsl(210,20%,90%)]">
                  {displayName}
                </p>
                <p className="truncate text-[11px] text-[hsl(210,20%,55%)]">
                  {displayEmail}
                </p>
              </div>
            )}
            {!collapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className="shrink-0 rounded-md p-1.5 text-[hsl(210,20%,55%)] transition-colors hover:bg-[hsl(215,55%,18%)] hover:text-[hsl(210,20%,90%)]"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
