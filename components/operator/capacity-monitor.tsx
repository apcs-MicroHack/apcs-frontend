"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { slotService, authService } from "@/services"
import type { AvailabilitySlot } from "@/services/types"

function getHourStatus(booked: number, max: number) {
  if (max === 0) return { color: "bg-muted", textColor: "text-muted-foreground", label: "—" }
  const pct = Math.round((booked / max) * 100)
  if (pct >= 100) return { color: "bg-[hsl(var(--destructive))]", textColor: "text-[hsl(0,0%,100%)]", label: "Full" }
  if (pct >= 85) return { color: "bg-[hsl(var(--warning))]", textColor: "text-[hsl(0,0%,100%)]", label: `${pct}%` }
  if (pct >= 50) return { color: "bg-[hsl(185,60%,42%)]", textColor: "text-[hsl(0,0%,100%)]", label: `${pct}%` }
  return { color: "bg-[hsl(var(--success))]", textColor: "text-[hsl(0,0%,100%)]", label: `${pct}%` }
}

function isCurrentHour(startTime: string) {
  const now = new Date()
  const currentHour = now.getHours()
  const [h] = startTime.split(":").map(Number)
  return h === currentHour
}

export function CapacityMonitor() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const todayStr = new Date().toISOString().split("T")[0]

    // Get operator's assigned terminal, then fetch real slot availability
    authService.getProfile().then((user) => {
      const terminalId = user.terminal?.id ?? user.operatorTerminals?.[0]?.terminalId
      if (!terminalId) { if (mounted) setLoading(false); return }
      return slotService.getAvailableSlots(terminalId, todayStr, todayStr)
    }).then((resp) => {
      if (!mounted || !resp) return
      const dayData = resp.availability?.[0]
      if (dayData && !dayData.isClosed) {
        setSlots(dayData.slots ?? [])
      }
    }).catch(() => {}).finally(() => {
      if (mounted) setLoading(false)
    })

    return () => { mounted = false }
  }, [])

  const totalBooked = slots.reduce((s, t) => s + (t.bookedCount ?? 0), 0)
  const totalMax = slots.reduce((s, t) => s + (t.maxCapacity ?? 0), 0)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Today&apos;s Capacity
        </CardTitle>
        <CardDescription>
          {totalBooked}/{totalMax} total slots used
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No slots configured for today.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
            {slots.map((slot) => {
              const status = getHourStatus(slot.bookedCount, slot.maxCapacity)
              const current = isCurrentHour(slot.startTime)
              return (
                <div
                  key={slot.startTime}
                  className={`relative rounded-lg border p-2.5 text-center transition-colors ${
                    current
                      ? "border-[hsl(210,65%,45%)] bg-[hsl(210,65%,45%)]/5 ring-1 ring-[hsl(210,65%,45%)]/20"
                      : "border-border bg-muted/30"
                  }`}
                >
                  {current && (
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-[hsl(210,65%,45%)] px-1.5 py-0.5 text-[8px] font-semibold leading-none text-[hsl(0,0%,100%)]">
                        NOW
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] font-semibold text-foreground">{slot.startTime.slice(0, 5)}</p>
                  <div className={`mx-auto mt-1.5 flex h-7 w-7 items-center justify-center rounded-full ${status.color}`}>
                    <span className={`text-[9px] font-bold ${status.textColor}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    {slot.bookedCount}/{slot.maxCapacity}
                  </p>
                </div>
              )
            })}
          </div>
        )}

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
