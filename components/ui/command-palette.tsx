"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  Ship,
  Settings,
  Users,
  BarChart3,
  Bell,
  Truck,
  Calendar,
  MessageSquare,
  Search,
  Plus,
  FileText,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

type Portal = "admin" | "carrier" | "operator"

interface CommandPaletteProps {
  portal: Portal
}

const adminRoutes = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { label: "Bookings", href: "/admin/bookings", icon: ClipboardList, keywords: ["slots", "reservations"] },
  { label: "Carriers", href: "/admin/carriers", icon: Ship, keywords: ["companies", "trucking"] },
  { label: "Terminal Config", href: "/admin/terminals", icon: Settings, keywords: ["capacity", "slots"] },
  { label: "User Management", href: "/admin/users", icon: Users, keywords: ["accounts", "roles"] },
  { label: "Reports", href: "/admin/reports", icon: BarChart3, keywords: ["analytics", "statistics"] },
  { label: "Notifications", href: "/admin/notifications", icon: Bell, keywords: ["alerts", "messages"] },
]

const carrierRoutes = [
  { label: "Dashboard", href: "/carrier", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { label: "Bookings", href: "/carrier/bookings", icon: ClipboardList, keywords: ["slots", "reservations"] },
  { label: "Create Booking", href: "/carrier/create-booking", icon: Plus, keywords: ["new", "schedule"] },
  { label: "Fleet", href: "/carrier/fleet", icon: Truck, keywords: ["trucks", "vehicles"] },
  { label: "History", href: "/carrier/history", icon: Calendar, keywords: ["past", "archive"] },
  { label: "Reports", href: "/carrier/reports", icon: BarChart3, keywords: ["analytics", "statistics"] },
  { label: "Notifications", href: "/carrier/notifications", icon: Bell, keywords: ["alerts", "messages"] },
]

const operatorRoutes = [
  { label: "Dashboard", href: "/operator", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { label: "Bookings", href: "/operator/bookings", icon: ClipboardList, keywords: ["slots", "reservations"] },
  { label: "Queue", href: "/operator/queue", icon: FileText, keywords: ["line", "waiting"] },
  { label: "Capacity", href: "/operator/capacity", icon: Settings, keywords: ["slots", "availability"] },
  { label: "Reports", href: "/operator/reports", icon: BarChart3, keywords: ["analytics", "statistics"] },
  { label: "Notifications", href: "/operator/notifications", icon: Bell, keywords: ["alerts", "messages"] },
]

const actions = [
  { label: "Create New Booking", shortcut: "N", portal: "carrier" as Portal },
  { label: "Open Chat", shortcut: "C", portal: "all" as const },
  { label: "Refresh Data", shortcut: "R", portal: "all" as const },
]

export function CommandPalette({ portal }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const routes =
    portal === "admin"
      ? adminRoutes
      : portal === "carrier"
        ? carrierRoutes
        : operatorRoutes

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      // Quick shortcuts when palette is closed
      if (!open) {
        if (e.key === "n" && portal === "carrier" && !e.metaKey && !e.ctrlKey) {
          const activeElement = document.activeElement
          if (activeElement?.tagName !== "INPUT" && activeElement?.tagName !== "TEXTAREA") {
            e.preventDefault()
            router.push("/carrier/create-booking")
          }
        }
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, portal, router])

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    []
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {routes.map((route) => (
            <CommandItem
              key={route.href}
              value={`${route.label} ${route.keywords.join(" ")}`}
              onSelect={() => runCommand(() => router.push(route.href))}
            >
              <route.icon className="mr-2 h-4 w-4" />
              <span>{route.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          {actions
            .filter((a) => a.portal === "all" || a.portal === portal)
            .map((action) => (
              <CommandItem
                key={action.label}
                value={action.label}
                onSelect={() => {
                  if (action.label === "Create New Booking") {
                    runCommand(() => router.push("/carrier/create-booking"))
                  } else if (action.label === "Open Chat") {
                    runCommand(() => router.push("/chat"))
                  } else if (action.label === "Refresh Data") {
                    runCommand(() => window.location.reload())
                  }
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
                <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {action.shortcut}
                </kbd>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
