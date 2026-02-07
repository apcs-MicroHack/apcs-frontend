"use client"

import { useMemo, useState, useEffect } from "react"
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
import { bookingService, authService } from "@/services"
import type { PaginatedBookingsResponse } from "@/services/booking.service"
import type { Booking } from "@/services/types"

const EMPTY_RESPONSE: PaginatedBookingsResponse = { bookings: [], pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false } }

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

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 6).padStart(2, "0"),
)

export function HourlyActivityChart() {
  const [terminalId, setTerminalId] = useState<string | null>(null)

  // Get operator's assigned terminal
  useEffect(() => {
    authService.getProfile().then((user) => {
      setTerminalId(user.terminal?.id ?? user.operatorTerminals?.[0]?.terminalId ?? null)
    })
  }, [])

  const { data, loading } = useApi<PaginatedBookingsResponse>(
    () => terminalId ? bookingService.getBookings({ terminalId }) : Promise.resolve(EMPTY_RESPONSE),
    [terminalId],
  )
  const bookings = data?.bookings ?? []

  const hourlyData = useMemo(() => {
    const buckets = HOURS.map((h) => ({ hour: h, confirmed: 0, pending: 0, rejected: 0 }))
    if (!bookings) return buckets
    const todayStr = new Date().toISOString().slice(0, 10)
    for (const b of bookings) {
      if (!b.timeSlot.date.startsWith(todayStr)) continue
      const h = b.timeSlot.startTime.slice(0, 2)
      const bucket = buckets.find((bk) => bk.hour === h)
      if (!bucket) continue
      if (b.status === "CONFIRMED" || b.status === "CONSUMED") bucket.confirmed++
      else if (b.status === "PENDING") bucket.pending++
      else if (b.status === "REJECTED") bucket.rejected++
    }
    return buckets
  }, [bookings])

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Today&apos;s Activity
        </CardTitle>
        <CardDescription>Hourly booking processing</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[260px] w-full rounded-lg" />
        ) : (
          <ChartContainer id="hourly-activity" config={chartConfig} className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyData}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(214, 20%, 88%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: "hsl(215, 15%, 45%)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}:00`}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(215, 15%, 45%)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="confirmed" fill="var(--color-confirmed)" radius={[3, 3, 0, 0]} barSize={12} />
                <Bar dataKey="pending" fill="var(--color-pending)" radius={[3, 3, 0, 0]} barSize={12} />
                <Bar dataKey="rejected" fill="var(--color-rejected)" radius={[3, 3, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-5">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: config.color }} />
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
