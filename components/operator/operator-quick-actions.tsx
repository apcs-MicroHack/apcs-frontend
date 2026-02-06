"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ClipboardCheck,
  Settings,
  BarChart3,
  Bell,
} from "lucide-react"
import Link from "next/link"

const actions = [
  {
    label: "Review Queue",
    description: "Process pending bookings",
    href: "/operator/queue",
    icon: ClipboardCheck,
    iconBg: "bg-[hsl(var(--warning))]/10",
    iconColor: "text-[hsl(var(--warning))]",
    badge: "18",
  },
  {
    label: "Capacity Settings",
    description: "Adjust hourly slot limits",
    href: "/operator/capacity",
    icon: Settings,
    iconBg: "bg-[hsl(185,60%,42%)]/10",
    iconColor: "text-[hsl(185,60%,42%)]",
  },
  {
    label: "View Reports",
    description: "Terminal analytics",
    href: "/operator/reports",
    icon: BarChart3,
    iconBg: "bg-[hsl(210,65%,45%)]/10",
    iconColor: "text-[hsl(210,65%,45%)]",
  },
  {
    label: "Notifications",
    description: "Check alerts & events",
    href: "/operator/notifications",
    icon: Bell,
    iconBg: "bg-[hsl(var(--destructive))]/10",
    iconColor: "text-[hsl(var(--destructive))]",
    badge: "5",
  },
]

export function OperatorQuickActions() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Quick Actions
        </CardTitle>
        <CardDescription>Common operator tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.iconBg}`}
              >
                <action.icon className={`h-4 w-4 ${action.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {action.label}
                  </p>
                  {action.badge && (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--destructive))] px-1 text-[9px] font-bold text-[hsl(0,0%,100%)]">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
