"use client"

import { useState, useMemo, useEffect } from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  X,
  Calendar,
  Container,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/hooks/use-api"
import { bookingService, authService } from "@/services"
import type { PaginatedBookingsResponse } from "@/services/booking.service"
import type { Booking, CargoType } from "@/services/types"

const EMPTY_RESPONSE: PaginatedBookingsResponse = { bookings: [], pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 } }

// ── Helpers ──────────────────────────────────────────────────

function waitingTime(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ${mins % 60}m`
  return `${Math.floor(hours / 24)}d`
}

function cargoLabel(t: CargoType) {
  const map: Record<CargoType, string> = { IMPORT: "Import", EXPORT: "Export", EMPTY_RETURN: "Empty", TRANSSHIPMENT: "Trans" }
  return map[t]
}

function cargoColor(t: CargoType) {
  return t === "IMPORT" || t === "TRANSSHIPMENT"
    ? "border-[hsl(210,65%,45%)]/30 text-[hsl(210,65%,45%)]"
    : "border-[hsl(185,60%,42%)]/30 text-[hsl(185,60%,42%)]"
}

// ── Page ─────────────────────────────────────────────────────

export default function OperatorQueuePage() {
  const [terminalId, setTerminalId] = useState<string | null>(null)

  // Get operator's assigned terminal
  useEffect(() => {
    authService.getProfile().then((user) => {
      setTerminalId(user.terminal?.id ?? user.operatorTerminals?.[0]?.terminalId ?? null)
    })
  }, [])

  const { data, loading, error, refetch } = useApi<PaginatedBookingsResponse>(
    () => terminalId ? bookingService.getBookings({ terminalId, status: "PENDING" }) : Promise.resolve(EMPTY_RESPONSE),
    [terminalId],
  )
  const bookings = data?.bookings ?? []

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const queue = bookings

  const filtered = useMemo(() => {
    return queue.filter((b) => {
      const s = search.toLowerCase()
      const matchesSearch =
        search === "" ||
        b.bookingNumber.toLowerCase().includes(s) ||
        b.carrier.companyName.toLowerCase().includes(s) ||
        b.truck.plateNumber.toLowerCase().includes(s) ||
        (b.containerNumber ?? "").toLowerCase().includes(s)
      const matchesType = typeFilter === "all" || b.cargoType === typeFilter
      return matchesSearch && matchesType
    })
  }, [queue, search, typeFilter])

  // Count those waiting > 30 min
  const urgentCount = queue.filter((b) => Date.now() - new Date(b.createdAt).getTime() > 30 * 60_000).length
  const hasFilters = search !== "" || typeFilter !== "all"

  const handleApprove = async (id: string) => {
    setProcessing(true)
    try {
      await bookingService.confirmBooking(id)
      toast.success("Booking approved successfully")
      setSelectedBooking(null)
      refetch()
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error ?? "Failed to approve booking"
      toast.error(msg)
    } finally {
      setProcessing(false)
    }
  }

  const openRejectDialog = (booking: Booking) => {
    setRejectTarget(booking)
    setRejectReason("")
    setRejectDialogOpen(true)
  }

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason) return
    setProcessing(true)
    try {
      await bookingService.rejectBooking(rejectTarget.id, rejectReason)
      toast.success("Booking rejected")
      setRejectDialogOpen(false)
      setRejectTarget(null)
      setSelectedBooking(null)
      refetch()
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error ?? "Failed to reject booking"
      toast.error(msg)
    } finally {
      setProcessing(false)
    }
  }

  const clearFilters = () => { setSearch(""); setTypeFilter("all") }

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
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-foreground">Booking Queue</h1>
            {urgentCount > 0 && (
              <Badge className="border-0 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">{urgentCount} urgent</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {loading ? "\u2026" : `${queue.length} pending booking${queue.length !== 1 ? "s" : ""} awaiting validation`}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={refetch} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard loading={loading} value={queue.length} label="In Queue" icon={Clock} color="text-[hsl(var(--warning))]" bg="bg-[hsl(var(--warning))]/10" />
        <StatCard loading={loading} value={urgentCount} label="Waiting > 30 min" icon={AlertTriangle} color="text-[hsl(var(--destructive))]" bg="bg-[hsl(var(--destructive))]/10" />
        <StatCard loading={loading} value={queue.length - urgentCount} label="Normal" icon={CheckCircle2} color="text-[hsl(var(--success))]" bg="bg-[hsl(var(--success))]/10" />
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by ID, carrier, plate, or container..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 bg-muted/50 pl-9 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="hidden h-4 w-4 text-muted-foreground md:block" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-[140px] text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="IMPORT">Import</SelectItem>
                  <SelectItem value="EXPORT">Export</SelectItem>
                  <SelectItem value="EMPTY_RETURN">Empty Return</SelectItem>
                  <SelectItem value="TRANSSHIPMENT">Transshipment</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1 text-xs"><X className="h-3 w-3" /> Clear</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CheckCircle2 className="h-10 w-10 text-[hsl(var(--success))]/40" />
              <p className="mt-3 text-sm font-medium text-foreground">Queue is clear</p>
              <p className="mt-1 text-xs text-muted-foreground">All pending bookings have been processed.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((booking) => {
            const isUrgent = Date.now() - new Date(booking.createdAt).getTime() > 30 * 60_000
            return (
              <Card
                key={booking.id}
                className={`border-border transition-colors hover:bg-muted/30 ${
                  isUrgent ? "border-l-2 border-l-[hsl(var(--warning))] bg-[hsl(var(--warning))]/[0.02]" : "bg-card"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-foreground">{booking.bookingNumber}</span>
                        {isUrgent && (
                          <Badge className="border-0 bg-[hsl(var(--warning))]/10 px-1.5 py-0 text-[10px] text-[hsl(var(--warning))]">Urgent</Badge>
                        )}
                        <Badge variant="outline" className={`px-1.5 py-0 text-[10px] ${cargoColor(booking.cargoType)}`}>
                          {cargoLabel(booking.cargoType)}
                        </Badge>
                      </div>

                      <div className="mt-1.5 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Carrier</p>
                          <p className="text-xs font-medium text-foreground">{booking.carrier.companyName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Truck</p>
                          <p className="font-mono text-xs text-foreground">{booking.truck.plateNumber}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Time Slot</p>
                          <p className="text-xs text-foreground">
                            {new Date(booking.timeSlot.date).toLocaleDateString()} {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Container</p>
                          <p className="font-mono text-xs text-foreground">{booking.containerNumber ?? "\u2014"}</p>
                        </div>
                      </div>

                      {booking.specialRequirements && (
                        <div className="mt-2 rounded border border-border bg-muted/30 px-2.5 py-1.5">
                          <p className="text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground">Note:</span> {booking.specialRequirements}
                          </p>
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" /> Waiting: {waitingTime(booking.createdAt)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Submitted: {new Date(booking.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedBooking(booking)}>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 gap-1.5 bg-[hsl(var(--success))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--success))]/90"
                        onClick={() => handleApprove(booking.id)}
                        disabled={processing}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Approve</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 border-[hsl(var(--destructive))]/30 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                        onClick={() => openRejectDialog(booking)}
                        disabled={processing}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-heading text-lg">Booking Details</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-foreground">{selectedBooking.bookingNumber}</span>
                <Badge className="border-0 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">Pending</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Carrier" value={selectedBooking.carrier.companyName} />
                <DetailItem label="Driver" value={selectedBooking.truck.driverName ?? "\u2014"} />
                <DetailItem label="Date" value={new Date(selectedBooking.timeSlot.date).toLocaleDateString()} />
                <DetailItem label="Time Slot" value={`${selectedBooking.timeSlot.startTime} - ${selectedBooking.timeSlot.endTime}`} />
                <DetailItem label="Truck Plate" value={selectedBooking.truck.plateNumber} />
                <DetailItem label="Container" value={selectedBooking.containerNumber ?? "\u2014"} />
                <DetailItem label="Terminal" value={`${selectedBooking.terminal.name} (${selectedBooking.terminal.code})`} />
                <div>
                  <p className="text-xs text-muted-foreground">Cargo Type</p>
                  <div className="mt-1">
                    <Badge variant="outline" className={cargoColor(selectedBooking.cargoType)}>{cargoLabel(selectedBooking.cargoType)}</Badge>
                  </div>
                </div>
                <DetailItem label="Hazardous" value={selectedBooking.isHazardous ? "Yes" : "No"} />
                <DetailItem label="Waiting" value={waitingTime(selectedBooking.createdAt)} />
              </div>

              {selectedBooking.specialRequirements && (
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs font-medium text-foreground">Special Requirements</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{selectedBooking.specialRequirements}</p>
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Submitted: {new Date(selectedBooking.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  className="gap-1.5 border-[hsl(var(--destructive))]/30 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                  onClick={() => { setSelectedBooking(null); openRejectDialog(selectedBooking) }}
                  disabled={processing}
                >
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
                <Button
                  className="gap-1.5 bg-[hsl(var(--success))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--success))]/90"
                  onClick={() => handleApprove(selectedBooking.id)}
                  disabled={processing}
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Reject Booking</DialogTitle>
            <DialogDescription>Provide a reason for rejecting {rejectTarget?.bookingNumber}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="resize-none text-sm"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim() || processing}
              className="bg-[hsl(var(--destructive))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--destructive))]/90"
            >
              {processing ? "Rejecting\u2026" : "Reject Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ loading, value, label, icon: Icon, color, bg }: { loading: boolean; value: number; label: string; icon: React.ElementType; color: string; bg: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          {loading ? <Skeleton className="h-7 w-10" /> : <p className="font-heading text-xl font-bold text-foreground">{value}</p>}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
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
