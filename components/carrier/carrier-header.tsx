"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bell, Search, Menu, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
  const title = pageTitles[pathname] || "Carrier Portal"

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
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            className="h-9 w-64 bg-muted/50 pl-9 text-sm"
          />
        </div>

        <Link href="/chat">
          <Button variant="ghost" size="icon" aria-label="AI Assistant">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </Button>
        </Link>

        <Link href="/carrier/notifications">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <Badge className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center bg-[hsl(var(--destructive))] p-0 text-[10px] text-[hsl(0,0%,100%)]">
              4
            </Badge>
          </Button>
        </Link>
      </div>
    </header>
  )
}
