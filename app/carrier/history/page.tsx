"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Clock,
  Search,
  Filter,
  Eye,
  RefreshCw,
  AlertCircle,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import type { PaginatedBookingsResponse } from "@/services/booking.service"
import type { Booking } from "@/services/types"

const HISTORY_STATUSES = ["CONSUMED", "CANCELLED", "REJECTED", "EXPIRED"] as const

const STATUS_STYLES: Record<string, string> = {
  CONSUMED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CANCELLED: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
  EXPIRED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

const STATUS_LABELS: Record<string, string> = {
  CONSUMED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
}

const PER_PAGE = 10

export default function HistoryPage() {
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("") // Debounced search value
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Booking | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Build statuses filter: if "all", use all history statuses; otherwise use the selected one
  const statusesToFetch = statusFilter === "all" 
    ? [...HISTORY_STATUSES] 
    : [statusFilter as typeof HISTORY_STATUSES[number]]

  // Fetch bookings with server-side pagination and status filter
  const { data, loading, error, refetch } = useApi<PaginatedBookingsResponse>(
    () => bookingService.getBookings({ 
      statuses: statusesToFetch,
      search: search || undefined,
      page,
      limit: PER_PAGE,
    }),
    [statusFilter, search, page],
  )
  
  const bookings = data?.bookings ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1
  const totalCount = pagination?.totalCount ?? bookings.length

  const stats = useMemo(() => ({
    total: totalCount,
    completed: bookings.filter((b) => b.status === "CONSUMED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    rejected: bookings.filter((b) => b.status === "REJECTED").length,
  }), [bookings, totalCount])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-10 w-10 text-[hsl(var(--destructive))]" />
        <p className="text-sm text-muted-foreground">Failed to load history</p>
        <Button onClick={refetch} variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Booking History</h1>
          <p className="text-sm text-muted-foreground">View past and completed bookings</p>
        </div>
        <Button onClick={refetch} variant="outline" size="icon" className="h-9 w-9"><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-border bg-card"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total History</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.total}</p>
        </CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="mt-1 text-2xl font-bold text-[hsl(var(--success))]">{stats.completed}</p>
        </CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Cancelled</p>
          <p className="mt-1 text-2xl font-bold text-muted-foreground">{stats.cancelled}</p>
        </CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-[hsl(var(--destructive))]">{stats.rejected}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by booking, container, terminal, plate..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="h-10 pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="h-10 w-[180px]"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {HISTORY_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {bookings.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-medium text-foreground">
              {search || statusFilter !== "all" ? "No matching records" : "No booking history yet"}
            </h3>
            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Your completed, cancelled, and expired bookings will appear here. Create your first booking to get started."}
            </p>
            {!search && statusFilter === "all" && (
              <Button variant="outline" className="mt-4" asChild>
                <a href="/carrier/create-booking">Create Booking</a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground">Booking #</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Terminal</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Container</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Truck</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Status</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id} className="border-border">
                    <TableCell className="font-mono text-xs font-semibold text-foreground">{b.bookingNumber}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{b.terminal?.name ?? "\u2014"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{b.containerNumber || "\u2014"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{b.truck?.plateNumber ?? "\u2014"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.timeSlot?.date ? new Date(b.timeSlot.date).toLocaleDateString() : "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] ${STATUS_STYLES[b.status] ?? ""}`}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(b)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, totalCount)} of {totalCount}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-xs text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{selected?.bookingNumber}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={STATUS_STYLES[selected.status] ?? ""}>
                  {STATUS_LABELS[selected.status] ?? selected.status}
                </Badge>
                <Badge variant="outline" className="text-[10px]">{selected.cargoType?.replace("_", " ")}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Terminal</p>
                  <p className="font-medium text-foreground">{selected.terminal?.name} ({selected.terminal?.code})</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{selected.timeSlot?.date ? new Date(selected.timeSlot.date).toLocaleDateString() : "\u2014"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time Slot</p>
                  <p className="font-medium text-foreground">{selected.timeSlot?.startTime} - {selected.timeSlot?.endTime}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Truck</p>
                  <p className="font-medium text-foreground">{selected.truck?.plateNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Container</p>
                  <p className="font-mono font-medium text-foreground">{selected.containerNumber || "\u2014"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-medium text-foreground">
                    {selected.updatedAt ? new Date(selected.updatedAt).toLocaleString() : "\u2014"}
                  </p>
                </div>
              </div>
              {selected.rejectionReason && (
                <div className="rounded-lg border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5 p-3">
                  <p className="text-xs font-medium text-[hsl(var(--destructive))]">Rejection Reason</p>
                  <p className="mt-1 text-xs text-muted-foreground">{selected.rejectionReason}</p>
                </div>
              )}
              {selected.specialRequirements && (
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs font-medium text-foreground">Special Requirements</p>
                  <p className="mt-1 text-xs text-muted-foreground">{selected.specialRequirements}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
