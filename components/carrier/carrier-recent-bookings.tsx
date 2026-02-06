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

type BookingStatus = "approved" | "pending" | "rejected" | "completed"

const recentBookings = [
  { id: "BK-2026-0892", terminal: "Terminal A", date: "Feb 6", timeSlot: "08:00-09:00", status: "approved" as BookingStatus },
  { id: "BK-2026-0891", terminal: "Terminal D", date: "Feb 6", timeSlot: "10:00-11:00", status: "pending" as BookingStatus },
  { id: "BK-2026-0890", terminal: "Terminal B", date: "Feb 6", timeSlot: "14:00-15:00", status: "approved" as BookingStatus },
  { id: "BK-2026-0889", terminal: "Terminal C", date: "Feb 5", timeSlot: "06:00-07:00", status: "rejected" as BookingStatus },
  { id: "BK-2026-0888", terminal: "Terminal A", date: "Feb 5", timeSlot: "12:00-13:00", status: "completed" as BookingStatus },
]

function getStatusBadge(status: BookingStatus) {
  const styles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
    approved: { bg: "bg-[hsl(var(--success))]/10", text: "text-[hsl(var(--success))]", label: "Approved" },
    pending: { bg: "bg-[hsl(var(--warning))]/10", text: "text-[hsl(var(--warning))]", label: "Pending" },
    rejected: { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]", label: "Rejected" },
    completed: { bg: "bg-[hsl(210,65%,45%)]/10", text: "text-[hsl(210,65%,45%)]", label: "Completed" },
  }
  const s = styles[status]
  return <Badge className={`border-0 ${s.bg} ${s.text} hover:${s.bg}`}>{s.label}</Badge>
}

export function CarrierRecentBookings() {
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
            {recentBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="pl-6 font-mono text-xs font-medium text-foreground">
                  {booking.id}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{booking.terminal}</TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{booking.date}</TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{booking.timeSlot}</TableCell>
                <TableCell className="pr-6 text-right">{getStatusBadge(booking.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
