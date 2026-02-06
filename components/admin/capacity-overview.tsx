"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/hooks/use-api"
import { terminalService, slotService } from "@/services"
import type { Terminal, AvailabilityResponse } from "@/services/types"

function capacityLevel(pct: number) {
  if (pct >= 90) return { text: "Critical", className: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]", bar: "bg-[hsl(var(--destructive))]" }
  if (pct >= 70) return { text: "High", className: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", bar: "bg-[hsl(var(--warning))]" }
  if (pct >= 40) return { text: "Medium", className: "bg-[hsl(185,60%,42%)]/10 text-[hsl(185,60%,42%)]", bar: "bg-[hsl(185,60%,42%)]" }
  return { text: "Low", className: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", bar: "bg-[hsl(var(--success))]" }
}

function todayStr() {
  return new Date().toISOString().split("T")[0]
}

export function CapacityOverview() {
  const { data: terminals, loading } = useApi<Terminal[]>(
    () => terminalService.getTerminals(),
    [],
  )

  // Fetch today's slots per terminal to compute utilization
  const [slotMap, setSlotMap] = useState<Record<string, { booked: number; capacity: number }>>({})
  const [slotsLoading, setSlotsLoading] = useState(false)

  useEffect(() => {
    if (!terminals?.length) return
    const active = terminals.filter((t) => t.isActive)
    if (!active.length) return
    setSlotsLoading(true)
    const today = todayStr()
    Promise.allSettled(
      active.map((t) =>
        slotService.getAvailableSlots(t.id, today).then((response: AvailabilityResponse) => {
          // Extract slots from the availability array (first day)
          const dayData = response.availability?.[0]
          const slots = dayData?.slots ?? []
          return {
            id: t.id,
            booked: slots.reduce((s, sl) => s + sl.bookedCount, 0),
            capacity: slots.reduce((s, sl) => s + sl.maxCapacity, 0),
          }
        }),
      ),
    ).then((results) => {
      const map: Record<string, { booked: number; capacity: number }> = {}
      for (const r of results) {
        if (r.status === "fulfilled") map[r.value.id] = r.value
      }
      setSlotMap(map)
      setSlotsLoading(false)
    })
  }, [terminals])

  const isLoading = loading || slotsLoading

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Terminal Capacity
        </CardTitle>
        <CardDescription>Today&apos;s utilization across active terminals</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : !terminals?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No terminals configured.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {terminals
              .filter((t) => t.isActive)
              .map((terminal) => {
                const usage = slotMap[terminal.id]
                const pct = usage && usage.capacity > 0 ? Math.round((usage.booked / usage.capacity) * 100) : 0
                const level = capacityLevel(pct)
                return (
                  <div key={terminal.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {terminal.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {terminal.code} &middot; {terminal.type}
                          {usage ? ` · ${usage.booked}/${usage.capacity} trucks` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{pct}%</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${level.className}`}
                        >
                          {level.text}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all ${level.bar}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
