"use client"

import { useMemo, useState } from "react"
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
} from "recharts"
import { Calendar, AlertCircle } from "lucide-react"
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
import type { BookingSummaryResponse } from "@/services/booking.service"
import type { BookingStatus } from "@/services/types"

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

const terminalChartConfig = {
  bookings: { label: "Bookings", color: "hsl(210, 65%, 45%)" },
}

// ── Date range helpers ───────────────────────────────────────

type RangeKey = "today" | "7d" | "30d" | "90d" | "1y"

function getDateRange(range: RangeKey): { startDate: string; endDate: string } {
  const now = new Date()
  const endDate = now.toISOString().slice(0, 10)
  let start: Date
  switch (range) {
    case "today":
      start = new Date(now)
      start.setHours(0, 0, 0, 0)
      break
    case "7d":
      start = new Date(now.getTime() - 7 * 86_400_000)
      break
    case "30d":
      start = new Date(now.getTime() - 30 * 86_400_000)
      break
    case "90d":
      start = new Date(now.getTime() - 90 * 86_400_000)
      break
    case "1y":
      start = new Date(now.getTime() - 365 * 86_400_000)
      break
  }
  return { startDate: start.toISOString().slice(0, 10), endDate }
}

// ── Page ─────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [range, setRange] = useState<RangeKey>("30d")
  const dateRange = useMemo(() => getDateRange(range), [range])

  // Fetch summary for accurate counts by status/terminal (supports date filters)
  const { data: summaryData, loading, error, refetch } = useApi<BookingSummaryResponse>(
    () => bookingService.getBookingSummary({ 
      startDate: dateRange.startDate, 
      endDate: dateRange.endDate,
    }),
    [dateRange.startDate, dateRange.endDate],
  )
  const summaryItems = summaryData?.summary ?? []
  const totalInRange = summaryItems.reduce((acc, s) => acc + s.count, 0)

  // Terminal usage (from summary for accurate counts)
  const terminalData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of summaryItems) {
      const name = s.terminal?.name ?? "Unknown"
      map.set(name, (map.get(name) ?? 0) + s.count)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([terminal, count]) => ({ terminal, bookings: count }))
  }, [summaryItems])

  // Status distribution (from summary for accurate counts)
  const statusData = useMemo(() => {
    const map = new Map<BookingStatus, number>()
    for (const s of summaryItems) {
      map.set(s.status, (map.get(s.status) ?? 0) + s.count)
    }
    return (Object.keys(STATUS_COLORS) as BookingStatus[])
      .map((status) => ({
        name: STATUS_LABELS[status],
        status,
        value: map.get(status) ?? 0,
        color: STATUS_COLORS[status],
      }))
      .filter((d) => d.value > 0)
  }, [summaryItems])

  // Summary stats (uses totalInRange from API summary for accurate totals)
  const summary = useMemo(() => {
    const total = totalInRange
    const rejected = summaryItems
      .filter((s) => s.status === "REJECTED")
      .reduce((acc, s) => acc + s.count, 0)
    const confirmed = summaryItems
      .filter((s) => s.status === "CONFIRMED")
      .reduce((acc, s) => acc + s.count, 0)
    const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : "0.0"
    const confirmRate = total > 0 ? ((confirmed / total) * 100).toFixed(1) : "0.0"

    // Unique terminals (from summary for accuracy)
    const terminals = new Set(summaryItems.map((s) => s.terminal?.name).filter(Boolean)).size

    return {
      total: total.toLocaleString(),
      rejectionRate: `${rejectionRate}%`,
      confirmRate: `${confirmRate}%`,
      terminals,
    }
  }, [totalInRange, summaryItems])

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
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-7 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[360px] lg:col-span-2 rounded-lg" />
          <Skeleton className="h-[360px] rounded-lg" />
        </div>
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
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Total Bookings" value={summary.total} />
        <SummaryCard label="Terminals Used" value={String(summary.terminals)} />
        <SummaryCard label="Confirm Rate" value={summary.confirmRate} />
        <SummaryCard label="Rejection Rate" value={summary.rejectionRate} />
      </div>

      {/* Charts Row 1: Terminal Usage (larger) + Status Distribution Pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Terminal Usage */}
        <Card className="border-border bg-card lg:col-span-2">
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
              <ChartContainer config={terminalChartConfig} className="h-[280px] w-full">
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
