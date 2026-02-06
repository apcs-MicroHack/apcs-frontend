"use client"

import Link from "next/link"
import {
  PlusCircle,
  ClipboardList,
  Truck,
  MessageSquare,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const actions = [
  {
    label: "New Booking",
    description: "Request a new slot",
    href: "/carrier/create-booking",
    icon: PlusCircle,
    iconBg: "bg-[hsl(var(--success))]/10",
    iconColor: "text-[hsl(var(--success))]",
  },
  {
    label: "My Bookings",
    description: "View active bookings",
    href: "/carrier/bookings",
    icon: ClipboardList,
    iconBg: "bg-[hsl(210,65%,45%)]/10",
    iconColor: "text-[hsl(210,65%,45%)]",
  },
  {
    label: "Fleet",
    description: "Manage vehicles",
    href: "/carrier/fleet",
    icon: Truck,
    iconBg: "bg-[hsl(185,60%,42%)]/10",
    iconColor: "text-[hsl(185,60%,42%)]",
  },
  {
    label: "AI Assistant",
    description: "Ask about bookings",
    href: "/chat",
    icon: MessageSquare,
    iconBg: "bg-[hsl(var(--warning))]/10",
    iconColor: "text-[hsl(var(--warning))]",
  },
]

export function CarrierQuickActions() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.iconBg}`}
              >
                <action.icon className={`h-4 w-4 ${action.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
