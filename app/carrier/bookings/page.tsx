"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  X,
  PlusCircle,
  QrCode,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import type { PaginatedBookingsResponse } from "@/services/booking.service"

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-[hsl(var(--warning))]/10", text: "text-[hsl(var(--warning))]", label: "Pending" },
  CONFIRMED: { bg: "bg-[hsl(var(--success))]/10", text: "text-[hsl(var(--success))]", label: "Confirmed" },
  REJECTED: { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]", label: "Rejected" },
  CONSUMED: { bg: "bg-[hsl(210,65%,45%)]/10", text: "text-[hsl(210,65%,45%)]", label: "Consumed" },
  CANCELLED: { bg: "bg-muted", text: "text-muted-foreground", label: "Cancelled" },
  EXPIRED: { bg: "bg-muted", text: "text-muted-foreground", label: "Expired" },
}

function statusBadge(status: BookingStatus) {
  const s = STATUS_STYLES[status]
  return <Badge className={`border-0 ${s.bg} ${s.text}`}>{s.label}</Badge>
}

function cargoBadge(type: CargoType) {
  const isImport = type === "IMPORT" || type === "TRANSSHIPMENT"
  return (
    <Badge variant="outline" className={isImport ? "border-[hsl(210,65%,45%)]/30 text-[hsl(210,65%,45%)]" : "border-[hsl(185,60%,42%)]/30 text-[hsl(185,60%,42%)]"}>
      {type.replace("_", " ")}
    </Badge>
  )
}

const ITEMS_PER_PAGE = 10

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CarrierBookingsPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data, loading, error, refetch } = useApi<PaginatedBookingsResponse>(
    () => bookingService.getBookings({
      page,
      limit: ITEMS_PER_PAGE,
      ...(statusFilter !== "all" && { status: statusFilter as BookingStatus }),
      ...(debouncedSearch && { search: debouncedSearch }),
    }),
    [page, statusFilter, debouncedSearch],
  )

  const bookings = data?.bookings ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1
  const totalCount = pagination?.totalCount ?? 0
  const hasFilters = search !== "" || statusFilter !== "all"

  const clearFilters = () => { setSearch(""); setDebouncedSearch(""); setStatusFilter("all"); setPage(1) }

  // Pagination range helper
  const getPaginationRange = useCallback((): (number | "ellipsis")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="gap-2" onClick={refetch}><RefreshCw className="h-4 w-4" /> Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">My Bookings</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "\u2026" : `Active and recent booking requests (${totalCount} total)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/carrier/create-booking">
            <Button className="gap-2"><PlusCircle className="h-4 w-4" /> New Booking</Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by ID, plate, or container..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 bg-muted/50 pl-9 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="hidden h-4 w-4 text-muted-foreground md:block" />
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="h-9 w-[140px] text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
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
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1 text-xs"><X className="h-3 w-3" /> Clear</Button>
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
                <TableHead className="text-xs uppercase tracking-wider">Terminal</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">Date</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">Time Slot</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider xl:table-cell">Truck</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider xl:table-cell">Type</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="pr-6 text-right text-xs uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j} className={j === 0 ? "pl-6" : j === 7 ? "pr-6" : ""}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    No bookings found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id} className="cursor-pointer" onClick={() => setSelectedBooking(b)}>
                    <TableCell className="pl-6 font-mono text-xs font-medium text-foreground">{b.bookingNumber}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.terminal.name}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{new Date(b.timeSlot.date).toLocaleDateString()}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{b.timeSlot.startTime} - {b.timeSlot.endTime}</TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground xl:table-cell">{b.truck.plateNumber}</TableCell>
                    <TableCell className="hidden xl:table-cell">{cargoBadge(b.cargoType)}</TableCell>
                    <TableCell>{statusBadge(b.status)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setSelectedBooking(b) }}>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPage(page - 1)} disabled={!pagination?.hasPrevPage}><ChevronLeft className="h-4 w-4" /></Button>
                {getPaginationRange().map((p, idx) =>
                  p === "ellipsis" ? (
                    <span key={`e-${idx}`} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">…</span>
                  ) : (
                    <Button key={p} variant={p === page ? "default" : "ghost"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p)}>{p}</Button>
                  )
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPage(page + 1)} disabled={!pagination?.hasNextPage}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-heading text-lg">Booking Details</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-foreground">{selectedBooking.bookingNumber}</span>
                {statusBadge(selectedBooking.status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Terminal" value={`${selectedBooking.terminal.name} (${selectedBooking.terminal.code})`} />
                <DetailItem label="Date" value={new Date(selectedBooking.timeSlot.date).toLocaleDateString()} />
                <DetailItem label="Time Slot" value={`${selectedBooking.timeSlot.startTime} - ${selectedBooking.timeSlot.endTime}`} />
                <DetailItem label="Truck Plate" value={selectedBooking.truck.plateNumber} />
                <DetailItem label="Driver" value={selectedBooking.truck.driverName ?? "\u2014"} />
                <DetailItem label="Container" value={selectedBooking.containerNumber ?? "\u2014"} />
                <div>
                  <p className="text-xs text-muted-foreground">Cargo Type</p>
                  <div className="mt-1">{cargoBadge(selectedBooking.cargoType)}</div>
                </div>
                <DetailItem label="Hazardous" value={selectedBooking.isHazardous ? "Yes" : "No"} />
              </div>

              {selectedBooking.specialRequirements && (
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs font-medium text-foreground">Special Requirements</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{selectedBooking.specialRequirements}</p>
                </div>
              )}

              {selectedBooking.rejectionReason && (
                <div className="rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 p-3">
                  <p className="text-xs font-medium text-[hsl(var(--destructive))]">Rejection Reason</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{selectedBooking.rejectionReason}</p>
                </div>
              )}

              {/* QR Code for confirmed bookings */}
              {selectedBooking.status === "CONFIRMED" && selectedBooking.qrCode && (
                <div className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-4">
                  <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-border bg-white p-2">
                    <img 
                      src={selectedBooking.qrCode} 
                      alt="Booking QR Code" 
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-foreground">Entry QR Code</p>
                  <p className="text-[10px] text-muted-foreground">Present this at the terminal gate</p>
                </div>
              )}
              {/* QR Code placeholder if not yet generated */}
              {selectedBooking.status === "CONFIRMED" && !selectedBooking.qrCode && (
                <div className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-border bg-background">
                    <QrCode className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-xs font-medium text-foreground">QR Code Generating...</p>
                  <p className="text-[10px] text-muted-foreground">Please refresh in a moment</p>
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Created: {new Date(selectedBooking.createdAt).toLocaleString()}
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
