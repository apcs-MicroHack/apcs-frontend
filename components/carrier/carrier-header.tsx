"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Bell, Search, Menu, MessageSquare, Command } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ConnectionStatus } from "@/components/ui/connection-status"
import { useUnreadCount } from "@/contexts"
import { cn } from "@/lib/utils"

const pageTitles: Record<string, string> = {
  "/carrier": "My Dashboard",
  "/carrier/create-booking": "Create Booking",
  "/carrier/bookings": "My Bookings",
  "/carrier/fleet": "Fleet Management",
  "/carrier/history": "Booking History",
  "/carrier/reports": "Reports & Analytics",
  "/carrier/notifications": "Notifications",
}

interface CarrierHeaderProps {
  onMenuToggle: () => void
}

export function CarrierHeader({ onMenuToggle }: CarrierHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const title = pageTitles[pathname] || "Carrier Portal"
  const unreadCount = useUnreadCount()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/carrier/bookings?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ConnectionStatus />
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            className="h-9 w-64 bg-muted/50 pl-9 pr-12 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        <Link href="/chat">
          <Button variant="ghost" size="icon" aria-label="AI Assistant">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </Button>
        </Link>

        <Link href="/carrier/notifications">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className={cn(
              "h-5 w-5 text-muted-foreground transition-colors",
              unreadCount > 0 && "text-foreground"
            )} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground shadow-sm animate-in zoom-in-50 duration-200">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  )
}
