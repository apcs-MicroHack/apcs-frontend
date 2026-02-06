"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
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

type BookingStatus = "completed" | "cancelled" | "rejected"

interface HistoryBooking {
  id: string
  terminal: string
  date: string
  timeSlot: string
  truckPlate: string
  driverName: string
  containerRef: string
  operationType: "import" | "export"
  status: BookingStatus
  completedAt: string
}

const historyBookings: HistoryBooking[] = [
  { id: "BK-2026-0875", terminal: "Terminal A", date: "Feb 1, 2026", timeSlot: "08:00 - 09:00", truckPlate: "00216-142-AB", driverName: "Karim Bouzid", containerRef: "MSKU-1123456", operationType: "import", status: "completed", completedAt: "Feb 1, 2026 08:52" },
  { id: "BK-2026-0870", terminal: "Terminal D", date: "Jan 31, 2026", timeSlot: "14:00 - 15:00", truckPlate: "00216-142-MN", driverName: "Adel Khelifi", containerRef: "TCLU-2234567", operationType: "export", status: "completed", completedAt: "Jan 31, 2026 14:38" },
  { id: "BK-2026-0865", terminal: "Terminal B", date: "Jan 30, 2026", timeSlot: "10:00 - 11:00", truckPlate: "00216-142-WX", driverName: "Noureddine Ait", containerRef: "CSQU-3345678", operationType: "import", status: "cancelled", completedAt: "Jan 30, 2026 09:15" },
  { id: "BK-2026-0860", terminal: "Terminal C", date: "Jan 29, 2026", timeSlot: "06:00 - 07:00", truckPlate: "00216-142-FF", driverName: "Rachid Hamdi", containerRef: "HLXU-4456789", operationType: "export", status: "rejected", completedAt: "Jan 29, 2026 05:30" },
  { id: "BK-2026-0855", terminal: "Terminal A", date: "Jan 28, 2026", timeSlot: "16:00 - 17:00", truckPlate: "00216-142-AB", driverName: "Karim Bouzid", containerRef: "MAEU-5567890", operationType: "import", status: "completed", completedAt: "Jan 28, 2026 16:45" },
  { id: "BK-2026-0850", terminal: "Terminal B", date: "Jan 27, 2026", timeSlot: "12:00 - 13:00", truckPlate: "00216-142-GG", driverName: "Said Bennour", containerRef: "CMAU-6678901", operationType: "export", status: "completed", completedAt: "Jan 27, 2026 12:22" },
  { id: "BK-2026-0845", terminal: "Terminal D", date: "Jan 26, 2026", timeSlot: "09:00 - 10:00", truckPlate: "00216-142-HH", driverName: "Omar Belkacem", containerRef: "TCNU-7789012", operationType: "import", status: "completed", completedAt: "Jan 26, 2026 09:50" },
  { id: "BK-2026-0840", terminal: "Terminal C", date: "Jan 25, 2026", timeSlot: "15:00 - 16:00", truckPlate: "00216-142-JJ", driverName: "Farid Zaidi", containerRef: "MSKU-8890123", operationType: "export", status: "completed", completedAt: "Jan 25, 2026 15:33" },
  { id: "BK-2026-0835", terminal: "Terminal A", date: "Jan 24, 2026", timeSlot: "07:00 - 08:00", truckPlate: "00216-142-MN", driverName: "Adel Khelifi", containerRef: "HLXU-9901234", operationType: "import", status: "completed", completedAt: "Jan 24, 2026 07:41" },
  { id: "BK-2026-0830", terminal: "Terminal B", date: "Jan 23, 2026", timeSlot: "11:00 - 12:00", truckPlate: "00216-142-AB", driverName: "Karim Bouzid", containerRef: "CSQU-0012345", operationType: "export", status: "cancelled", completedAt: "Jan 23, 2026 10:00" },
]

function getStatusBadge(status: BookingStatus) {
  const styles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
    completed: { bg: "bg-[hsl(var(--success))]/10", text: "text-[hsl(var(--success))]", label: "Completed" },
    cancelled: { bg: "bg-muted", text: "text-muted-foreground", label: "Cancelled" },
    rejected: { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]", label: "Rejected" },
  }
  const s = styles[status]
  return <Badge className={`border-0 ${s.bg} ${s.text} hover:${s.bg}`}>{s.label}</Badge>
}

const ITEMS_PER_PAGE = 8

export default function BookingHistoryPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<HistoryBooking | null>(null)

  const filtered = useMemo(() => {
    return historyBookings.filter((b) => {
      const matchesSearch =
        search === "" ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.containerRef.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Booking History</h1>
          <p className="text-sm text-muted-foreground">
            Past completed, cancelled, and rejected bookings
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
                placeholder="Search by ID or container ref..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="h-9 bg-muted/50 pl-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="h-9 w-[150px] text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wider">ID</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Terminal</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">Date</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">Time Slot</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider xl:table-cell">Container</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="pr-6 text-right text-xs uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No history records found.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((booking) => (
                  <TableRow key={booking.id} className="cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                    <TableCell className="pl-6 font-mono text-xs font-medium text-foreground">{booking.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{booking.terminal}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{booking.date}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{booking.timeSlot}</TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground xl:table-cell">{booking.containerRef}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking) }} aria-label="View details">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={p === page ? "default" : "ghost"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p)}>
                    {p}
                  </Button>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-foreground">{selectedBooking.id}</span>
                {getStatusBadge(selectedBooking.status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Terminal" value={selectedBooking.terminal} />
                <DetailItem label="Date" value={selectedBooking.date} />
                <DetailItem label="Time Slot" value={selectedBooking.timeSlot} />
                <DetailItem label="Truck Plate" value={selectedBooking.truckPlate} />
                <DetailItem label="Driver" value={selectedBooking.driverName} />
                <DetailItem label="Container" value={selectedBooking.containerRef} />
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {selectedBooking.status === "completed" ? "Completed" : "Closed"}: {selectedBooking.completedAt}
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
