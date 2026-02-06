"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

// Monthly booking trend
const monthlyData = [
  { month: "Sep", bookings: 820, capacity: 1200 },
  { month: "Oct", bookings: 940, capacity: 1200 },
  { month: "Nov", bookings: 1050, capacity: 1200 },
  { month: "Dec", bookings: 870, capacity: 1200 },
  { month: "Jan", bookings: 1120, capacity: 1400 },
  { month: "Feb", bookings: 1284, capacity: 1400 },
]

// Terminal usage breakdown
const terminalUsage = [
  { terminal: "Term. A", bookings: 380, utilization: 85 },
  { terminal: "Term. B", bookings: 310, utilization: 62 },
  { terminal: "Term. C", bookings: 215, utilization: 43 },
  { terminal: "Term. D", bookings: 379, utilization: 91 },
]

// Booking status distribution
const statusData = [
  { name: "Approved", value: 742, color: "hsl(145, 63%, 42%)" },
  { name: "Completed", value: 328, color: "hsl(210, 65%, 45%)" },
  { name: "Pending", value: 124, color: "hsl(38, 92%, 50%)" },
  { name: "Rejected", value: 58, color: "hsl(0, 72%, 51%)" },
  { name: "Cancelled", value: 32, color: "hsl(215, 15%, 65%)" },
]

// Hourly distribution
const hourlyDistribution = [
  { hour: "06:00", trucks: 28 },
  { hour: "07:00", trucks: 54 },
  { hour: "08:00", trucks: 68 },
  { hour: "09:00", trucks: 72 },
  { hour: "10:00", trucks: 52 },
  { hour: "11:00", trucks: 40 },
  { hour: "12:00", trucks: 26 },
  { hour: "13:00", trucks: 22 },
  { hour: "14:00", trucks: 64 },
  { hour: "15:00", trucks: 49 },
  { hour: "16:00", trucks: 50 },
  { hour: "17:00", trucks: 34 },
  { hour: "18:00", trucks: 20 },
  { hour: "19:00", trucks: 11 },
  { hour: "20:00", trucks: 5 },
]

// Top carriers
const topCarriers = [
  { name: "Atlas Shipping", bookings: 421, share: 32.8 },
  { name: "MedTransport SA", bookings: 342, share: 26.6 },
  { name: "Algiers Freight", bookings: 287, share: 22.4 },
  { name: "Oran Maritime", bookings: 198, share: 15.4 },
  { name: "Others", bookings: 36, share: 2.8 },
]

const monthlyChartConfig = {
  bookings: { label: "Bookings", color: "hsl(185, 60%, 42%)" },
  capacity: { label: "Capacity", color: "hsl(214, 20%, 85%)" },
}

const terminalChartConfig = {
  bookings: { label: "Bookings", color: "hsl(210, 65%, 45%)" },
}

const hourlyChartConfig = {
  trucks: { label: "Trucks", color: "hsl(185, 60%, 42%)" },
}

export default function AdminReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Usage statistics, capacity utilization, and historical trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="h-9 w-[150px] gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
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
        <SummaryCard label="Total Bookings" value="1,284" change="+12.5%" trend="up" period="vs last month" />
        <SummaryCard label="Avg. Utilization" value="70.3%" change="+5.1%" trend="up" period="vs last month" />
        <SummaryCard label="Peak Hour Load" value="72 trucks" change="+8 trucks" trend="up" period="09:00 today" />
        <SummaryCard label="Rejection Rate" value="4.5%" change="-1.2%" trend="down" period="vs last month" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Trend */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Monthly Booking Trend
            </CardTitle>
            <CardDescription>Bookings vs available capacity over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyChartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="capacity" fill="var(--color-capacity)" fillOpacity={0.15} stroke="var(--color-capacity)" strokeWidth={1.5} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="bookings" fill="var(--color-bookings)" fillOpacity={0.2} stroke="var(--color-bookings)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Booking Status
            </CardTitle>
            <CardDescription>Current month distribution</CardDescription>
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
        {/* Terminal Usage */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Terminal Usage
            </CardTitle>
            <CardDescription>Bookings by terminal this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={terminalChartConfig} className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={terminalUsage} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" vertical={false} />
                  <XAxis dataKey="terminal" tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Hourly Traffic Pattern
            </CardTitle>
            <CardDescription>Average truck arrivals by hour</CardDescription>
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
      </div>

      {/* Top Carriers */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Top Carriers by Volume
          </CardTitle>
          <CardDescription>Booking share by carrier this month</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
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
