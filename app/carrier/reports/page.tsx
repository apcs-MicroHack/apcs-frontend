"use client"

import { useState, useMemo } from "react"
import {
  Calendar as CalendarIcon,
  RefreshCw,
  AlertCircle,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useApi } from "@/hooks/use-api"
import { bookingService } from "@/services"
import type { BookingSummaryResponse } from "@/services/booking.service"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  CONSUMED: "#10b981",
  REJECTED: "#ef4444",
  CANCELLED: "#6b7280",
  EXPIRED: "#d97706",
}

function formatDateStr(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function parseDateStr(str: string): Date {
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function formatDateDisplay(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function CarrierReportsPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return formatDateStr(d)
  })
  const [endDate, setEndDate] = useState(() => formatDateStr(new Date()))

  // Fetch summary for accurate counts by status/terminal
  const { data: summaryData, loading, error, refetch } = useApi<BookingSummaryResponse>(
    () => bookingService.getBookingSummary({ startDate, endDate }),
    [startDate, endDate],
  )
  const summaryItems = summaryData?.summary ?? []
  const totalInRange = summaryItems.reduce((acc, s) => acc + s.count, 0)

  // Status distribution (from summary for accurate counts)
  const statusData = useMemo(() => {
    if (!summaryItems.length) return []
    const counts: Record<string, number> = {}
    summaryItems.forEach((s) => { counts[s.status] = (counts[s.status] ?? 0) + s.count })
    return Object.entries(counts).map(([status, count]) => ({
      name: status.charAt(0) + status.slice(1).toLowerCase(),
      value: count,
      color: STATUS_COLORS[status] ?? "#6b7280",
    }))
  }, [summaryItems])

  // Terminal usage (from summary for accurate counts)
  const terminalData = useMemo(() => {
    if (!summaryItems.length) return []
    const counts: Record<string, number> = {}
    summaryItems.forEach((s) => {
      const name = s.terminal?.name ?? "Unknown"
      counts[name] = (counts[name] ?? 0) + s.count
    })
    return Object.entries(counts)
      .map(([terminal, count]) => ({ terminal, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)
  }, [summaryItems])

  // Summary stats (from summary for accurate counts)
  const summary = useMemo(() => {
    const total = totalInRange
    const completed = summaryItems
      .filter((s) => s.status === "CONSUMED")
      .reduce((acc, s) => acc + s.count, 0)
    const confirmed = summaryItems
      .filter((s) => s.status === "CONFIRMED")
      .reduce((acc, s) => acc + s.count, 0)
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
    const confirmRate = total > 0 ? Math.round((confirmed / total) * 100) : 0
    return { total, completed, rate, confirmRate }
  }, [summaryItems, totalInRange])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-72 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-10 w-10 text-[hsl(var(--destructive))]" />
        <p className="text-sm text-muted-foreground">Failed to load reports</p>
        <Button onClick={refetch} variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Insights into your booking activity</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 w-[140px] gap-2 text-xs">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {formatDateDisplay(parseDateStr(startDate))}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parseDateStr(startDate)}
                  onSelect={(d) => d && setStartDate(formatDateStr(d))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 w-[140px] gap-2 text-xs">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {formatDateDisplay(parseDateStr(endDate))}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parseDateStr(endDate)}
                  onSelect={(d) => d && setEndDate(formatDateStr(d))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={refetch} variant="outline" size="icon" className="h-9 w-9"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Bookings</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{summary.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="mt-1 text-2xl font-bold text-[hsl(var(--success))]">{summary.completed}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{summary.rate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-[hsl(185,60%,42%)]" /> Status Distribution
            </CardTitle>
            <CardDescription className="text-xs">Bookings by status</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="py-10 text-center text-xs text-muted-foreground">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Terminal Usage */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-[hsl(var(--warning))]" /> Terminal Usage
            </CardTitle>
            <CardDescription className="text-xs">Most used terminals</CardDescription>
          </CardHeader>
          <CardContent>
            {terminalData.length === 0 ? (
              <p className="py-10 text-center text-xs text-muted-foreground">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={terminalData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="terminal" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={100} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="bookings" fill="hsl(210,65%,45%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
