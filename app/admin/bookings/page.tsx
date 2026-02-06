"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type BookingStatus = "approved" | "pending" | "rejected" | "completed" | "cancelled"

interface Booking {
  id: string
  carrier: string
  terminal: string
  date: string
  timeSlot: string
  truckPlate: string
  driverName: string
  containerRef: string
  operationType: "import" | "export"
  status: BookingStatus
  createdAt: string
}

const allBookings: Booking[] = [
  {
    id: "BK-2026-0892",
    carrier: "MedTransport SA",
    terminal: "Terminal A",
    date: "Feb 6, 2026",
    timeSlot: "08:00 - 09:00",
    truckPlate: "00216-142-AB",
    driverName: "Karim Bouzid",
    containerRef: "MSKU-4829173",
    operationType: "import",
    status: "approved",
    createdAt: "Feb 5, 2026 14:30",
  },
  {
    id: "BK-2026-0891",
    carrier: "Algiers Freight Co",
    terminal: "Terminal D",
    date: "Feb 6, 2026",
    timeSlot: "10:00 - 11:00",
    truckPlate: "00216-231-CD",
    driverName: "Yacine Mehdaoui",
    containerRef: "TCLU-5583920",
    operationType: "export",
    status: "pending",
    createdAt: "Feb 5, 2026 16:12",
  },
  {
    id: "BK-2026-0890",
    carrier: "Sahel Logistics",
    terminal: "Terminal B",
    date: "Feb 6, 2026",
    timeSlot: "14:00 - 15:00",
    truckPlate: "00216-087-EF",
    driverName: "Noureddine Ait",
    containerRef: "CSQU-7721034",
    operationType: "import",
    status: "approved",
    createdAt: "Feb 5, 2026 09:45",
  },
  {
    id: "BK-2026-0889",
    carrier: "Atlas Shipping",
    terminal: "Terminal C",
    date: "Feb 5, 2026",
    timeSlot: "06:00 - 07:00",
    truckPlate: "00216-455-GH",
    driverName: "Rachid Hamdi",
    containerRef: "HLXU-3349821",
    operationType: "export",
    status: "rejected",
    createdAt: "Feb 4, 2026 11:20",
  },
  {
    id: "BK-2026-0888",
    carrier: "Djurdjura Trans",
    terminal: "Terminal A",
    date: "Feb 5, 2026",
    timeSlot: "12:00 - 13:00",
    truckPlate: "00216-312-IJ",
    driverName: "Said Bennour",
    containerRef: "MAEU-9917543",
    operationType: "import",
    status: "completed",
    createdAt: "Feb 3, 2026 08:00",
  },
  {
    id: "BK-2026-0887",
    carrier: "Oran Maritime",
    terminal: "Terminal B",
    date: "Feb 5, 2026",
    timeSlot: "16:00 - 17:00",
    truckPlate: "00216-678-KL",
    driverName: "Omar Belkacem",
    containerRef: "CMAU-6632187",
    operationType: "export",
    status: "pending",
    createdAt: "Feb 4, 2026 17:55",
  },
  {
    id: "BK-2026-0886",
    carrier: "MedTransport SA",
    terminal: "Terminal C",
    date: "Feb 4, 2026",
    timeSlot: "09:00 - 10:00",
    truckPlate: "00216-142-MN",
    driverName: "Adel Khelifi",
    containerRef: "TCNU-1128374",
    operationType: "import",
    status: "completed",
    createdAt: "Feb 3, 2026 10:30",
  },
  {
    id: "BK-2026-0885",
    carrier: "Sahel Logistics",
    terminal: "Terminal D",
    date: "Feb 4, 2026",
    timeSlot: "11:00 - 12:00",
    truckPlate: "00216-087-OP",
    driverName: "Farid Zaidi",
    containerRef: "MSKU-8845210",
    operationType: "export",
    status: "cancelled",
    createdAt: "Feb 2, 2026 13:15",
  },
  {
    id: "BK-2026-0884",
    carrier: "Atlas Shipping",
    terminal: "Terminal A",
    date: "Feb 4, 2026",
    timeSlot: "15:00 - 16:00",
    truckPlate: "00216-455-QR",
    driverName: "Mourad Lahlah",
    containerRef: "HLXU-2239847",
    operationType: "import",
    status: "approved",
    createdAt: "Feb 3, 2026 07:40",
  },
  {
    id: "BK-2026-0883",
    carrier: "Algiers Freight Co",
    terminal: "Terminal B",
    date: "Feb 3, 2026",
    timeSlot: "07:00 - 08:00",
    truckPlate: "00216-231-ST",
    driverName: "Hocine Djerbi",
    containerRef: "CSQU-5567821",
    operationType: "export",
    status: "completed",
    createdAt: "Feb 1, 2026 15:22",
  },
]

function getStatusBadge(status: BookingStatus) {
  const styles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
    approved: { bg: "bg-[hsl(var(--success))]/10", text: "text-[hsl(var(--success))]", label: "Approved" },
    pending: { bg: "bg-[hsl(var(--warning))]/10", text: "text-[hsl(var(--warning))]", label: "Pending" },
    rejected: { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]", label: "Rejected" },
    completed: { bg: "bg-[hsl(210,65%,45%)]/10", text: "text-[hsl(210,65%,45%)]", label: "Completed" },
    cancelled: { bg: "bg-muted", text: "text-muted-foreground", label: "Cancelled" },
  }
  const s = styles[status]
  return <Badge className={`border-0 ${s.bg} ${s.text} hover:${s.bg}`}>{s.label}</Badge>
}

function getOpBadge(type: "import" | "export") {
  return type === "import" ? (
    <Badge variant="outline" className="border-[hsl(210,65%,45%)]/30 text-[hsl(210,65%,45%)]">
      Import
    </Badge>
  ) : (
    <Badge variant="outline" className="border-[hsl(185,60%,42%)]/30 text-[hsl(185,60%,42%)]">
      Export
    </Badge>
  )
}

const ITEMS_PER_PAGE = 8

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [terminalFilter, setTerminalFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const filtered = useMemo(() => {
    return allBookings.filter((b) => {
      const matchesSearch =
        search === "" ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.carrier.toLowerCase().includes(search.toLowerCase()) ||
        b.truckPlate.toLowerCase().includes(search.toLowerCase()) ||
        b.containerRef.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || b.status === statusFilter
      const matchesTerminal = terminalFilter === "all" || b.terminal === terminalFilter
      return matchesSearch && matchesStatus && matchesTerminal
    })
  }, [search, statusFilter, terminalFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setTerminalFilter("all")
    setPage(1)
  }

  const hasFilters = search !== "" || statusFilter !== "all" || terminalFilter !== "all"

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            All booking records across terminals ({filtered.length} total)
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, carrier, plate, or container..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="h-9 bg-muted/50 pl-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="hidden h-4 w-4 text-muted-foreground md:block" />
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="h-9 w-[140px] text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={terminalFilter} onValueChange={(v) => { setTerminalFilter(v); setPage(1) }}>
                <SelectTrigger className="h-9 w-[150px] text-sm">
                  <SelectValue placeholder="Terminal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terminals</SelectItem>
                  <SelectItem value="Terminal A">Terminal A</SelectItem>
                  <SelectItem value="Terminal B">Terminal B</SelectItem>
                  <SelectItem value="Terminal C">Terminal C</SelectItem>
                  <SelectItem value="Terminal D">Terminal D</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1 text-xs">
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wider">Booking ID</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Carrier</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">Terminal</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">Date</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">Time Slot</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider xl:table-cell">Truck Plate</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider xl:table-cell">Type</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="pr-6 text-right text-xs uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                    No bookings found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((booking) => (
                  <TableRow key={booking.id} className="cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                    <TableCell className="pl-6 font-mono text-xs font-medium text-foreground">
                      {booking.id}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{booking.carrier}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {booking.terminal}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {booking.date}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {booking.timeSlot}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground xl:table-cell">
                      {booking.truckPlate}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {getOpBadge(booking.operationType)}
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking) }}
                        aria-label="View booking details"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 text-xs"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              Booking Details
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-foreground">{selectedBooking.id}</span>
                {getStatusBadge(selectedBooking.status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Carrier" value={selectedBooking.carrier} />
                <DetailItem label="Terminal" value={selectedBooking.terminal} />
                <DetailItem label="Date" value={selectedBooking.date} />
                <DetailItem label="Time Slot" value={selectedBooking.timeSlot} />
                <DetailItem label="Truck Plate" value={selectedBooking.truckPlate} />
                <DetailItem label="Driver" value={selectedBooking.driverName} />
                <DetailItem label="Container Ref" value={selectedBooking.containerRef} />
                <div>
                  <p className="text-xs text-muted-foreground">Operation</p>
                  <div className="mt-1">{getOpBadge(selectedBooking.operationType)}</div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Created: {selectedBooking.createdAt}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
