"use client"

import { useState, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  X,
  AlertCircle,
  RefreshCw,
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
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/hooks/use-api"
import { bookingService } from "@/services"
import type { Booking, BookingStatus, CargoType } from "@/services/types"

// -- Status badge -------------------------------------------------------------

function getStatusBadge(status: BookingStatus) {
  const styles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
    PENDING:   { bg: "bg-[hsl(var(--warning))]/10",       text: "text-[hsl(var(--warning))]",       label: "Pending" },
    CONFIRMED: { bg: "bg-[hsl(var(--success))]/10",       text: "text-[hsl(var(--success))]",       label: "Confirmed" },
    REJECTED:  { bg: "bg-[hsl(var(--destructive))]/10",   text: "text-[hsl(var(--destructive))]",   label: "Rejected" },
    CONSUMED:  { bg: "bg-[hsl(210,65%,45%)]/10",          text: "text-[hsl(210,65%,45%)]",          label: "Consumed" },
    CANCELLED: { bg: "bg-muted",                           text: "text-muted-foreground",            label: "Cancelled" },
    EXPIRED:   { bg: "bg-muted",                           text: "text-muted-foreground/70",         label: "Expired" },
  }
  const s = styles[status]
  return <Badge className={`border-0 ${s.bg} ${s.text} hover:${s.bg}`}>{s.label}</Badge>
}

// -- Cargo-type badge ---------------------------------------------------------

function getOpBadge(type: CargoType) {
  const map: Record<CargoType, { className: string; label: string }> = {
    IMPORT:         { className: "border-[hsl(210,65%,45%)]/30 text-[hsl(210,65%,45%)]", label: "Import" },
    EXPORT:         { className: "border-[hsl(185,60%,42%)]/30 text-[hsl(185,60%,42%)]", label: "Export" },
    EMPTY_RETURN:   { className: "border-orange-500/30 text-orange-500",                  label: "Empty Return" },
    TRANSSHIPMENT:  { className: "border-purple-500/30 text-purple-500",                  label: "Transshipment" },
  }
  const m = map[type]
  return <Badge variant="outline" className={m.className}>{m.label}</Badge>
}

// -- Skeleton rows for loading state ------------------------------------------

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="pl-6"><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="hidden xl:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell className="pr-6 text-right"><Skeleton className="ml-auto h-8 w-8 rounded" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

const ITEMS_PER_PAGE = 8

export default function AdminBookingsPage() {
  const { data: bookings, loading, error, refetch } = useApi<Booking[]>(
    () => bookingService.getBookings(),
    [],
  )

  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") ?? ""

  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [terminalFilter, setTerminalFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Derive unique terminal names from the API data
  const terminalOptions = useMemo(() => {
    if (!bookings) return []
    const unique = Array.from(new Set(bookings.map((b) => b.terminal.name))).sort()
    return unique
  }, [bookings])

  const filtered = useMemo(() => {
    if (!bookings) return []
    return bookings.filter((b) => {
      const searchLower = search.toLowerCase()
      const matchesSearch =
        search === "" ||
        b.bookingNumber.toLowerCase().includes(searchLower) ||
        b.carrier.companyName.toLowerCase().includes(searchLower) ||
        b.truck.plateNumber.toLowerCase().includes(searchLower) ||
        (b.containerNumber ?? "").toLowerCase().includes(searchLower)
      const matchesStatus = statusFilter === "all" || b.status === statusFilter
      const matchesTerminal = terminalFilter === "all" || b.terminal.name === terminalFilter
      return matchesSearch && matchesStatus && matchesTerminal
    })
  }, [bookings, search, statusFilter, terminalFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // -- Export CSV ---------------------------------------------------------------
  const handleExportCSV = useCallback(() => {
    if (!filtered.length) return
    const headers = ["Booking ID", "Carrier", "Terminal", "Date", "Time Slot", "Truck Plate", "Cargo Type", "Status", "Container Number"]
    const rows = filtered.map((b) => [
      b.bookingNumber,
      b.carrier.companyName,
      b.terminal.name,
      new Date(b.timeSlot.date).toLocaleDateString(),
      `${b.timeSlot.startTime} - ${b.timeSlot.endTime}`,
      b.truck.plateNumber,
      b.cargoType,
      b.status,
      b.containerNumber ?? "",
    ])
    const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  // -- Pagination helper (max 7 visible buttons) --------------------------------
  const getPaginationRange = useCallback((): (number | "ellipsis")[] => {
    const MAX_VISIBLE = 7
    if (totalPages <= MAX_VISIBLE) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | "ellipsis")[] = []
    if (page <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push("ellipsis", totalPages)
    } else if (page >= totalPages - 3) {
      pages.push(1, "ellipsis")
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages)
    }
    return pages
  }, [page, totalPages])

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setTerminalFilter("all")
    setPage(1)
  }

  const hasFilters = search !== "" || statusFilter !== "all" || terminalFilter !== "all"

  // -- Error state --------------------------------------------------------------

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="gap-2" onClick={refetch}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            All booking records across terminals ({loading ? "\u2026" : `${filtered.length} total`})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={refetch} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExportCSV} disabled={!filtered.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CONSUMED">Consumed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={terminalFilter} onValueChange={(v) => { setTerminalFilter(v); setPage(1) }}>
                <SelectTrigger className="h-9 w-[150px] text-sm">
                  <SelectValue placeholder="Terminal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terminals</SelectItem>
                  {terminalOptions.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
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
              {loading ? (
                <TableSkeleton />
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                    No bookings found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((booking) => (
                  <TableRow key={booking.id} className="cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                    <TableCell className="pl-6 font-mono text-xs font-medium text-foreground">
                      {booking.bookingNumber}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{booking.carrier.companyName}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {booking.terminal.name}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {new Date(booking.timeSlot.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground xl:table-cell">
                      {booking.truck.plateNumber}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {getOpBadge(booking.cargoType)}
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
          {!loading && totalPages > 1 && (
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
                {getPaginationRange().map((p, idx) =>
                  p === "ellipsis" ? (
                    <span key={`e-${idx}`} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">…</span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "ghost"}
                      size="icon"
                      className="h-8 w-8 text-xs"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  )
                )}
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
                <span className="font-mono text-sm font-semibold text-foreground">{selectedBooking.bookingNumber}</span>
                {getStatusBadge(selectedBooking.status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Carrier" value={selectedBooking.carrier.companyName} />
                <DetailItem label="Terminal" value={`${selectedBooking.terminal.name} (${selectedBooking.terminal.code})`} />
                <DetailItem label="Date" value={new Date(selectedBooking.timeSlot.date).toLocaleDateString()} />
                <DetailItem label="Time Slot" value={`${selectedBooking.timeSlot.startTime} - ${selectedBooking.timeSlot.endTime}`} />
                <DetailItem label="Truck Plate" value={selectedBooking.truck.plateNumber} />
                <DetailItem label="Driver" value={selectedBooking.truck.driverName ?? "\u2014"} />
                <DetailItem label="Container Number" value={selectedBooking.containerNumber ?? "\u2014"} />
                <div>
                  <p className="text-xs text-muted-foreground">Cargo Type</p>
                  <div className="mt-1">{getOpBadge(selectedBooking.cargoType)}</div>
                </div>
                <DetailItem label="Carrier Email" value={selectedBooking.carrier.user.email} />
                <DetailItem label="Carrier Phone" value={selectedBooking.carrier.user.phone ?? "\u2014"} />
              </div>

              {/* Additional fields */}
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Hazardous" value={selectedBooking.isHazardous ? "Yes" : "No"} />
                <DetailItem label="Terminal Type" value={selectedBooking.terminal.type} />
              </div>

              {selectedBooking.specialRequirements && (
                <div>
                  <p className="text-xs text-muted-foreground">Special Requirements</p>
                  <p className="mt-0.5 text-sm text-foreground">{selectedBooking.specialRequirements}</p>
                </div>
              )}

              {selectedBooking.rejectionReason && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-xs font-medium text-destructive">Rejection Reason</p>
                  <p className="mt-0.5 text-sm text-foreground">{selectedBooking.rejectionReason}</p>
                </div>
              )}

              {selectedBooking.cancellationReason && (
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Cancellation Reason</p>
                  <p className="mt-0.5 text-sm text-foreground">{selectedBooking.cancellationReason}</p>
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Created: {new Date(selectedBooking.createdAt).toLocaleDateString()}{" "}
                  {new Date(selectedBooking.createdAt).toLocaleTimeString()}
                </div>
                {selectedBooking.updatedAt !== selectedBooking.createdAt && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Updated: {new Date(selectedBooking.updatedAt).toLocaleDateString()}{" "}
                    {new Date(selectedBooking.updatedAt).toLocaleTimeString()}
                  </div>
                )}
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
