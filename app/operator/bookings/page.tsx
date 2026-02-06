"use client"

import { useState, useMemo, useEffect } from "react"
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
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
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
import { bookingService, authService } from "@/services"
import type { Booking, BookingStatus, CargoType } from "@/services/types"

// ── Status badge ─────────────────────────────────────────────

function getStatusBadge(status: BookingStatus) {
  const styles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
    PENDING:   { bg: "bg-[hsl(var(--warning))]/10",      text: "text-[hsl(var(--warning))]",      label: "Pending" },
    CONFIRMED: { bg: "bg-[hsl(var(--success))]/10",      text: "text-[hsl(var(--success))]",      label: "Confirmed" },
    REJECTED:  { bg: "bg-[hsl(var(--destructive))]/10",  text: "text-[hsl(var(--destructive))]",  label: "Rejected" },
    CONSUMED:  { bg: "bg-[hsl(210,65%,45%)]/10",         text: "text-[hsl(210,65%,45%)]",         label: "Consumed" },
    CANCELLED: { bg: "bg-muted",                          text: "text-muted-foreground",           label: "Cancelled" },
    EXPIRED:   { bg: "bg-muted",                          text: "text-muted-foreground/70",        label: "Expired" },
  }
  const s = styles[status]
  return <Badge className={`border-0 ${s.bg} ${s.text} hover:${s.bg}`}>{s.label}</Badge>
}

// ── Cargo type badge ─────────────────────────────────────────

function getCargoTypeBadge(type: CargoType) {
  const styles: Record<CargoType, { border: string; text: string; label: string }> = {
    IMPORT:         { border: "border-[hsl(210,65%,45%)]/30", text: "text-[hsl(210,65%,45%)]", label: "Import" },
    EXPORT:         { border: "border-[hsl(185,60%,42%)]/30", text: "text-[hsl(185,60%,42%)]", label: "Export" },
    EMPTY_RETURN:   { border: "border-orange-400/30",         text: "text-orange-500",         label: "Empty Return" },
    TRANSSHIPMENT:  { border: "border-purple-400/30",         text: "text-purple-500",         label: "Transshipment" },
  }
  const s = styles[type]
  return <Badge variant="outline" className={`${s.border} ${s.text}`}>{s.label}</Badge>
}

// ── Helpers ──────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function formatSlot(slot: Booking["timeSlot"]) {
  return `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`
}

// ── Constants ────────────────────────────────────────────────

const ITEMS_PER_PAGE = 8

// ── Page Component ───────────────────────────────────────────

export default function OperatorBookingsPage() {
  const searchParams = useSearchParams()
  const [terminalId, setTerminalId] = useState<string | null>(null)

  // Get operator's assigned terminal
  useEffect(() => {
    authService.getProfile().then((user) => {
      setTerminalId(user.terminal?.id ?? user.operatorTerminals?.[0]?.terminalId ?? null)
    })
  }, [])

  const { data: bookings, loading, error, refetch } = useApi<Booking[]>(
    () => terminalId ? bookingService.getBookings({ terminalId }) : Promise.resolve([]),
    [terminalId],
  )

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Read search query from URL (set by operator header)
  useEffect(() => {
    const q = searchParams.get("search")
    if (q) setSearch(q)
  }, [searchParams])

  const filtered = useMemo(() => {
    if (!bookings) return []
    return bookings.filter((b) => {
      const q = search.toLowerCase()
      const matchesSearch =
        search === "" ||
        b.bookingNumber.toLowerCase().includes(q) ||
        b.carrier.companyName.toLowerCase().includes(q) ||
        b.truck.plateNumber.toLowerCase().includes(q) ||
        (b.containerNumber ?? "").toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookings, search, statusFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setPage(1)
  }

  const hasFilters = search !== "" || statusFilter !== "all"

  // ── Error state ──────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={refetch} className="gap-2">
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
            Terminal bookings ({loading ? "…" : `${filtered.length} total`})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 bg-transparent"
            onClick={refetch}
            disabled={loading}
            aria-label="Refresh bookings"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
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
                placeholder="Search by booking #, carrier, plate, or container..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="h-9 bg-muted/50 pl-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="hidden h-4 w-4 text-muted-foreground md:block" />
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="h-9 w-[150px] text-sm">
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
                <TableHead className="pl-6 text-xs uppercase tracking-wider">Booking #</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Carrier</TableHead>
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
                Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden xl:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="pr-6 text-right"><Skeleton className="ml-auto h-8 w-8 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
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
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {formatDate(booking.timeSlot.date)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {formatSlot(booking.timeSlot)}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground xl:table-cell">
                      {booking.truck.plateNumber}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {getCargoTypeBadge(booking.cargoType)}
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
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
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
                {(() => {
                  const pages: (number | "ellipsis")[] = []
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i)
                  } else {
                    pages.push(1)
                    if (page > 3) pages.push("ellipsis")
                    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
                    if (page < totalPages - 2) pages.push("ellipsis")
                    pages.push(totalPages)
                  }
                  return pages.map((p, idx) =>
                    p === "ellipsis" ? (
                      <span key={`e${idx}`} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">…</span>
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
                  )
                })()}
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
                <span className="font-mono text-sm font-semibold text-foreground">
                  {selectedBooking.bookingNumber}
                </span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Carrier" value={selectedBooking.carrier.companyName} />
                <DetailItem
                  label="Terminal"
                  value={`${selectedBooking.terminal.name} (${selectedBooking.terminal.code})`}
                />
                <DetailItem label="Date" value={formatDate(selectedBooking.timeSlot.date)} />
                <DetailItem label="Time Slot" value={formatSlot(selectedBooking.timeSlot)} />
                <DetailItem label="Truck Plate" value={selectedBooking.truck.plateNumber} />
                <DetailItem label="Driver" value={selectedBooking.truck.driverName ?? "—"} />
                <DetailItem label="Container #" value={selectedBooking.containerNumber ?? "—"} />
                <div>
                  <p className="text-xs text-muted-foreground">Cargo Type</p>
                  <div className="mt-1">{getCargoTypeBadge(selectedBooking.cargoType)}</div>
                </div>
              </div>

              {/* Hazardous flag */}
              {selectedBooking.isHazardous && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  Hazardous cargo
                </div>
              )}

              {/* Special requirements */}
              {selectedBooking.specialRequirements && (
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Special Requirements</p>
                  <p className="mt-1 text-sm text-foreground">{selectedBooking.specialRequirements}</p>
                </div>
              )}

              {/* Rejection reason */}
              {selectedBooking.status === "REJECTED" && selectedBooking.rejectionReason && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-xs font-medium text-destructive">Rejection Reason</p>
                  <p className="mt-1 text-sm text-foreground">{selectedBooking.rejectionReason}</p>
                </div>
              )}

              {/* Cancellation reason */}
              {selectedBooking.status === "CANCELLED" && selectedBooking.cancellationReason && (
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Cancellation Reason</p>
                  <p className="mt-1 text-sm text-foreground">{selectedBooking.cancellationReason}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Created: {formatDate(selectedBooking.createdAt)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Updated: {formatDate(selectedBooking.updatedAt)}
                </div>
              </div>

              {/* Contact info */}
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Carrier Contact</p>
                <p className="mt-1 text-sm text-foreground">{selectedBooking.carrier.user.email}</p>
                {selectedBooking.carrier.user.phone && (
                  <p className="text-sm text-muted-foreground">{selectedBooking.carrier.user.phone}</p>
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
