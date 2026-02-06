"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  UserPlus,
  Settings,
  FileText,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

const actions = [
  {
    label: "Add Carrier",
    description: "Register a new carrier account",
    href: "/admin/carriers",
    icon: UserPlus,
    iconBg: "bg-[hsl(210,65%,45%)]/10",
    iconColor: "text-[hsl(210,65%,45%)]",
  },
  {
    label: "Configure Terminals",
    description: "Manage hourly capacity slots",
    href: "/admin/terminals",
    icon: Settings,
    iconBg: "bg-[hsl(185,60%,42%)]/10",
    iconColor: "text-[hsl(185,60%,42%)]",
  },
  {
    label: "Generate Report",
    description: "Export analytics data",
    href: "/admin/reports",
    icon: FileText,
    iconBg: "bg-[hsl(var(--warning))]/10",
    iconColor: "text-[hsl(var(--warning))]",
  },
  {
    label: "View All Bookings",
    description: "Browse all booking records",
    href: "/admin/bookings",
    icon: BarChart3,
    iconBg: "bg-[hsl(var(--success))]/10",
    iconColor: "text-[hsl(var(--success))]",
  },
]

export function QuickActions() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Quick Actions
        </CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
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
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {action.label}
                </p>
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
