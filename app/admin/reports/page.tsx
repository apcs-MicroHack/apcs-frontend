"use client"

import { useCallback, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { Download, Calendar, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartSkeleton } from "@/components/ui/chart-skeleton"
import { PageTransition } from "@/components/ui/page-transition"
import { AutoRefresh } from "@/components/ui/auto-refresh"
import { useApi } from "@/hooks/use-api"
import { bookingService } from "@/services"
import type { PaginatedBookingsResponse } from "@/services/booking.service"
import type { Booking, BookingStatus } from "@/services/types"

// ── Status color map ─────────────────────────────────────────

const STATUS_COLORS: Record<BookingStatus, string> = {
  CONFIRMED: "hsl(145, 63%, 42%)",
  CONSUMED: "hsl(210, 65%, 45%)",
  PENDING: "hsl(38, 92%, 50%)",
  REJECTED: "hsl(0, 72%, 51%)",
  CANCELLED: "hsl(215, 15%, 65%)",
  EXPIRED: "hsl(215, 15%, 50%)",
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  CONFIRMED: "Confirmed",
  CONSUMED: "Consumed",
  PENDING: "Pending",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
}

// ── Chart configs ────────────────────────────────────────────

const monthlyChartConfig = {
  bookings: { label: "Bookings", color: "hsl(185, 60%, 42%)" },
}

const terminalChartConfig = {
  bookings: { label: "Bookings", color: "hsl(210, 65%, 45%)" },
}

const hourlyChartConfig = {
  trucks: { label: "Trucks", color: "hsl(185, 60%, 42%)" },
}

// ── Date range helpers ───────────────────────────────────────

type RangeKey = "today" | "7d" | "30d" | "90d" | "1y"

function getRangeCutoff(range: RangeKey): Date {
  const now = new Date()
  switch (range) {
    case "today": {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case "7d":
      return new Date(now.getTime() - 7 * 86_400_000)
    case "30d":
      return new Date(now.getTime() - 30 * 86_400_000)
    case "90d":
      return new Date(now.getTime() - 90 * 86_400_000)
    case "1y":
      return new Date(now.getTime() - 365 * 86_400_000)
  }
}

// ── Page ─────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [range, setRange] = useState<RangeKey>("30d")

  const { data, loading, error, refetch } = useApi<PaginatedBookingsResponse>(
    () => bookingService.getBookings(),
    [],
  )
  const allBookings = data?.bookings ?? []

  // Filter bookings by selected date range
  const bookings = useMemo(() => {
    const cutoff = getRangeCutoff(range)
    return allBookings.filter((b) => new Date(b.createdAt) >= cutoff)
  }, [allBookings, range])

  // Monthly trend: group by YYYY-MM
  const monthlyData = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of bookings) {
      const d = new Date(b.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const [y, m] = key.split("-")
        const label = new Date(Number(y), Number(m) - 1).toLocaleString("en", { month: "short", year: "2-digit" })
        return { month: label, bookings: count }
      })
  }, [bookings])

  // Terminal usage
  const terminalData = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of bookings) {
      const name = b.terminal?.name ?? "Unknown"
      map.set(name, (map.get(name) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([terminal, count]) => ({ terminal, bookings: count }))
  }, [bookings])

  // Status distribution
  const statusData = useMemo(() => {
    const map = new Map<BookingStatus, number>()
    for (const b of bookings) {
      map.set(b.status, (map.get(b.status) ?? 0) + 1)
    }
    return (Object.keys(STATUS_COLORS) as BookingStatus[])
      .map((status) => ({
        name: STATUS_LABELS[status],
        status,
        value: map.get(status) ?? 0,
        color: STATUS_COLORS[status],
      }))
      .filter((d) => d.value > 0)
  }, [bookings])

  // Hourly distribution (from timeSlot.startTime)
  const hourlyData = useMemo(() => {
    const map = new Map<number, number>()
    for (const b of bookings) {
      const st = b.timeSlot?.startTime
      if (!st) continue
      const hour = parseInt(st.split(":")[0], 10)
      if (!isNaN(hour)) map.set(hour, (map.get(hour) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([hour, count]) => ({
        hour: `${String(hour).padStart(2, "0")}:00`,
        trucks: count,
      }))
  }, [bookings])

  // Top 5 carriers
  const topCarriers = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of bookings) {
      const name = b.carrier?.companyName ?? "Unknown"
      map.set(name, (map.get(name) ?? 0) + 1)
    }
    const total = bookings.length || 1
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        bookings: count,
        share: Math.round((count / total) * 1000) / 10,
      }))
  }, [bookings])

  // Summary stats
  const summary = useMemo(() => {
    const total = bookings.length
    const rejected = bookings.filter((b) => b.status === "REJECTED").length
    const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : "0.0"

    // Peak hour
    let peakHour = "—"
    let peakCount = 0
    const hourMap = new Map<number, number>()
    for (const b of bookings) {
      const st = b.timeSlot?.startTime
      if (!st) continue
      const h = parseInt(st.split(":")[0], 10)
      if (!isNaN(h)) {
        const c = (hourMap.get(h) ?? 0) + 1
        hourMap.set(h, c)
        if (c > peakCount) {
          peakCount = c
          peakHour = `${String(h).padStart(2, "0")}:00`
        }
      }
    }

    // Unique terminals
    const terminals = new Set(bookings.map((b) => b.terminal?.name)).size

    return {
      total: total.toLocaleString(),
      rejectionRate: `${rejectionRate}%`,
      peakHour,
      peakCount,
      terminals,
    }
  }, [bookings])

  // ── Export CSV ───────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (!bookings.length) return
    const headers = ["Booking ID", "Carrier", "Terminal", "Date", "Time Slot", "Status", "Cargo Type", "Truck Plate"]
    const rows = bookings.map((b) => [
      b.bookingNumber,
      b.carrier?.companyName ?? "",
      b.terminal?.name ?? "",
      new Date(b.timeSlot?.date ?? b.createdAt).toLocaleDateString(),
      b.timeSlot ? `${b.timeSlot.startTime} - ${b.timeSlot.endTime}` : "",
      b.status,
      b.cargoType,
      b.truck?.plateNumber ?? "",
    ])
    const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report_${range}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [bookings, range])

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">Failed to load report data</p>
        <p className="text-xs text-destructive">{error}</p>
      </div>
    )
  }

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-7 w-52" />
            <Skeleton className="mt-2 h-4 w-80" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-[150px]" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-7 w-20" />
                <Skeleton className="mt-2 h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[360px] lg:col-span-2 rounded-lg" />
          <Skeleton className="h-[360px] rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-[300px] rounded-lg" />
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
        <Skeleton className="h-[280px] rounded-lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Reports &amp; Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Usage statistics, capacity utilization, and historical trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AutoRefresh onRefresh={refetch} defaultInterval={120} />
          <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
            <SelectTrigger className="h-9 w-[150px] gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExport} disabled={!bookings.length}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Total Bookings" value={summary.total} />
        <SummaryCard label="Terminals Used" value={String(summary.terminals)} />
        <SummaryCard
          label="Peak Hour"
          value={`${summary.peakCount} trucks`}
          detail={summary.peakHour}
        />
        <SummaryCard label="Rejection Rate" value={summary.rejectionRate} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Trend */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Monthly Booking Trend
            </CardTitle>
            <CardDescription>Bookings grouped by month</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <EmptyChart label="No booking data for this period" />
            ) : (
              <ChartContainer config={monthlyChartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="bookings" fill="var(--color-bookings)" fillOpacity={0.2} stroke="var(--color-bookings)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution Pie */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Booking Status
            </CardTitle>
            <CardDescription>Distribution for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <EmptyChart label="No bookings found" />
            ) : (
              <>
                <div className="flex h-[200px] items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-xs font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Terminal Usage */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Terminal Usage
            </CardTitle>
            <CardDescription>Bookings by terminal</CardDescription>
          </CardHeader>
          <CardContent>
            {terminalData.length === 0 ? (
              <EmptyChart label="No terminal data" />
            ) : (
              <ChartContainer config={terminalChartConfig} className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={terminalData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" vertical={false} />
                    <XAxis dataKey="terminal" tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Hourly Traffic Pattern
            </CardTitle>
            <CardDescription>Truck arrivals by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            {hourlyData.length === 0 ? (
              <EmptyChart label="No hourly data" />
            ) : (
              <ChartContainer config={hourlyChartConfig} className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} interval={1} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="trucks" fill="var(--color-trucks)" fillOpacity={0.2} stroke="var(--color-trucks)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Carriers */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Top Carriers by Volume
          </CardTitle>
          <CardDescription>Booking share by carrier</CardDescription>
        </CardHeader>
        <CardContent>
          {topCarriers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No carrier data</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topCarriers.map((carrier, idx) => (
                <div key={carrier.name} className="flex items-center gap-4">
                  <span className="w-5 text-right text-xs font-bold text-muted-foreground">{idx + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{carrier.name}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{carrier.bookings} bookings</span>
                        <span className="w-12 text-right text-xs font-semibold text-foreground">{carrier.share}%</span>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-[hsl(210,65%,45%)] transition-all"
                        style={{ width: `${carrier.share}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Summary card (no hardcoded trends) ───────────────────────

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p>
        {detail && (
          <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Empty chart placeholder ──────────────────────────────────

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
