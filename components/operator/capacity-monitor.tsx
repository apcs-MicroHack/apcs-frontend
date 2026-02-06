"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const timeSlots = [
  { hour: "06:00", booked: 12, max: 15 },
  { hour: "07:00", booked: 18, max: 20 },
  { hour: "08:00", booked: 17, max: 20 },
  { hour: "09:00", booked: 20, max: 20 },
  { hour: "10:00", booked: 14, max: 20 },
  { hour: "11:00", booked: 10, max: 18 },
  { hour: "12:00", booked: 8, max: 12 },
  { hour: "13:00", booked: 6, max: 12 },
  { hour: "14:00", booked: 16, max: 20 },
  { hour: "15:00", booked: 13, max: 20 },
  { hour: "16:00", booked: 15, max: 18 },
  { hour: "17:00", booked: 11, max: 15 },
]

function getHourStatus(booked: number, max: number) {
  const pct = Math.round((booked / max) * 100)
  if (pct >= 100) return { color: "bg-[hsl(var(--destructive))]", textColor: "text-[hsl(0,0%,100%)]", label: "Full" }
  if (pct >= 85) return { color: "bg-[hsl(var(--warning))]", textColor: "text-[hsl(0,0%,100%)]", label: `${pct}%` }
  if (pct >= 50) return { color: "bg-[hsl(185,60%,42%)]", textColor: "text-[hsl(0,0%,100%)]", label: `${pct}%` }
  return { color: "bg-[hsl(var(--success))]", textColor: "text-[hsl(0,0%,100%)]", label: `${pct}%` }
}

function isCurrentHour(hour: string) {
  const now = new Date()
  const currentHour = now.getHours().toString().padStart(2, "0") + ":00"
  return hour === currentHour
}

export function CapacityMonitor() {
  const totalBooked = timeSlots.reduce((s, t) => s + t.booked, 0)
  const totalMax = timeSlots.reduce((s, t) => s + t.max, 0)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Today&apos;s Capacity
        </CardTitle>
        <CardDescription>
          Terminal A &middot; {totalBooked}/{totalMax} total slots filled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {timeSlots.map((slot) => {
            const status = getHourStatus(slot.booked, slot.max)
            const current = isCurrentHour(slot.hour)
            return (
              <div
                key={slot.hour}
                className={`relative rounded-lg border p-2.5 text-center transition-colors ${
                  current
                    ? "border-[hsl(210,65%,45%)] bg-[hsl(210,65%,45%)]/5 ring-1 ring-[hsl(210,65%,45%)]/20"
                    : "border-border bg-muted/30"
                }`}
              >
                {current && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-[hsl(210,65%,45%)] px-1.5 py-0 text-[8px] font-semibold text-[hsl(0,0%,100%)]">
                      NOW
                    </span>
                  </div>
                )}
                <p className="text-[11px] font-semibold text-foreground">{slot.hour}</p>
                <div className={`mx-auto mt-1.5 flex h-7 w-7 items-center justify-center rounded-full ${status.color}`}>
                  <span className={`text-[9px] font-bold ${status.textColor}`}>
                    {status.label}
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {slot.booked}/{slot.max}
                </p>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
            <span className="text-[10px] text-muted-foreground">{"< 50%"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[hsl(185,60%,42%)]" />
            <span className="text-[10px] text-muted-foreground">50-85%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--warning))]" />
            <span className="text-[10px] text-muted-foreground">85-99%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--destructive))]" />
            <span className="text-[10px] text-muted-foreground">Full</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
