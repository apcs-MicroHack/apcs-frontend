"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/hooks/use-api"
import { bookingService, authService } from "@/services"
import type { PaginatedBookingsResponse } from "@/services/booking.service"
import type { Booking } from "@/services/types"

const EMPTY_RESPONSE: PaginatedBookingsResponse = { bookings: [], pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 } }
import Link from "next/link"

export function LiveQueuePreview() {
  const [terminalId, setTerminalId] = useState<string | null>(null)

  // Get operator's assigned terminal
  useEffect(() => {
    authService.getProfile().then((user) => {
      setTerminalId(user.terminal?.id ?? user.operatorTerminals?.[0]?.terminalId ?? null)
    })
  }, [])

  const { data, loading, refetch } = useApi<PaginatedBookingsResponse>(
    () => terminalId ? bookingService.getBookings({ terminalId, status: "PENDING" }) : Promise.resolve(EMPTY_RESPONSE),
    [terminalId],
  )
  const bookings = data?.bookings ?? []
  const [processing, setProcessing] = useState<string | null>(null)

  const handleConfirm = async (id: string) => {
    setProcessing(id)
    try {
      await bookingService.confirmBooking(id)
      toast.success("Booking confirmed successfully")
      refetch()
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error ?? "Failed to confirm booking"
      toast.error(msg)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessing(id)
    try {
      await bookingService.rejectBooking(id, "Rejected by operator")
      toast.success("Booking rejected")
      refetch()
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error ?? "Failed to reject booking"
      toast.error(msg)
    } finally {
      setProcessing(null)
    }
  }

  const queue = bookings ?? []

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Pending Validations
            </CardTitle>
            <CardDescription>
              {queue.length} booking{queue.length !== 1 ? "s" : ""} awaiting review
            </CardDescription>
          </div>
          <Link href="/operator/queue">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-[hsl(185,60%,42%)]">
              View all
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {queue.slice(0, 4).map((item) => {
              const isProcessing = processing === item.id
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-background p-3 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs font-semibold text-foreground">
                        {item.bookingNumber}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          item.cargoType === "IMPORT"
                            ? "border-[hsl(210,65%,45%)]/30 px-1.5 py-0 text-[9px] text-[hsl(210,65%,45%)]"
                            : "border-[hsl(185,60%,42%)]/30 px-1.5 py-0 text-[9px] text-[hsl(185,60%,42%)]"
                        }
                      >
                        {item.cargoType === "IMPORT" ? "IMP" : item.cargoType === "EXPORT" ? "EXP" : item.cargoType}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.carrier.companyName} &middot; {item.truck.plateNumber}
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {item.timeSlot.startTime} - {item.timeSlot.endTime}
                      </span>
                      {item.containerNumber && (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {item.containerNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/10 hover:text-[hsl(var(--success))]"
                      disabled={isProcessing}
                      onClick={() => handleConfirm(item.id)}
                      aria-label="Confirm booking"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))]"
                      disabled={isProcessing}
                      onClick={() => handleReject(item.id)}
                      aria-label="Reject booking"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
            {queue.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2 className="h-8 w-8 text-[hsl(var(--success))]/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  All bookings have been reviewed.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
