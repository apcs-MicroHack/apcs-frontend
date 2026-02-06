"use client"

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
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react"
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

// Weekly processing trend for Terminal A
const weeklyData = [
  { day: "Mon", processed: 58, approved: 52, rejected: 6 },
  { day: "Tue", processed: 63, approved: 59, rejected: 4 },
  { day: "Wed", processed: 71, approved: 65, rejected: 6 },
  { day: "Thu", processed: 65, approved: 61, rejected: 4 },
  { day: "Fri", processed: 68, approved: 63, rejected: 5 },
  { day: "Sat", processed: 42, approved: 40, rejected: 2 },
  { day: "Sun", processed: 24, approved: 23, rejected: 1 },
]

// Hourly distribution for Terminal A
const hourlyDistribution = [
  { hour: "06:00", trucks: 12 },
  { hour: "07:00", trucks: 18 },
  { hour: "08:00", trucks: 17 },
  { hour: "09:00", trucks: 20 },
  { hour: "10:00", trucks: 14 },
  { hour: "11:00", trucks: 10 },
  { hour: "12:00", trucks: 8 },
  { hour: "13:00", trucks: 6 },
  { hour: "14:00", trucks: 16 },
  { hour: "15:00", trucks: 13 },
  { hour: "16:00", trucks: 15 },
  { hour: "17:00", trucks: 11 },
  { hour: "18:00", trucks: 7 },
  { hour: "19:00", trucks: 4 },
]

// Status distribution
const statusData = [
  { name: "Approved", value: 287, color: "hsl(145, 63%, 42%)" },
  { name: "Completed", value: 142, color: "hsl(210, 65%, 45%)" },
  { name: "Pending", value: 18, color: "hsl(38, 92%, 50%)" },
  { name: "Rejected", value: 21, color: "hsl(0, 72%, 51%)" },
  { name: "Cancelled", value: 8, color: "hsl(215, 15%, 65%)" },
]

// Top carriers at Terminal A
const topCarriers = [
  { name: "MedTransport SA", bookings: 98, avgWait: "8 min" },
  { name: "Algiers Freight Co", bookings: 82, avgWait: "12 min" },
  { name: "Sahel Logistics", bookings: 64, avgWait: "6 min" },
  { name: "Djurdjura Trans", bookings: 51, avgWait: "10 min" },
  { name: "Oran Maritime", bookings: 43, avgWait: "14 min" },
]

const weeklyChartConfig = {
  approved: { label: "Approved", color: "hsl(185, 60%, 42%)" },
  rejected: { label: "Rejected", color: "hsl(0, 72%, 51%)" },
}

const hourlyChartConfig = {
  trucks: { label: "Trucks", color: "hsl(210, 65%, 45%)" },
}

export default function OperatorReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Terminal A operations performance and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="7d">
            <SelectTrigger className="h-9 w-[150px] gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Bookings Processed" value="391" change="+18.2%" trend="up" period="this week" />
        <SummaryCard label="Avg. Processing Time" value="4.2 min" change="-15%" trend="down" period="vs last week" />
        <SummaryCard label="Approval Rate" value="93.6%" change="+2.1%" trend="up" period="vs last week" />
        <SummaryCard label="Avg. Queue Wait" value="9.8 min" change="-22%" trend="down" period="vs last week" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Processing Trend */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Weekly Processing Trend
            </CardTitle>
            <CardDescription>Bookings approved vs rejected at Terminal A</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weeklyChartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="approved" fill="var(--color-approved)" radius={[4, 4, 0, 0]} barSize={18} />
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
          </CardContent>
        </Card>

        {/* Status Pie */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Booking Status
            </CardTitle>
            <CardDescription>Current week distribution</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Hourly Traffic */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Hourly Traffic Pattern
            </CardTitle>
            <CardDescription>Average truck arrivals at Terminal A</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Top Carriers */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Top Carriers at Terminal A
            </CardTitle>
            <CardDescription>Booking volume and average wait time</CardDescription>
          </CardHeader>
          <CardContent>
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
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{carrier.bookings} bookings</span>
                          <span className="w-14 text-right text-xs text-muted-foreground">{carrier.avgWait}</span>
                        </div>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-[hsl(185,60%,42%)] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  change,
  trend,
  period,
}: {
  label: string
  value: string
  change: string
  trend: "up" | "down"
  period: string
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          {trend === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
          )}
          <span className="text-xs font-medium text-[hsl(var(--success))]">{change}</span>
          <span className="text-xs text-muted-foreground">{period}</span>
        </div>
      </CardContent>
    </Card>
  )
}
