"use client"

import { useState, useEffect } from "react"
import {
  ClipboardCheck,
  Clock,
  Container,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkline } from "@/components/ui/sparkline"
import { TrendIndicator } from "@/components/ui/trend-indicator"
import { useApi } from "@/hooks/use-api"
import { bookingService, authService } from "@/services"
import type { BookingSummaryResponse, PaginatedBookingsResponse } from "@/services/booking.service"

const EMPTY_SUMMARY: BookingSummaryResponse = { summary: [] }
const EMPTY_RESPONSE: PaginatedBookingsResponse = { bookings: [], pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false } }

// Mock sparkline data
function generateSparklineData(baseValue: number, variance: number = 0.3): number[] {
  return Array.from({ length: 7 }, () => 
    Math.max(0, baseValue * (1 + (Math.random() - 0.5) * variance))
  )
}

export function OperatorKpiCards() {
  const [terminalId, setTerminalId] = useState<string | null>(null)

  // Get operator's assigned terminal
  useEffect(() => {
    authService.getProfile().then((user) => {
      // Backend returns terminal directly for operators
      setTerminalId(user.terminal?.id ?? user.operatorTerminals?.[0]?.terminalId ?? null)
    })
  }, [])

  // Use booking summary for accurate total counts (not paginated)
  const { data: summaryData, loading: summaryLoading } = useApi<BookingSummaryResponse>(
    () => bookingService.getBookingSummary(),
    [],
  )

  // Get today's bookings separately with date filter
  const todayStr = new Date().toISOString().slice(0, 10)
  const { data: todayData, loading: todayLoading } = useApi<PaginatedBookingsResponse>(
    () => terminalId 
      ? bookingService.getBookings({ terminalId, startDate: todayStr, endDate: todayStr, limit: 1 }) 
      : Promise.resolve(EMPTY_RESPONSE),
    [terminalId, todayStr],
  )

  const loading = summaryLoading || todayLoading

  // Calculate counts from summary
  const summary = summaryData?.summary ?? []
  const pending = summary.filter((s) => s.status === "PENDING").reduce((sum, s) => sum + s.count, 0)
  const rejected = summary.filter((s) => s.status === "REJECTED").reduce((sum, s) => sum + s.count, 0)
  const totalBookings = summary.reduce((sum, s) => sum + s.count, 0)
  const todaysBookings = todayData?.pagination?.totalCount ?? 0

  const kpis = [
    {
      label: "Pending Validations",
      value: pending.toString(),
      icon: ClipboardCheck,
      iconBg: "bg-[hsl(var(--warning))]/10",
      iconColor: "text-[hsl(var(--warning))]",
      sparklineColor: "hsl(45,93%,47%)",
      sparklineData: generateSparklineData(pending),
      trend: null, // No historical data available
    },
    {
      label: "Today's Bookings",
      value: todaysBookings.toString(),
      icon: Clock,
      iconBg: "bg-[hsl(210,65%,45%)]/10",
      iconColor: "text-[hsl(210,65%,45%)]",
      sparklineColor: "hsl(210,65%,45%)",
      sparklineData: generateSparklineData(todaysBookings),
      trend: null, // No historical data available
    },
    {
      label: "Total Bookings",
      value: totalBookings.toLocaleString(),
      icon: Container,
      iconBg: "bg-[hsl(185,60%,42%)]/10",
      iconColor: "text-[hsl(185,60%,42%)]",
      sparklineColor: "hsl(185,60%,42%)",
      sparklineData: generateSparklineData(totalBookings),
      trend: null, // No historical data available
    },
    {
      label: "Rejected Today",
      value: rejected.toString(),
      icon: AlertTriangle,
      iconBg: "bg-[hsl(var(--destructive))]/10",
      iconColor: "text-[hsl(var(--destructive))]",
      sparklineColor: "hsl(0,84%,60%)",
      sparklineData: generateSparklineData(rejected, 0.5),
      trend: null, // No historical data available
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
