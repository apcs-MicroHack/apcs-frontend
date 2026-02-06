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

const hourlyData = [
  { hour: "06", approved: 10, pending: 2, rejected: 0 },
  { hour: "07", approved: 15, pending: 3, rejected: 1 },
  { hour: "08", approved: 14, pending: 3, rejected: 0 },
  { hour: "09", approved: 12, pending: 6, rejected: 2 },
  { hour: "10", approved: 8, pending: 4, rejected: 0 },
  { hour: "11", approved: 6, pending: 2, rejected: 0 },
  { hour: "12", approved: 4, pending: 2, rejected: 0 },
  { hour: "13", approved: 3, pending: 1, rejected: 0 },
  { hour: "14", approved: 10, pending: 4, rejected: 0 },
  { hour: "15", approved: 7, pending: 3, rejected: 0 },
  { hour: "16", approved: 9, pending: 4, rejected: 0 },
  { hour: "17", approved: 5, pending: 2, rejected: 0 },
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

export function HourlyActivityChart() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Today&apos;s Activity
        </CardTitle>
        <CardDescription>Hourly booking processing at Terminal A</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer id="hourly-activity" config={chartConfig} className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyData}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(214, 20%, 88%)"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: "hsl(215, 15%, 45%)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}:00`}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(215, 15%, 45%)" }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="approved"
                fill="var(--color-approved)"
                radius={[3, 3, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="pending"
                fill="var(--color-pending)"
                radius={[3, 3, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="rejected"
                fill="var(--color-rejected)"
                radius={[3, 3, 0, 0]}
                barSize={12}
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
