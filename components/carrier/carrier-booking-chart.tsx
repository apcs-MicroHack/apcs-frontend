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
import type { Booking } from "@/services/types"

const chartConfig = {
  bookings: { label: "Bookings", color: "hsl(185, 60%, 42%)" },
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CarrierBookingChart() {
  // Fetch ALL bookings (handles pagination automatically - backend caps at 100/page)
  const { data: bookings, loading } = useApi<Booking[]>(
    () => bookingService.getAllBookings(),
    [],
  )

  const weeklyData = useMemo(() => {
    const buckets = DAY_LABELS.map((day) => ({ day, bookings: 0 }))
    if (!bookings?.length) return []
    for (const b of bookings) {
      const dow = new Date(b.createdAt).getDay()
      buckets[dow].bookings++
    }
    return [...buckets.slice(1), buckets[0]]
  }, [bookings])

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Weekly Bookings
        </CardTitle>
        <CardDescription>Your booking activity this week</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[220px] w-full rounded-lg" />
        ) : (
          <ChartContainer id="carrier-bookings" config={chartConfig} className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
