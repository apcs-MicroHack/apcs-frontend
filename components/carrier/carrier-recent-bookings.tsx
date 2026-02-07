"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/hooks/use-api"
import { bookingService } from "@/services"
import type { Booking, BookingStatus } from "@/services/types"
import type { PaginatedBookingsResponse } from "@/services/booking.service"

const STATUS_STYLES: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  PENDING:   { bg: "bg-[hsl(var(--warning))]/10",      text: "text-[hsl(var(--warning))]",      label: "Pending" },
  CONFIRMED: { bg: "bg-[hsl(var(--success))]/10",      text: "text-[hsl(var(--success))]",      label: "Confirmed" },
  REJECTED:  { bg: "bg-[hsl(var(--destructive))]/10",  text: "text-[hsl(var(--destructive))]",  label: "Rejected" },
  CONSUMED:  { bg: "bg-[hsl(210,65%,45%)]/10",         text: "text-[hsl(210,65%,45%)]",         label: "Completed" },
  CANCELLED: { bg: "bg-muted",                         text: "text-muted-foreground",            label: "Cancelled" },
  EXPIRED:   { bg: "bg-muted",                         text: "text-muted-foreground",            label: "Expired" },
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLES[status] ?? { bg: "", text: "", label: status }
  return <Badge className={`border-0 ${s.bg} ${s.text}`}>{s.label}</Badge>
}

export function CarrierRecentBookings() {
  const { data, loading } = useApi<PaginatedBookingsResponse>(
    () => bookingService.getBookings({ limit: 5 }),
    [],
  )

  const recent = data?.bookings ?? []

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Recent Bookings
          </CardTitle>
          <CardDescription>Your latest booking requests</CardDescription>
        </div>
        <Link href="/carrier/bookings">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-3 px-6 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">
            No bookings yet. Create your first booking!
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wider">ID</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Terminal</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">Date</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">Time Slot</TableHead>
                <TableHead className="pr-6 text-right text-xs uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="pl-6 font-mono text-xs font-medium text-foreground">
                    {b.bookingNumber}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.terminal.name}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {new Date(b.timeSlot.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {b.timeSlot.startTime}-{b.timeSlot.endTime}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <StatusBadge status={b.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
