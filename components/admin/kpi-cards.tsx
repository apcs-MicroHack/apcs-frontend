"use client"

import { ClipboardList, Ship, Container } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkline } from "@/components/ui/sparkline"
import { TrendIndicator } from "@/components/ui/trend-indicator"
import { useApi } from "@/hooks/use-api"
import { bookingService, userService } from "@/services"
import type { Booking, User } from "@/services/types"

// Mock sparkline data (in real app, should come from API)
function generateSparklineData(baseValue: number, variance: number = 0.2): number[] {
  return Array.from({ length: 7 }, () => 
    Math.max(0, baseValue * (1 + (Math.random() - 0.5) * variance))
  )
}

export function KpiCards() {
  const { data: bookings, loading: bLoading } = useApi<Booking[]>(
    () => bookingService.getBookings(),
    [],
  )
  const { data: users, loading: uLoading } = useApi<User[]>(
    () => userService.getUsers(),
    [],
  )

  const loading = bLoading || uLoading

  const totalBookings = bookings?.length ?? 0
  const activeCarriers = users?.filter((u) => u.role === "CARRIER" && u.isActive).length ?? 0

  const confirmedOrConsumed = bookings?.filter(
    (b) => b.status === "CONFIRMED" || b.status === "CONSUMED",
  ).length ?? 0
  const capacityRate = totalBookings > 0
    ? Math.round((confirmedOrConsumed / totalBookings) * 1000) / 10
    : 0

  const kpis = [
    {
      label: "Total Bookings",
      value: totalBookings.toLocaleString(),
      icon: ClipboardList,
      iconBg: "bg-[hsl(210,65%,45%)]/10",
      iconColor: "text-[hsl(210,65%,45%)]",
      sparklineColor: "hsl(210,65%,45%)",
      sparklineData: generateSparklineData(totalBookings),
      trend: null, // No historical data available
    },
    {
      label: "Active Carriers",
      value: activeCarriers.toLocaleString(),
      icon: Ship,
      iconBg: "bg-[hsl(185,60%,42%)]/10",
      iconColor: "text-[hsl(185,60%,42%)]",
      sparklineColor: "hsl(185,60%,42%)",
      sparklineData: generateSparklineData(activeCarriers),
      trend: null, // No historical data available
    },
    {
      label: "Utilization Rate",
      value: `${capacityRate}%`,
      icon: Container,
      iconBg: "bg-[hsl(var(--warning))]/10",
      iconColor: "text-[hsl(var(--warning))]",
      sparklineColor: "hsl(45,93%,47%)",
      sparklineData: generateSparklineData(capacityRate),
      trend: null, // No historical data available
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="p-5">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-3 h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="font-heading text-2xl font-bold text-foreground">
                    {kpi.value}
                  </p>
                  {kpi.trend !== null && <TrendIndicator value={kpi.trend} />}
                </div>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${kpi.iconBg}`}
              >
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
            <div className="mt-3">
              <Sparkline data={kpi.sparklineData} color={kpi.sparklineColor} height={32} />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
