"use client"

import {
  ClipboardList,
  Ship,
  TrendingUp,
  Container,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const kpis = [
  {
    label: "Total Bookings",
    value: "1,284",
    change: "+12.5%",
    trend: "up" as const,
    period: "vs last month",
    icon: ClipboardList,
    iconBg: "bg-[hsl(210,65%,45%)]/10",
    iconColor: "text-[hsl(210,65%,45%)]",
  },
  {
    label: "Active Carriers",
    value: "156",
    change: "+3.2%",
    trend: "up" as const,
    period: "vs last month",
    icon: Ship,
    iconBg: "bg-[hsl(185,60%,42%)]/10",
    iconColor: "text-[hsl(185,60%,42%)]",
  },
  {
    label: "Capacity Utilization",
    value: "78.4%",
    change: "+5.1%",
    trend: "up" as const,
    period: "vs last week",
    icon: Container,
    iconBg: "bg-[hsl(var(--warning))]/10",
    iconColor: "text-[hsl(var(--warning))]",
  },
  {
    label: "Revenue (MTD)",
    value: "DA 42.8M",
    change: "-2.3%",
    trend: "down" as const,
    period: "vs last month",
    icon: TrendingUp,
    iconBg: "bg-[hsl(var(--success))]/10",
    iconColor: "text-[hsl(var(--success))]",
  },
]

export function KpiCards() {
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
