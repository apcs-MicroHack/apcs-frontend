"use client"

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

const weeklyData = [
  { day: "Mon", approved: 42, pending: 18, rejected: 5 },
  { day: "Tue", approved: 38, pending: 22, rejected: 3 },
  { day: "Wed", approved: 51, pending: 14, rejected: 7 },
  { day: "Thu", approved: 45, pending: 20, rejected: 4 },
  { day: "Fri", approved: 55, pending: 16, rejected: 6 },
  { day: "Sat", approved: 30, pending: 10, rejected: 2 },
  { day: "Sun", approved: 18, pending: 8, rejected: 1 },
]

const chartConfig = {
  approved: {
    label: "Approved",
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

export function BookingsChart() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Bookings Overview
        </CardTitle>
        <CardDescription>Weekly booking activity by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(214, 20%, 88%)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(215, 15%, 45%)" }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="approved"
                fill="var(--color-approved)"
                radius={[4, 4, 0, 0]}
                barSize={14}
              />
              <Bar
                dataKey="pending"
                fill="var(--color-pending)"
                radius={[4, 4, 0, 0]}
                barSize={14}
              />
              <Bar
                dataKey="rejected"
                fill="var(--color-rejected)"
                radius={[4, 4, 0, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-5">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs text-muted-foreground">
                {config.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
