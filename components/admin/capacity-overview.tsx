"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const terminals = [
  {
    name: "Terminal A",
    location: "North Quay",
    capacity: 85,
    slotsUsed: 17,
    slotsTotal: 20,
    status: "high" as const,
    peakHour: "09:00 - 10:00",
  },
  {
    name: "Terminal B",
    location: "South Quay",
    capacity: 62,
    slotsUsed: 12,
    slotsTotal: 20,
    status: "medium" as const,
    peakHour: "14:00 - 15:00",
  },
  {
    name: "Terminal C",
    location: "East Berth",
    capacity: 43,
    slotsUsed: 8,
    slotsTotal: 20,
    status: "low" as const,
    peakHour: "10:00 - 11:00",
  },
  {
    name: "Terminal D",
    location: "West Dock",
    capacity: 91,
    slotsUsed: 18,
    slotsTotal: 20,
    status: "critical" as const,
    peakHour: "08:00 - 09:00",
  },
]

function getCapacityColor(status: string) {
  switch (status) {
    case "critical":
      return "bg-[hsl(var(--destructive))]"
    case "high":
      return "bg-[hsl(var(--warning))]"
    case "medium":
      return "bg-[hsl(185,60%,42%)]"
    case "low":
      return "bg-[hsl(var(--success))]"
    default:
      return "bg-primary"
  }
}

function getCapacityLabel(status: string) {
  switch (status) {
    case "critical":
      return { text: "Critical", className: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]" }
    case "high":
      return { text: "High", className: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" }
    case "medium":
      return { text: "Medium", className: "bg-[hsl(185,60%,42%)]/10 text-[hsl(185,60%,42%)]" }
    case "low":
      return { text: "Low", className: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" }
    default:
      return { text: "Normal", className: "bg-primary/10 text-primary" }
  }
}

export function CapacityOverview() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Terminal Capacity
        </CardTitle>
        <CardDescription>Current hour slot utilization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          {terminals.map((terminal) => {
            const label = getCapacityLabel(terminal.status)
            return (
              <div key={terminal.name}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {terminal.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {terminal.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${label.className}`}
                    >
                      {label.text}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {terminal.capacity}%
                    </span>
                  </div>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all ${getCapacityColor(terminal.status)}`}
                    style={{ width: `${terminal.capacity}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    {terminal.slotsUsed} / {terminal.slotsTotal} trucks/hour
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Peak: {terminal.peakHour}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
