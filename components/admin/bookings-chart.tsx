"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/hooks/use-api"
import { bookingService } from "@/services"
import type { PaginatedBookingsResponse } from "@/services/booking.service"

const chartConfig = {
  confirmed: {
    label: "Confirmed",
    color: "hsl(185, 60%, 42%)",
  },
  pending: {
    label: "Pending",
    color: "hsl(38, 92%, 50%)",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(0, 72%, 51%)",
  },
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Get last 30 days for chart data
function getChartDateRange(): { startDate: string; endDate: string } {
  const now = new Date()
  const end = now.toISOString().split("T")[0]
  const start = new Date(now)
  start.setDate(start.getDate() - 30)
  return { startDate: start.toISOString().split("T")[0], endDate: end }
}

export function BookingsChart() {
  const dateRange = useMemo(() => getChartDateRange(), [])

  // Fetch bookings for last 30 days (backend caps at 100/page)
  const { data, loading } = useApi<PaginatedBookingsResponse>(
    () => bookingService.getBookings({ startDate: dateRange.startDate, endDate: dateRange.endDate, limit: 100 }),
    [dateRange.startDate, dateRange.endDate],
  )
  const bookings = data?.bookings ?? []

  /* Aggregate bookings by day-of-week */
  const weeklyData = useMemo(() => {
    if (!bookings.length) return []
    const buckets = DAY_LABELS.map((day) => ({ day, confirmed: 0, pending: 0, rejected: 0 }))
    for (const b of bookings) {
      const dow = new Date(b.createdAt).getDay()
      if (b.status === "CONFIRMED" || b.status === "CONSUMED") buckets[dow].confirmed++
      else if (b.status === "PENDING") buckets[dow].pending++
      else if (b.status === "REJECTED") buckets[dow].rejected++
    }
    /* Rotate so Mon comes first */
    return [...buckets.slice(1), buckets[0]]
  }, [bookings])

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Bookings Overview
        </CardTitle>
        <CardDescription>Weekly booking activity by status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-lg" />
        ) : (
          <ChartContainer id="bookings-overview" config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(214, 20%, 88%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="confirmed"
                  fill="var(--color-confirmed)"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="pending"
                  fill="var(--color-pending)"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="rejected"
                  fill="var(--color-rejected)"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-5">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs text-muted-foreground">
                {config.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
