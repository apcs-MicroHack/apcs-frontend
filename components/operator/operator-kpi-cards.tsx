"use client"

import {
  ClipboardCheck,
  Clock,
  Container,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const kpis = [
  {
    label: "Pending Validations",
    value: "18",
    change: "+6",
    trend: "up" as const,
    period: "since last hour",
    icon: ClipboardCheck,
    iconBg: "bg-[hsl(var(--warning))]/10",
    iconColor: "text-[hsl(var(--warning))]",
  },
  {
    label: "Today's Bookings",
    value: "64",
    change: "+8.3%",
    trend: "up" as const,
    period: "vs yesterday",
    icon: Clock,
    iconBg: "bg-[hsl(210,65%,45%)]/10",
    iconColor: "text-[hsl(210,65%,45%)]",
  },
  {
    label: "Terminal Capacity",
    value: "85%",
    change: "+12%",
    trend: "up" as const,
    period: "current hour",
    icon: Container,
    iconBg: "bg-[hsl(185,60%,42%)]/10",
    iconColor: "text-[hsl(185,60%,42%)]",
  },
  {
    label: "Rejected Today",
    value: "3",
    change: "-40%",
    trend: "down" as const,
    period: "vs yesterday",
    icon: AlertTriangle,
    iconBg: "bg-[hsl(var(--destructive))]/10",
    iconColor: "text-[hsl(var(--destructive))]",
  },
]

export function OperatorKpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-foreground">
                  {kpi.value}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
                  )}
                  <span className="text-xs font-medium text-[hsl(var(--success))]">
                    {kpi.change}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {kpi.period}
                  </span>
                </div>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${kpi.iconBg}`}
              >
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
