"use client"

import { useMemo, useState, useEffect } from "react"
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
import { Download, Calendar, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react"
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
import { useApi } from "@/hooks/use-api"
import { bookingService, authService } from "@/services"
import type { Booking } from "@/services/types"

// ── Chart configs ──────────────────────────────────────────────────────────

const weeklyChartConfig = {
  confirmed: { label: "Confirmed", color: "hsl(185, 60%, 42%)" },
  rejected: { label: "Rejected", color: "hsl(0, 72%, 51%)" },
}

const hourlyChartConfig = {
  trucks: { label: "Trucks", color: "hsl(210, 65%, 45%)" },
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "hsl(145, 63%, 42%)",
  CONSUMED: "hsl(210, 65%, 45%)",
  PENDING: "hsl(38, 92%, 50%)",
  REJECTED: "hsl(0, 72%, 51%)",
  CANCELLED: "hsl(215, 15%, 65%)",
  EXPIRED: "hsl(280, 50%, 55%)",
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDayCutoff(range: string): Date {
  const now = new Date()
  const d = new Date(now)
  switch (range) {
    case "1d": d.setDate(d.getDate() - 1); break
    case "7d": d.setDate(d.getDate() - 7); break
    case "30d": d.setDate(d.getDate() - 30); break
    case "90d": d.setDate(d.getDate() - 90); break
  }
  return d
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OperatorReportsPage() {
  const [terminalId, setTerminalId] = useState<string | null>(null)

  // Get operator's assigned terminal
  useEffect(() => {
    authService.getProfile().then((user) => {
      setTerminalId(user.terminal?.id ?? user.operatorTerminals?.[0]?.terminalId ?? null)
    })
  }, [])

  const { data: bookings, loading, error, refetch } = useApi<Booking[]>(
    () => terminalId ? bookingService.getBookings({ terminalId }) : Promise.resolve([]),
    [terminalId],
  )

  const [range, setRange] = useState("7d")

  const filtered = useMemo(() => {
    if (!bookings) return []
    const cutoff = getDayCutoff(range)
    return bookings.filter((b) => new Date(b.createdAt) >= cutoff)
  }, [bookings, range])

  // Weekly processing trend
  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const map: Record<string, { confirmed: number; rejected: number }> = {}
    days.forEach((d) => (map[d] = { confirmed: 0, rejected: 0 }))
    filtered.forEach((b) => {
      const day = days[new Date(b.createdAt).getDay()]
      if (b.status === "CONFIRMED" || b.status === "CONSUMED") map[day].confirmed++
      if (b.status === "REJECTED") map[day].rejected++
    })
    return days.slice(1).concat(days[0]).map((d) => ({ day: d, ...map[d] }))
  }, [filtered])

  // Hourly distribution
  const hourlyDistribution = useMemo(() => {
    const hours = Array.from({ length: 16 }, (_, i) => {
      const h = i + 6
      return { hour: `${String(h).padStart(2, "0")}:00`, trucks: 0 }
    })
    filtered.forEach((b) => {
      if (!b.timeSlot?.startTime) return
      const h = parseInt(b.timeSlot.startTime.split(":")[0], 10)
      const idx = h - 6
      if (idx >= 0 && idx < hours.length) hours[idx].trucks++
    })
    return hours
  }, [filtered])

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach((b) => { counts[b.status] = (counts[b.status] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] ?? "hsl(215, 15%, 65%)",
    }))
  }, [filtered])

  // Top carriers
  const topCarriers = useMemo(() => {
    const map: Record<string, number> = {}
    filtered.forEach((b) => {
      const name = b.carrier.companyName
      map[name] = (map[name] || 0) + 1
    })
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, bookings]) => ({ name, bookings }))
  }, [filtered])

  // Summary stats
  const totalProcessed = filtered.length
  const approvalRate = totalProcessed > 0
    ? (filtered.filter((b) => b.status === "CONFIRMED" || b.status === "CONSUMED").length / totalProcessed * 100).toFixed(1)
    : "0.0"

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="gap-2" onClick={refetch}><RefreshCw className="h-4 w-4" /> Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Operations performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-9 w-[150px] gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard loading={loading} label="Bookings Processed" value={String(totalProcessed)} />
        <SummaryCard loading={loading} label="Approval Rate" value={`${approvalRate}%`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Trend */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">Weekly Processing Trend</CardTitle>
            <CardDescription>Bookings confirmed vs rejected</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[280px] w-full" /> : (
              <>
                <ChartContainer config={weeklyChartConfig} className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="confirmed" fill="var(--color-confirmed)" radius={[4, 4, 0, 0]} barSize={18} />
                      <Bar dataKey="rejected" fill="var(--color-rejected)" radius={[4, 4, 0, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-3 flex items-center justify-center gap-5">
                  {Object.entries(weeklyChartConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: config.color }} />
                      <span className="text-xs text-muted-foreground">{config.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Pie */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">Booking Status</CardTitle>
            <CardDescription>Distribution for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[200px] w-full" /> : (
              <>
                <div className="flex h-[200px] items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
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
        {/* Hourly Traffic */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">Hourly Traffic Pattern</CardTitle>
            <CardDescription>Truck arrivals by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[240px] w-full" /> : (
              <ChartContainer config={hourlyChartConfig} className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} interval={1} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="trucks" fill="var(--color-trucks)" fillOpacity={0.2} stroke="var(--color-trucks)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Carriers */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">Top Carriers</CardTitle>
            <CardDescription>Booking volume by carrier</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[240px] w-full" /> : topCarriers.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No carrier data for this period.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {topCarriers.map((carrier, idx) => {
                  const maxBookings = topCarriers[0].bookings
                  const pct = Math.round((carrier.bookings / maxBookings) * 100)
                  return (
                    <div key={carrier.name} className="flex items-center gap-4">
                      <span className="w-5 text-right text-xs font-bold text-muted-foreground">{idx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{carrier.name}</p>
                          <span className="text-xs text-muted-foreground">{carrier.bookings} bookings</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-[hsl(185,60%,42%)] transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({ loading, label, value }: { loading: boolean; label: string; value: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="mt-1 h-8 w-20" /> : (
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}
