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
} from "recharts"
import { Calendar, RefreshCw, AlertCircle } from "lucide-react"
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
import type { BookingSummaryResponse } from "@/services/booking.service"

// ── Chart configs ──────────────────────────────────────────────────────────

const terminalChartConfig = {
  bookings: { label: "Bookings", color: "hsl(210, 65%, 45%)" },
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

function getDateRange(range: string): { startDate: string; endDate: string } {
  const now = new Date()
  const end = now.toISOString().split("T")[0]
  const start = new Date(now)
  switch (range) {
    case "1d": start.setDate(start.getDate() - 1); break
    case "7d": start.setDate(start.getDate() - 7); break
    case "30d": start.setDate(start.getDate() - 30); break
    case "90d": start.setDate(start.getDate() - 90); break
  }
  return { startDate: start.toISOString().split("T")[0], endDate: end }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OperatorReportsPage() {
  const [terminalId, setTerminalId] = useState<string | null>(null)
  const [range, setRange] = useState("7d")
  const dateRange = useMemo(() => getDateRange(range), [range])

  // Get operator's assigned terminal
  useEffect(() => {
    authService.getProfile().then((user) => {
      setTerminalId(user.terminal?.id ?? user.operatorTerminals?.[0]?.terminalId ?? null)
    })
  }, [])

  // Fetch summary for accurate counts by status (supports date filters)
  const { data: summaryData, loading, error, refetch } = useApi<BookingSummaryResponse>(
    () => terminalId
      ? bookingService.getBookingSummary({ terminalId, startDate: dateRange.startDate, endDate: dateRange.endDate })
      : Promise.resolve({ summary: [] }),
    [terminalId, dateRange.startDate, dateRange.endDate],
  )
  const summaryItems = summaryData?.summary ?? []
  const totalInRange = summaryItems.reduce((acc, s) => acc + s.count, 0)

  // Status distribution (from summary for accurate counts)
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    summaryItems.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + s.count })
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] ?? "hsl(215, 15%, 65%)",
    }))
  }, [summaryItems])

  // Summary stats (from summary for accurate counts)
  const totalProcessed = totalInRange
  const approvedCount = summaryItems
    .filter((s) => s.status === "CONFIRMED" || s.status === "CONSUMED")
    .reduce((acc, s) => acc + s.count, 0)
  const rejectedCount = summaryItems
    .filter((s) => s.status === "REJECTED")
    .reduce((acc, s) => acc + s.count, 0)
  const approvalRate = totalProcessed > 0
    ? ((approvedCount / totalProcessed) * 100).toFixed(1)
    : "0.0"
  const rejectionRate = totalProcessed > 0
    ? ((rejectedCount / totalProcessed) * 100).toFixed(1)
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard loading={loading} label="Bookings Processed" value={String(totalProcessed)} />
        <SummaryCard loading={loading} label="Approved" value={String(approvedCount)} />
        <SummaryCard loading={loading} label="Approval Rate" value={`${approvalRate}%`} />
        <SummaryCard loading={loading} label="Rejection Rate" value={`${rejectionRate}%`} />
      </div>

      {/* Status Pie Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base font-semibold text-foreground">Booking Status</CardTitle>
          <CardDescription>Distribution for selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[280px] w-full" /> : statusData.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No data for this period.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex h-[280px] items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center gap-3">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
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
