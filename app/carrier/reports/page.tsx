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

const monthlyData = [
  { month: "Sep", bookings: 28 },
  { month: "Oct", bookings: 34 },
  { month: "Nov", bookings: 31 },
  { month: "Dec", bookings: 25 },
  { month: "Jan", bookings: 42 },
  { month: "Feb", bookings: 38 },
]

const statusData = [
  { name: "Completed", value: 38, color: "hsl(145, 63%, 42%)" },
  { name: "Approved", value: 8, color: "hsl(210, 65%, 45%)" },
  { name: "Pending", value: 4, color: "hsl(38, 92%, 50%)" },
  { name: "Rejected", value: 2, color: "hsl(0, 72%, 51%)" },
]

const terminalUsage = [
  { terminal: "Term. A", bookings: 18 },
  { terminal: "Term. B", bookings: 10 },
  { terminal: "Term. C", bookings: 5 },
  { terminal: "Term. D", bookings: 15 },
]

const topTrucks = [
  { plate: "00216-142-AB", bookings: 142, share: 28 },
  { plate: "00216-142-FF", bookings: 114, share: 22 },
  { plate: "00216-142-MN", bookings: 98, share: 19 },
  { plate: "00216-142-WX", bookings: 76, share: 15 },
  { plate: "Others", bookings: 82, share: 16 },
]

const monthlyChartConfig = {
  bookings: { label: "Bookings", color: "hsl(185, 60%, 42%)" },
}

const terminalChartConfig = {
  bookings: { label: "Bookings", color: "hsl(210, 65%, 45%)" },
}

export default function CarrierReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Your booking statistics and historical trends
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <SummaryCard label="Total Bookings" value="52" change="+15.2%" trend="up" period="vs last month" />
        <SummaryCard label="Completion Rate" value="95.2%" change="+2.1%" trend="up" period="vs last month" />
        <SummaryCard label="Active Vehicles" value="7 / 8" change="+1" trend="up" period="vs last month" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Monthly Booking Trend
            </CardTitle>
            <CardDescription>Your bookings over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyChartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="bookings" fill="var(--color-bookings)" fillOpacity={0.2} stroke="var(--color-bookings)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Booking Status
            </CardTitle>
            <CardDescription>Current month breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
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

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Terminal Usage
            </CardTitle>
            <CardDescription>Your bookings by terminal this month</CardDescription>
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

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Top Vehicles by Usage
            </CardTitle>
            <CardDescription>Booking volume by truck this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {topTrucks.map((truck, idx) => (
                <div key={truck.plate} className="flex items-center gap-4">
                  <span className="w-5 text-right text-xs font-bold text-muted-foreground">{idx + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm font-medium text-foreground">{truck.plate}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{truck.bookings} bookings</span>
                        <span className="w-10 text-right text-xs font-semibold text-foreground">{truck.share}%</span>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-[hsl(210,65%,45%)] transition-all" style={{ width: `${truck.share}%` }} />
                    </div>
                  </div>
                </div>
              ))}
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
