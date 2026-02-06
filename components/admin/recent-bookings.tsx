"use client"

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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/hooks/use-api"
import { bookingService } from "@/services"
import type { Booking, BookingStatus } from "@/services/types"
import Link from "next/link"

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pending",   className: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))]/15" },
  CONFIRMED: { label: "Confirmed", className: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/15" },
  REJECTED:  { label: "Rejected",  className: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/15" },
  CONSUMED:  { label: "Consumed",  className: "bg-[hsl(210,65%,45%)]/10 text-[hsl(210,65%,45%)] hover:bg-[hsl(210,65%,45%)]/15" },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground hover:bg-muted/80" },
  EXPIRED:   { label: "Expired",   className: "bg-muted text-muted-foreground hover:bg-muted/80" },
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "" }
  return <Badge className={`border-0 ${cfg.className}`}>{cfg.label}</Badge>
}

export function RecentBookings() {
  const { data: bookings, loading } = useApi<Booking[]>(
    () => bookingService.getBookings(),
    [],
  )

  /* Show latest 8 bookings sorted by creation date */
  const recent = (bookings ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest booking activity across all terminals</CardDescription>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-medium text-[hsl(185,60%,42%)] transition-colors hover:text-[hsl(185,60%,35%)]"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {loading ? (
          <div className="space-y-3 px-6 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">
            No bookings yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wider">Booking ID</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Carrier</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">Terminal</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">Date</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider xl:table-cell">Time Slot</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider xl:table-cell">Truck Plate</TableHead>
                <TableHead className="pr-6 text-right text-xs uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((b) => (
                <TableRow key={b.id} className="cursor-pointer">
                  <TableCell className="pl-6 font-mono text-xs font-medium text-foreground">
                    {b.bookingNumber}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {b.carrier.companyName}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {b.terminal.name}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {new Date(b.timeSlot.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                    {b.timeSlot.startTime} - {b.timeSlot.endTime}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground xl:table-cell">
                    {b.truck.plateNumber}
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
