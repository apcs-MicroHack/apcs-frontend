"use client"

import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const kpis = [
  {
    label: "Active Bookings",
    value: "12",
    change: "+3",
    trend: "up" as const,
    period: "this week",
    icon: ClipboardList,
    iconBg: "bg-[hsl(210,65%,45%)]/10",
    iconColor: "text-[hsl(210,65%,45%)]",
  },
  {
    label: "Pending Approval",
    value: "4",
    change: "+2",
    trend: "up" as const,
    period: "since yesterday",
    icon: Clock,
    iconBg: "bg-[hsl(var(--warning))]/10",
    iconColor: "text-[hsl(var(--warning))]",
  },
  {
    label: "Completed This Month",
    value: "38",
    change: "+15.2%",
    trend: "up" as const,
    period: "vs last month",
    icon: CheckCircle2,
    iconBg: "bg-[hsl(var(--success))]/10",
    iconColor: "text-[hsl(var(--success))]",
  },
  {
    label: "Fleet Vehicles",
    value: "8",
    change: "-1",
    trend: "down" as const,
    period: "1 in maintenance",
    icon: Truck,
    iconBg: "bg-[hsl(185,60%,42%)]/10",
    iconColor: "text-[hsl(185,60%,42%)]",
  },
]

export function CarrierKpiCards() {
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
                    <ArrowDownRight className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
                  )}
                  <span
                    className={
                      kpi.trend === "up"
                        ? "text-xs font-medium text-[hsl(var(--success))]"
                        : "text-xs font-medium text-[hsl(var(--destructive))]"
                    }
                  >
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
