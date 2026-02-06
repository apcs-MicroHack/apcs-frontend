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

const bookings = [
  {
    id: "BK-2026-0892",
    carrier: "MedTransport SA",
    terminal: "Terminal A",
    date: "Feb 6, 2026",
    timeSlot: "08:00 - 09:00",
    truckPlate: "00216-142-AB",
    status: "approved" as const,
  },
  {
    id: "BK-2026-0891",
    carrier: "Algiers Freight Co",
    terminal: "Terminal D",
    date: "Feb 6, 2026",
    timeSlot: "10:00 - 11:00",
    truckPlate: "00216-231-CD",
    status: "pending" as const,
  },
  {
    id: "BK-2026-0890",
    carrier: "Sahel Logistics",
    terminal: "Terminal B",
    date: "Feb 6, 2026",
    timeSlot: "14:00 - 15:00",
    truckPlate: "00216-087-EF",
    status: "approved" as const,
  },
  {
    id: "BK-2026-0889",
    carrier: "Atlas Shipping",
    terminal: "Terminal C",
    date: "Feb 5, 2026",
    timeSlot: "06:00 - 07:00",
    truckPlate: "00216-455-GH",
    status: "rejected" as const,
  },
  {
    id: "BK-2026-0888",
    carrier: "Djurdjura Trans",
    terminal: "Terminal A",
    date: "Feb 5, 2026",
    timeSlot: "12:00 - 13:00",
    truckPlate: "00216-312-IJ",
    status: "approved" as const,
  },
  {
    id: "BK-2026-0887",
    carrier: "Oran Maritime",
    terminal: "Terminal B",
    date: "Feb 5, 2026",
    timeSlot: "16:00 - 17:00",
    truckPlate: "00216-678-KL",
    status: "pending" as const,
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return (
        <Badge className="border-0 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/15">
          Approved
        </Badge>
      )
    case "pending":
      return (
        <Badge className="border-0 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))]/15">
          Pending
        </Badge>
      )
    case "rejected":
      return (
        <Badge className="border-0 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/15">
          Rejected
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function RecentBookings() {
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
          <button className="text-xs font-medium text-[hsl(185,60%,42%)] transition-colors hover:text-[hsl(185,60%,35%)]">
            View all
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 text-xs uppercase tracking-wider">
                Booking ID
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider">
                Carrier
              </TableHead>
              <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">
                Terminal
              </TableHead>
              <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">
                Date
              </TableHead>
              <TableHead className="hidden text-xs uppercase tracking-wider xl:table-cell">
                Time Slot
              </TableHead>
              <TableHead className="hidden text-xs uppercase tracking-wider xl:table-cell">
                Truck Plate
              </TableHead>
              <TableHead className="pr-6 text-right text-xs uppercase tracking-wider">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="cursor-pointer">
                <TableCell className="pl-6 font-mono text-xs font-medium text-foreground">
                  {booking.id}
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {booking.carrier}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {booking.terminal}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {booking.date}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                  {booking.timeSlot}
                </TableCell>
                <TableCell className="hidden font-mono text-xs text-muted-foreground xl:table-cell">
                  {booking.truckPlate}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  {getStatusBadge(booking.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
