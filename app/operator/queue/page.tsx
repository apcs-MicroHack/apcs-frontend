"use client"

import { useState, useMemo } from "react"
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

type BookingPriority = "urgent" | "normal"

interface QueueBooking {
  id: string
  carrier: string
  truckPlate: string
  driverName: string
  timeSlot: string
  date: string
  operationType: "import" | "export"
  containerRef: string
  containerSize: "20ft" | "40ft"
  weight: string
  waitingTime: string
  submittedAt: string
  priority: BookingPriority
  notes: string
}

const initialQueue: QueueBooking[] = [
  {
    id: "BK-2026-0901",
    carrier: "MedTransport SA",
    truckPlate: "00216-142-AB",
    driverName: "Karim Bouzid",
    timeSlot: "08:00 - 09:00",
    date: "Feb 6, 2026",
    operationType: "import",
    containerRef: "MSKU-4829173",
    containerSize: "40ft",
    weight: "28.5 tons",
    waitingTime: "52 min",
    submittedAt: "Feb 6, 2026 07:08",
    priority: "urgent",
    notes: "Priority cargo - perishable goods",
  },
  {
    id: "BK-2026-0902",
    carrier: "Algiers Freight Co",
    truckPlate: "00216-231-CD",
    driverName: "Yacine Mehdaoui",
    timeSlot: "09:00 - 10:00",
    date: "Feb 6, 2026",
    operationType: "export",
    containerRef: "TCLU-5583920",
    containerSize: "20ft",
    weight: "14.2 tons",
    waitingTime: "38 min",
    submittedAt: "Feb 6, 2026 07:22",
    priority: "urgent",
    notes: "",
  },
  {
    id: "BK-2026-0903",
    carrier: "Sahel Logistics",
    truckPlate: "00216-087-EF",
    driverName: "Noureddine Ait",
    timeSlot: "09:00 - 10:00",
    date: "Feb 6, 2026",
    operationType: "import",
    containerRef: "CSQU-7721034",
    containerSize: "40ft",
    weight: "31.0 tons",
    waitingTime: "24 min",
    submittedAt: "Feb 6, 2026 07:36",
    priority: "normal",
    notes: "Fragile equipment inside",
  },
  {
    id: "BK-2026-0904",
    carrier: "Djurdjura Trans",
    truckPlate: "00216-312-IJ",
    driverName: "Said Bennour",
    timeSlot: "10:00 - 11:00",
    date: "Feb 6, 2026",
    operationType: "export",
    containerRef: "MAEU-9917543",
    containerSize: "20ft",
    weight: "12.8 tons",
    waitingTime: "18 min",
    submittedAt: "Feb 6, 2026 07:42",
    priority: "normal",
    notes: "",
  },
  {
    id: "BK-2026-0905",
    carrier: "Oran Maritime",
    truckPlate: "00216-678-KL",
    driverName: "Omar Belkacem",
    timeSlot: "10:00 - 11:00",
    date: "Feb 6, 2026",
    operationType: "import",
    containerRef: "CMAU-6632187",
    containerSize: "40ft",
    weight: "26.3 tons",
    waitingTime: "12 min",
    submittedAt: "Feb 6, 2026 07:48",
    priority: "normal",
    notes: "",
  },
  {
    id: "BK-2026-0906",
    carrier: "MedTransport SA",
    truckPlate: "00216-142-MN",
    driverName: "Adel Khelifi",
    timeSlot: "11:00 - 12:00",
    date: "Feb 6, 2026",
    operationType: "export",
    containerRef: "TCNU-1128374",
    containerSize: "40ft",
    weight: "29.1 tons",
    waitingTime: "8 min",
    submittedAt: "Feb 6, 2026 07:52",
    priority: "normal",
    notes: "Oversize container - special handling",
  },
  {
    id: "BK-2026-0907",
    carrier: "Sahel Logistics",
    truckPlate: "00216-087-OP",
    driverName: "Farid Zaidi",
    timeSlot: "11:00 - 12:00",
    date: "Feb 6, 2026",
    operationType: "import",
    containerRef: "MSKU-8845210",
    containerSize: "20ft",
    weight: "15.5 tons",
    waitingTime: "5 min",
    submittedAt: "Feb 6, 2026 07:55",
    priority: "normal",
    notes: "",
  },
  {
    id: "BK-2026-0908",
    carrier: "Atlas Shipping",
    truckPlate: "00216-455-QR",
    driverName: "Mourad Lahlah",
    timeSlot: "12:00 - 13:00",
    date: "Feb 6, 2026",
    operationType: "export",
    containerRef: "HLXU-2239847",
    containerSize: "40ft",
    weight: "27.4 tons",
    waitingTime: "3 min",
    submittedAt: "Feb 6, 2026 07:57",
    priority: "normal",
    notes: "",
  },
  {
    id: "BK-2026-0909",
    carrier: "Algiers Freight Co",
    truckPlate: "00216-231-ST",
    driverName: "Hocine Djerbi",
    timeSlot: "14:00 - 15:00",
    date: "Feb 6, 2026",
    operationType: "import",
    containerRef: "CSQU-5567821",
    containerSize: "20ft",
    weight: "11.2 tons",
    waitingTime: "1 min",
    submittedAt: "Feb 6, 2026 07:59",
    priority: "normal",
    notes: "",
  },
  {
    id: "BK-2026-0910",
    carrier: "Djurdjura Trans",
    truckPlate: "00216-312-UV",
    driverName: "Rachid Hamdi",
    timeSlot: "14:00 - 15:00",
    date: "Feb 6, 2026",
    operationType: "export",
    containerRef: "MAEU-3348921",
    containerSize: "40ft",
    weight: "30.2 tons",
    waitingTime: "Just now",
    submittedAt: "Feb 6, 2026 08:00",
    priority: "normal",
    notes: "Hazardous materials - special permit required",
  },
  {
    id: "BK-2026-0911",
    carrier: "MedTransport SA",
    truckPlate: "00216-142-WX",
    driverName: "Amir Slimani",
    timeSlot: "15:00 - 16:00",
    date: "Feb 6, 2026",
    operationType: "import",
    containerRef: "TCLU-9923847",
    containerSize: "20ft",
    weight: "13.7 tons",
    waitingTime: "Just now",
    submittedAt: "Feb 6, 2026 08:00",
    priority: "normal",
    notes: "",
  },
  {
    id: "BK-2026-0912",
    carrier: "Oran Maritime",
    truckPlate: "00216-678-YZ",
    driverName: "Bilal Ferhat",
    timeSlot: "15:00 - 16:00",
    date: "Feb 6, 2026",
    operationType: "export",
    containerRef: "CMAU-7712389",
    containerSize: "40ft",
    weight: "25.9 tons",
    waitingTime: "Just now",
    submittedAt: "Feb 6, 2026 08:01",
    priority: "urgent",
    notes: "Express shipment - vessel departing at 18:00",
  },
  {
    id: "BK-2026-0913",
    carrier: "Sahel Logistics",
    truckPlate: "00216-087-AA",
    driverName: "Mounir Chabane",
    timeSlot: "16:00 - 17:00",
    date: "Feb 6, 2026",
    operationType: "import",
    containerRef: "MSKU-1123456",
    containerSize: "20ft",
    weight: "14.0 tons",
    waitingTime: "Just now",
    submittedAt: "Feb 6, 2026 08:02",
    priority: "normal",
    notes: "",
  },
  {
    id: "BK-2026-0914",
    carrier: "Atlas Shipping",
    truckPlate: "00216-455-BB",
    driverName: "Tarek Benmoussa",
    timeSlot: "16:00 - 17:00",
    date: "Feb 6, 2026",
    operationType: "export",
    containerRef: "HLXU-4456789",
    containerSize: "40ft",
    weight: "28.0 tons",
    waitingTime: "Just now",
    submittedAt: "Feb 6, 2026 08:03",
    priority: "normal",
    notes: "",
  },
  {
    id: "BK-2026-0915",
    carrier: "Algiers Freight Co",
    truckPlate: "00216-231-CC",
    driverName: "Samir Boudali",
    timeSlot: "17:00 - 18:00",
    date: "Feb 6, 2026",
    operationType: "import",
    containerRef: "TCNU-8812345",
    containerSize: "20ft",
    weight: "10.5 tons",
    waitingTime: "Just now",
    submittedAt: "Feb 6, 2026 08:04",
    priority: "normal",
    notes: "",
  },
  {
    id: "BK-2026-0916",
    carrier: "Djurdjura Trans",
    truckPlate: "00216-312-DD",
    driverName: "Walid Messaoud",
    timeSlot: "17:00 - 18:00",
    date: "Feb 6, 2026",
    operationType: "export",
    containerRef: "CSQU-2234567",
    containerSize: "40ft",
    weight: "32.1 tons",
    waitingTime: "Just now",
    submittedAt: "Feb 6, 2026 08:05",
    priority: "normal",
    notes: "Overweight - confirm with terminal supervisor",
  },
  {
    id: "BK-2026-0917",
    carrier: "Oran Maritime",
    truckPlate: "00216-678-EE",
    driverName: "Djamel Boucetta",
    timeSlot: "18:00 - 19:00",
    date: "Feb 6, 2026",
    operationType: "import",
    containerRef: "MAEU-6645678",
    containerSize: "20ft",
    weight: "15.3 tons",
    waitingTime: "Just now",
    submittedAt: "Feb 6, 2026 08:06",
    priority: "normal",
    notes: "",
  },
  {
    id: "BK-2026-0918",
    carrier: "MedTransport SA",
    truckPlate: "00216-142-FF",
    driverName: "Nadir Hassani",
    timeSlot: "18:00 - 19:00",
    date: "Feb 6, 2026",
    operationType: "export",
    containerRef: "CMAU-3378901",
    containerSize: "40ft",
    weight: "24.8 tons",
    waitingTime: "Just now",
    submittedAt: "Feb 6, 2026 08:07",
    priority: "normal",
    notes: "",
  },
]

export default function OperatorQueuePage() {
  const [queue, setQueue] = useState(initialQueue)
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<QueueBooking | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectBooking, setRejectBooking] = useState<QueueBooking | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const filtered = useMemo(() => {
    return queue.filter((b) => {
      const matchesSearch =
        search === "" ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.carrier.toLowerCase().includes(search.toLowerCase()) ||
        b.truckPlate.toLowerCase().includes(search.toLowerCase()) ||
        b.containerRef.toLowerCase().includes(search.toLowerCase())
      const matchesPriority = priorityFilter === "all" || b.priority === priorityFilter
      const matchesType = typeFilter === "all" || b.operationType === typeFilter
      return matchesSearch && matchesPriority && matchesType
    })
  }, [queue, search, priorityFilter, typeFilter])

  const urgentCount = queue.filter((b) => b.priority === "urgent").length
  const hasFilters = search !== "" || priorityFilter !== "all" || typeFilter !== "all"

  const handleApprove = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id))
    setSelectedBooking(null)
  }

  const handleBulkApproveAll = () => {
    setQueue([])
  }

  const openRejectDialog = (booking: QueueBooking) => {
    setRejectBooking(booking)
    setRejectReason("")
    setRejectDialogOpen(true)
  }

  const handleReject = () => {
    if (rejectBooking) {
      setQueue((prev) => prev.filter((item) => item.id !== rejectBooking.id))
      setRejectDialogOpen(false)
      setRejectBooking(null)
      setRejectReason("")
      setSelectedBooking(null)
    }
  }

  const clearFilters = () => {
    setSearch("")
    setPriorityFilter("all")
    setTypeFilter("all")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-foreground">Booking Queue</h1>
            {urgentCount > 0 && (
              <Badge className="border-0 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">
                {urgentCount} urgent
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {queue.length} pending booking{queue.length !== 1 ? "s" : ""} awaiting validation at Terminal A
          </p>
        </div>
        <Button
          onClick={handleBulkApproveAll}
          disabled={queue.length === 0}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve All ({queue.length})
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
              <Clock className="h-5 w-5 text-[hsl(var(--warning))]" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-foreground">{queue.length}</p>
              <p className="text-xs text-muted-foreground">In Queue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--destructive))]/10">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-foreground">{urgentCount}</p>
              <p className="text-xs text-muted-foreground">Urgent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-foreground">46</p>
              <p className="text-xs text-muted-foreground">Approved Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(210,65%,45%)]/10">
              <Container className="h-5 w-5 text-[hsl(210,65%,45%)]" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-foreground">85%</p>
              <p className="text-xs text-muted-foreground">Capacity Used</p>
            </div>
          </CardContent>
        </Card>
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
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 bg-muted/50 pl-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="hidden h-4 w-4 text-muted-foreground md:block" />
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 w-[130px] text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-[120px] text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
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

      {/* Queue List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CheckCircle2 className="h-10 w-10 text-[hsl(var(--success))]/40" />
              <p className="mt-3 text-sm font-medium text-foreground">Queue is clear</p>
              <p className="mt-1 text-xs text-muted-foreground">
                All pending bookings have been processed.
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((booking) => (
            <Card
              key={booking.id}
              className={`border-border transition-colors hover:bg-muted/30 ${
                booking.priority === "urgent"
                  ? "border-l-2 border-l-[hsl(var(--warning))] bg-[hsl(var(--warning))]/[0.02]"
                  : "bg-card"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {booking.id}
                      </span>
                      {booking.priority === "urgent" && (
                        <Badge className="border-0 bg-[hsl(var(--warning))]/10 px-1.5 py-0 text-[10px] text-[hsl(var(--warning))]">
                          Urgent
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={
                          booking.operationType === "import"
                            ? "border-[hsl(210,65%,45%)]/30 px-1.5 py-0 text-[10px] text-[hsl(210,65%,45%)]"
                            : "border-[hsl(185,60%,42%)]/30 px-1.5 py-0 text-[10px] text-[hsl(185,60%,42%)]"
                        }
                      >
                        {booking.operationType === "import" ? "Import" : "Export"}
                      </Badge>
                      <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                        {booking.containerSize}
                      </Badge>
                    </div>

                    <div className="mt-1.5 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Carrier</p>
                        <p className="text-xs font-medium text-foreground">{booking.carrier}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Truck</p>
                        <p className="font-mono text-xs text-foreground">{booking.truckPlate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Time Slot</p>
                        <p className="text-xs text-foreground">{booking.timeSlot}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Container</p>
                        <p className="font-mono text-xs text-foreground">{booking.containerRef}</p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-2 rounded border border-border bg-muted/30 px-2.5 py-1.5">
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">Note:</span> {booking.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Waiting: {booking.waitingTime}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Submitted: {booking.submittedAt}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedBooking(booking)}
                      aria-label="View details"
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 bg-[hsl(var(--success))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--success))]/90"
                      onClick={() => handleApprove(booking.id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Approve</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 border-[hsl(var(--destructive))]/30 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                      onClick={() => openRejectDialog(booking)}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Reject</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
                <div className="flex items-center gap-2">
                  {selectedBooking.priority === "urgent" && (
                    <Badge className="border-0 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">
                      Urgent
                    </Badge>
                  )}
                  <Badge className="border-0 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">
                    Pending
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Carrier" value={selectedBooking.carrier} />
                <DetailItem label="Driver" value={selectedBooking.driverName} />
                <DetailItem label="Date" value={selectedBooking.date} />
                <DetailItem label="Time Slot" value={selectedBooking.timeSlot} />
                <DetailItem label="Truck Plate" value={selectedBooking.truckPlate} />
                <DetailItem label="Container" value={selectedBooking.containerRef} />
                <DetailItem label="Container Size" value={selectedBooking.containerSize} />
                <DetailItem label="Weight" value={selectedBooking.weight} />
                <div>
                  <p className="text-xs text-muted-foreground">Operation</p>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={
                        selectedBooking.operationType === "import"
                          ? "border-[hsl(210,65%,45%)]/30 text-[hsl(210,65%,45%)]"
                          : "border-[hsl(185,60%,42%)]/30 text-[hsl(185,60%,42%)]"
                      }
                    >
                      {selectedBooking.operationType === "import" ? "Import" : "Export"}
                    </Badge>
                  </div>
                </div>
                <DetailItem label="Waiting Time" value={selectedBooking.waitingTime} />
              </div>

              {selectedBooking.notes && (
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs font-medium text-foreground">Notes</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Submitted: {selectedBooking.submittedAt}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  className="gap-1.5 border-[hsl(var(--destructive))]/30 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                  onClick={() => {
                    setSelectedBooking(null)
                    openRejectDialog(selectedBooking)
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="gap-1.5 bg-[hsl(var(--success))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--success))]/90"
                  onClick={() => handleApprove(selectedBooking.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Reject Booking</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {rejectBooking?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="rejectReason">Rejection Reason</Label>
              <Select
                value={rejectReason}
                onValueChange={setRejectReason}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="capacity_full">Terminal capacity full for this slot</SelectItem>
                  <SelectItem value="invalid_docs">Invalid or missing documentation</SelectItem>
                  <SelectItem value="carrier_suspended">Carrier account suspended</SelectItem>
                  <SelectItem value="duplicate">Duplicate booking request</SelectItem>
                  <SelectItem value="maintenance">Terminal under maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional details..."
                className="resize-none text-sm"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason}
              className="bg-[hsl(var(--destructive))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--destructive))]/90"
            >
              Reject Booking
            </Button>
          </DialogFooter>
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
