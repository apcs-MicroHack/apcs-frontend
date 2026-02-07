"use client"

import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Truck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkline } from "@/components/ui/sparkline"
import { TrendIndicator } from "@/components/ui/trend-indicator"
import { useApi } from "@/hooks/use-api"
import { bookingService, truckService } from "@/services"
import type { BookingSummaryResponse } from "@/services/booking.service"
import type { Truck as TruckType } from "@/services/types"

// Mock sparkline data
function generateSparklineData(baseValue: number, variance: number = 0.3): number[] {
  return Array.from({ length: 7 }, () => 
    Math.max(0, baseValue * (1 + (Math.random() - 0.5) * variance))
  )
}

export function CarrierKpiCards() {
  // Use booking summary for accurate counts (not paginated)
  const { data: summaryData, loading: bLoading } = useApi<BookingSummaryResponse>(
    () => bookingService.getBookingSummary(),
    [],
  )
  const { data: trucks, loading: tLoading } = useApi<TruckType[]>(
    () => truckService.getTrucks(),
    [],
  )

  const loading = bLoading || tLoading

  // Calculate counts from summary
  const summary = summaryData?.summary ?? []
  const pending = summary.filter((s) => s.status === "PENDING").reduce((sum, s) => sum + s.count, 0)
  const confirmed = summary.filter((s) => s.status === "CONFIRMED").reduce((sum, s) => sum + s.count, 0)
  const completed = summary.filter((s) => s.status === "CONSUMED").reduce((sum, s) => sum + s.count, 0)
  const active = pending + confirmed
  const fleetCount = trucks?.filter((t) => t.isActive).length ?? 0

  const kpis = [
    {
      label: "Active Bookings",
      value: active.toString(),
      icon: ClipboardList,
      iconBg: "bg-[hsl(210,65%,45%)]/10",
      iconColor: "text-[hsl(210,65%,45%)]",
      sparklineColor: "hsl(210,65%,45%)",
      sparklineData: generateSparklineData(active),
      trend: null, // No historical data available
    },
    {
      label: "Pending Approval",
      value: pending.toString(),
      icon: Clock,
      iconBg: "bg-[hsl(var(--warning))]/10",
      iconColor: "text-[hsl(var(--warning))]",
      sparklineColor: "hsl(45,93%,47%)",
      sparklineData: generateSparklineData(pending),
      trend: null, // No historical data available
    },
    {
      label: "Completed",
      value: completed.toString(),
      icon: CheckCircle2,
      iconBg: "bg-[hsl(var(--success))]/10",
      iconColor: "text-[hsl(var(--success))]",
      sparklineColor: "hsl(142,71%,45%)",
      sparklineData: generateSparklineData(completed),
      trend: null, // No historical data available
    },
    {
      label: "Fleet Vehicles",
      value: fleetCount.toString(),
      icon: Truck,
      iconBg: "bg-[hsl(185,60%,42%)]/10",
      iconColor: "text-[hsl(185,60%,42%)]",
      sparklineColor: "hsl(185,60%,42%)",
      sparklineData: generateSparklineData(fleetCount, 0.1),
      trend: null, // No change tracking for fleet size
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="p-5">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-3 h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

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
              <Sparkline data={kpi.sparklineData} color={kpi.sparklineColor} height={28} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
