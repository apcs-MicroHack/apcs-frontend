"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Container,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Pencil,
  Save,
  AlertTriangle,
  XCircle,
  Truck,
  CheckCircle2,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

// ── Types ────────────────────────────────────────────────────────────────────

interface HourlySlot {
  hour: string
  maxTrucks: number
  bookedTrucks: number
}

interface SlotBooking {
  id: string
  carrier: string
  truckPlate: string
  driverName: string
  containerRef: string
  containerSize: "20ft" | "40ft"
  operationType: "import" | "export"
  weight: string
  priority: "urgent" | "normal"
  submittedAt: string
}

// ── Base data ────────────────────────────────────────────────────────────────

const terminalSlots: HourlySlot[] = [
  { hour: "06:00", maxTrucks: 15, bookedTrucks: 12 },
  { hour: "07:00", maxTrucks: 20, bookedTrucks: 18 },
  { hour: "08:00", maxTrucks: 20, bookedTrucks: 17 },
  { hour: "09:00", maxTrucks: 20, bookedTrucks: 20 },
  { hour: "10:00", maxTrucks: 20, bookedTrucks: 14 },
  { hour: "11:00", maxTrucks: 18, bookedTrucks: 10 },
  { hour: "12:00", maxTrucks: 12, bookedTrucks: 8 },
  { hour: "13:00", maxTrucks: 12, bookedTrucks: 6 },
  { hour: "14:00", maxTrucks: 20, bookedTrucks: 16 },
  { hour: "15:00", maxTrucks: 20, bookedTrucks: 13 },
  { hour: "16:00", maxTrucks: 18, bookedTrucks: 15 },
  { hour: "17:00", maxTrucks: 15, bookedTrucks: 11 },
  { hour: "18:00", maxTrucks: 12, bookedTrucks: 7 },
  { hour: "19:00", maxTrucks: 10, bookedTrucks: 4 },
  { hour: "20:00", maxTrucks: 8, bookedTrucks: 2 },
  { hour: "21:00", maxTrucks: 5, bookedTrucks: 1 },
]

// Generate realistic booking data for each slot
function generateBookingsForSlot(hour: string, count: number): SlotBooking[] {
  const carriers = [
    "MedTransport SA",
    "Algiers Freight Co",
    "Sahel Logistics",
    "Atlas Shipping",
    "Djurdjura Trans",
    "Oran Maritime",
  ]
  const drivers = [
    "Karim Bouzid", "Yacine Mehdaoui", "Noureddine Ait", "Said Bennour",
    "Omar Belkacem", "Adel Khelifi", "Farid Zaidi", "Mourad Lahlah",
    "Hocine Djerbi", "Rachid Hamdi", "Amir Slimani", "Bilal Ferhat",
    "Mounir Chabane", "Tarek Benmoussa", "Samir Boudali", "Walid Messaoud",
    "Djamel Boucetta", "Nadir Hassani", "Lotfi Amrane", "Redouane Guellil",
  ]

  const seed = hour.charCodeAt(0) + hour.charCodeAt(1) * 7 + hour.charCodeAt(3) * 13

  return Array.from({ length: count }, (_, i) => {
    const idx = (seed + i * 7) % carriers.length
    const dIdx = (seed + i * 3) % drivers.length
    const num = String(900 + seed + i).slice(-3)
    return {
      id: `BK-2026-${String(1000 + (seed * 3 + i) % 999).slice(-4)}`,
      carrier: carriers[idx],
      truckPlate: `00216-${String(100 + ((seed + i * 11) % 900)).padStart(3, "0")}-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 1) % 26))}`,
      driverName: drivers[dIdx],
      containerRef: `${["MSKU", "TCLU", "CSQU", "HLXU", "CMAU", "MAEU", "TCNU"][i % 7]}-${String(1000000 + seed * 1000 + i * 137).slice(-7)}`,
      containerSize: i % 3 === 0 ? "20ft" : "40ft",
      operationType: i % 2 === 0 ? "import" : "export",
      weight: `${(12 + ((seed + i * 5) % 20)).toFixed(1)} tons`,
      priority: i < 2 && hour <= "09:00" ? "urgent" : "normal",
      submittedAt: `Feb 6, 2026 ${String(5 + (i % 3)).padStart(2, "0")}:${String((seed + i * 17) % 60).padStart(2, "0")}`,
    }
  })
}

// Build the full bookings map for today
const todayBookingsMap: Record<string, SlotBooking[]> = {}
for (const slot of terminalSlots) {
  todayBookingsMap[slot.hour] = generateBookingsForSlot(slot.hour, slot.bookedTrucks)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getUtilization(booked: number, max: number) {
  if (max === 0) return 0
  return Math.round((booked / max) * 100)
}

function getUtilColor(pct: number) {
  if (pct >= 90) return "bg-[hsl(var(--destructive))]"
  if (pct >= 70) return "bg-[hsl(var(--warning))]"
  if (pct >= 40) return "bg-[hsl(185,60%,42%)]"
  return "bg-[hsl(var(--success))]"
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

function formatDateDisplay(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function isToday(date: Date) {
  const today = new Date()
  return formatDate(date) === formatDate(today)
}

function seededBookings(base: number, max: number, dateSeed: number) {
  const booked = Math.round(
    base * (0.4 + 0.6 * ((Math.sin(dateSeed * base + max) + 1) / 2))
  )
  return Math.min(booked, max)
}

function getSlotsForDate(date: Date): HourlySlot[] {
  if (isToday(date)) return terminalSlots
  const seed =
    date.getDate() + date.getMonth() * 31 + date.getFullYear()
  return terminalSlots.map((slot) => ({
    ...slot,
    bookedTrucks: seededBookings(
      slot.bookedTrucks,
      slot.maxTrucks,
      seed + slot.hour.charCodeAt(0)
    ),
  }))
}

// ── Component ────────────────────────────────────────────────────────────────

export default function OperatorCapacityPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [overrides, setOverrides] = useState<Record<string, Record<string, number>>>({})
  const [editingSlot, setEditingSlot] = useState<{ hourIndex: number } | null>(null)
  const [editCapacity, setEditCapacity] = useState("")

  // Cancelled bookings tracked per date+hour
  const [cancelledBookings, setCancelledBookings] = useState<Record<string, Record<string, string[]>>>({})

  // Overflow resolution state
  const [overflowSlot, setOverflowSlot] = useState<{
    hour: string
    newCapacity: number
    currentBooked: number
    excessCount: number
  } | null>(null)
  const [selectedForCancel, setSelectedForCancel] = useState<string[]>([])
  const [cancelReason, setCancelReason] = useState("")
  const [cancelNotes, setCancelNotes] = useState("")
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [resolvedOverflows, setResolvedOverflows] = useState<
    Array<{ hour: string; cancelled: number; reason: string }>
  >([])

  const dateKey = formatDate(selectedDate)

  // Get active bookings for a slot (excluding cancelled ones)
  const getActiveBookings = useCallback(
    (hour: string): SlotBooking[] => {
      const allBookings = isToday(selectedDate)
        ? todayBookingsMap[hour] || []
        : generateBookingsForSlot(
            hour,
            seededBookings(
              terminalSlots.find((s) => s.hour === hour)?.bookedTrucks || 0,
              terminalSlots.find((s) => s.hour === hour)?.maxTrucks || 0,
              selectedDate.getDate() +
                selectedDate.getMonth() * 31 +
                selectedDate.getFullYear() +
                hour.charCodeAt(0)
            )
          )
      const cancelled = cancelledBookings[dateKey]?.[hour] || []
      return allBookings.filter((b) => !cancelled.includes(b.id))
    },
    [selectedDate, dateKey, cancelledBookings]
  )

  const slots = useMemo(() => {
    const base = getSlotsForDate(selectedDate)
    const dateOverrides = overrides[dateKey]
    return base.map((slot) => {
      const activeCount = getActiveBookings(slot.hour).length
      const maxTrucks =
        dateOverrides?.[slot.hour] !== undefined
          ? dateOverrides[slot.hour]
          : slot.maxTrucks
      return { ...slot, maxTrucks, bookedTrucks: activeCount }
    })
  }, [selectedDate, dateKey, overrides, getActiveBookings])

  const totalBooked = slots.reduce((s, t) => s + t.bookedTrucks, 0)
  const totalCapacity = slots.reduce((s, t) => s + t.maxTrucks, 0)
  const overallUtil = getUtilization(totalBooked, totalCapacity)

  // Detect any slots with overflows (booked > max)
  const overflowSlots = slots.filter((s) => s.bookedTrucks > s.maxTrucks)

  const goToPrevDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 1)
      return d
    })
  }

  const goToNextDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 1)
      return d
    })
  }

  const goToToday = () => setSelectedDate(new Date())

  const handleSaveSlot = () => {
    if (!editingSlot) return
    const newCap = Number.parseInt(editCapacity)
    if (Number.isNaN(newCap) || newCap < 0) return
    const slot = slots[editingSlot.hourIndex]
    if (!slot) return

    const activeCount = getActiveBookings(slot.hour).length

    // Apply the capacity change immediately
    setOverrides((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [slot.hour]: newCap,
      },
    }))
    setEditingSlot(null)
    setEditCapacity("")

    // If the new capacity is less than current bookings, trigger overflow resolution
    if (newCap < activeCount) {
      setOverflowSlot({
        hour: slot.hour,
        newCapacity: newCap,
        currentBooked: activeCount,
        excessCount: activeCount - newCap,
      })
      setSelectedForCancel([])
      setCancelReason("")
      setCancelNotes("")
    }
  }

  const handleResolveOverflow = (hour: string) => {
    const slot = slots.find((s) => s.hour === hour)
    if (!slot) return
    const activeCount = getActiveBookings(hour).length
    const excess = activeCount - slot.maxTrucks
    if (excess <= 0) return

    setOverflowSlot({
      hour,
      newCapacity: slot.maxTrucks,
      currentBooked: activeCount,
      excessCount: excess,
    })
    setSelectedForCancel([])
    setCancelReason("")
    setCancelNotes("")
  }

  const handleToggleBooking = (id: string) => {
    setSelectedForCancel((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSelectAllExcess = () => {
    if (!overflowSlot) return
    const bookings = getActiveBookings(overflowSlot.hour)
    // Select last N bookings (most recently submitted, normal priority first)
    const sorted = [...bookings].sort((a, b) => {
      if (a.priority === "urgent" && b.priority !== "urgent") return 1
      if (a.priority !== "urgent" && b.priority === "urgent") return -1
      return 0
    })
    const toCancel = sorted.slice(0, overflowSlot.excessCount).map((b) => b.id)
    setSelectedForCancel(toCancel)
  }

  const handleOpenCancelConfirm = () => {
    setCancelConfirmOpen(true)
  }

  const handleConfirmCancel = () => {
    if (!overflowSlot || selectedForCancel.length === 0) return

    // Record cancellations
    setCancelledBookings((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [overflowSlot.hour]: [
          ...(prev[dateKey]?.[overflowSlot.hour] || []),
          ...selectedForCancel,
        ],
      },
    }))

    // Record the resolution for the success banner
    const reasonLabels: Record<string, string> = {
      capacity_reduced: "Capacity reduced",
      maintenance: "Terminal maintenance",
      weather: "Weather conditions",
      equipment: "Equipment failure",
      operational: "Operational constraints",
      other: "Other",
    }

    setResolvedOverflows((prev) => [
      ...prev,
      {
        hour: overflowSlot.hour,
        cancelled: selectedForCancel.length,
        reason: reasonLabels[cancelReason] || cancelReason,
      },
    ])

    // Clean up state
    setOverflowSlot(null)
    setSelectedForCancel([])
    setCancelReason("")
    setCancelNotes("")
    setCancelConfirmOpen(false)
  }

  const dismissResolved = (idx: number) => {
    setResolvedOverflows((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Capacity Configuration
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage hourly truck capacity for Terminal A - North Quay
        </p>
      </div>

      {/* Resolved overflow success banners */}
      {resolvedOverflows.map((r, idx) => (
        <div
          key={`resolved-${idx}`}
          className="flex items-center justify-between rounded-lg border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Overflow resolved for {r.hour} slot
              </p>
              <p className="text-xs text-muted-foreground">
                {r.cancelled} booking{r.cancelled !== 1 ? "s" : ""} cancelled.
                Reason: {r.reason}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => dismissResolved(idx)}
          >
            Dismiss
          </Button>
        </div>
      ))}

      {/* Active overflow warnings */}
      {overflowSlots.length > 0 && (
        <div className="flex flex-col gap-3">
          {overflowSlots.map((slot) => {
            const excess = slot.bookedTrucks - slot.maxTrucks
            return (
              <div
                key={`overflow-${slot.hour}`}
                className="flex items-center justify-between rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Capacity overflow at {slot.hour}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {slot.bookedTrucks} bookings exceed the {slot.maxTrucks}-truck
                      limit by{" "}
                      <span className="font-semibold text-[hsl(var(--destructive))]">
                        {excess}
                      </span>
                      . You must cancel {excess} booking
                      {excess !== 1 ? "s" : ""} to comply.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 bg-[hsl(var(--destructive))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--destructive))]/90"
                  onClick={() => handleResolveOverflow(slot.hour)}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Resolve
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Date Selector */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Viewing capacity for
              </p>
              <p className="font-heading text-sm font-semibold text-foreground">
                {formatDateDisplay(selectedDate)}
                {isToday(selectedDate) && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-[hsl(var(--success))]/10 px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--success))]">
                    Today
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToPrevDay}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={isToday(selectedDate) ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={goToToday}
            >
              Today
            </Button>
            <input
              type="date"
              value={dateKey}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split("-").map(Number)
                  setSelectedDate(new Date(y, m - 1, d))
                }
              }}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToNextDay}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Terminal Info + Hourly Slots */}
      <Card className="border-border bg-card">
        <CardHeader className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Container className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-heading text-base font-semibold text-foreground">
                  Terminal A
                </CardTitle>
                <CardDescription className="mt-0.5 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    North Quay
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    06:00 - 22:00
                  </span>
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {overallUtil}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Utilization</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="border-t border-border px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Hourly Capacity Schedule
            </p>
            <p className="text-xs text-muted-foreground">
              Click edit to adjust slot capacity
            </p>
          </div>

          {/* Hourly slots grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {slots.map((slot, idx) => {
              const util = getUtilization(slot.bookedTrucks, slot.maxTrucks)
              const isOverflow = slot.bookedTrucks > slot.maxTrucks
              return (
                <div
                  key={slot.hour}
                  className={`group relative rounded-lg border p-3 transition-colors hover:bg-muted/60 ${
                    isOverflow
                      ? "border-[hsl(var(--destructive))]/50 bg-[hsl(var(--destructive))]/5"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">
                      {slot.hour}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {isOverflow && (
                        <AlertTriangle className="h-3 w-3 text-[hsl(var(--destructive))]" />
                      )}
                      <button
                        onClick={() => {
                          setEditingSlot({ hourIndex: idx })
                          setEditCapacity(String(slot.maxTrucks))
                        }}
                        className="rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                        aria-label={`Edit capacity for ${slot.hour}`}
                      >
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-end gap-1">
                    <span
                      className={`text-lg font-bold leading-none ${
                        isOverflow
                          ? "text-[hsl(var(--destructive))]"
                          : "text-foreground"
                      }`}
                    >
                      {slot.bookedTrucks}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {slot.maxTrucks}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverflow
                          ? "bg-[hsl(var(--destructive))]"
                          : getUtilColor(util)
                      }`}
                      style={{ width: `${Math.min(util, 100)}%` }}
                    />
                  </div>
                  <p
                    className={`mt-1 text-[10px] ${
                      isOverflow
                        ? "font-medium text-[hsl(var(--destructive))]"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isOverflow
                      ? `+${slot.bookedTrucks - slot.maxTrucks} over`
                      : `${util}% full`}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Total Booked</p>
                <p className="font-heading text-base font-bold text-foreground">
                  {totalBooked} trucks
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Capacity</p>
                <p className="font-heading text-base font-bold text-foreground">
                  {totalCapacity} trucks
                </p>
              </div>
              {overflowSlots.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Overflowing</p>
                  <p className="font-heading text-base font-bold text-[hsl(var(--destructive))]">
                    {overflowSlots.length} slot{overflowSlots.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
                <span className="text-[10px] text-muted-foreground">
                  {"< 40%"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[hsl(185,60%,42%)]" />
                <span className="text-[10px] text-muted-foreground">
                  40-70%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--warning))]" />
                <span className="text-[10px] text-muted-foreground">
                  70-90%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--destructive))]" />
                <span className="text-[10px] text-muted-foreground">
                  {">= 90%"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Edit Slot Dialog ────────────────────────────────────────── */}
      <Dialog
        open={!!editingSlot}
        onOpenChange={() => {
          setEditingSlot(null)
          setEditCapacity("")
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              Edit Capacity -{" "}
              {editingSlot ? slots[editingSlot.hourIndex]?.hour : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="slotCap">Max Trucks per Hour</Label>
              <Input
                id="slotCap"
                type="number"
                min={0}
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
                className="h-9"
              />
            </div>
            {editingSlot && (() => {
              const slot = slots[editingSlot.hourIndex]
              if (!slot) return null
              const newCap = Number.parseInt(editCapacity)
              const activeCount = getActiveBookings(slot.hour).length
              const willOverflow = !Number.isNaN(newCap) && newCap < activeCount

              return (
                <>
                  <p className="text-xs text-muted-foreground">
                    Currently {activeCount} truck{activeCount !== 1 ? "s" : ""} booked for this slot.
                  </p>
                  {willOverflow && (
                    <div className="flex items-start gap-2 rounded-lg border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 px-3 py-2.5">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--warning))]" />
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          Capacity overflow warning
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Setting capacity to {newCap} will require cancelling{" "}
                          <span className="font-semibold text-[hsl(var(--warning))]">
                            {activeCount - newCap}
                          </span>{" "}
                          booking{activeCount - newCap !== 1 ? "s" : ""}. You will be
                          prompted to select which bookings to cancel.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingSlot(null)
                setEditCapacity("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSlot} className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Overflow Resolution Dialog ──────────────────────────────── */}
      <Dialog
        open={!!overflowSlot && !cancelConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setOverflowSlot(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
              Resolve Capacity Overflow - {overflowSlot?.hour}
            </DialogTitle>
            <DialogDescription>
              The {overflowSlot?.hour} slot has {overflowSlot?.currentBooked} bookings
              but only {overflowSlot?.newCapacity} slots available. Select at
              least{" "}
              <span className="font-semibold text-[hsl(var(--destructive))]">
                {overflowSlot?.excessCount}
              </span>{" "}
              booking{(overflowSlot?.excessCount ?? 0) !== 1 ? "s" : ""} to cancel.
            </DialogDescription>
          </DialogHeader>

          {overflowSlot && (
            <div className="flex flex-col gap-4 overflow-hidden flex-1">
              {/* Progress indicator */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Selected for cancellation:
                  </span>
                  <Badge
                    className={`border-0 ${
                      selectedForCancel.length >= overflowSlot.excessCount
                        ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                        : "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]"
                    }`}
                  >
                    {selectedForCancel.length} / {overflowSlot.excessCount}{" "}
                    required
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleSelectAllExcess}
                >
                  Auto-select ({overflowSlot.excessCount})
                </Button>
              </div>

              {/* Bookings list */}
              <div className="flex-1 overflow-y-auto -mx-1 px-1">
                <div className="flex flex-col gap-2">
                  {getActiveBookings(overflowSlot.hour).map((booking) => {
                    const isSelected = selectedForCancel.includes(booking.id)
                    return (
                      <label
                        key={booking.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                          isSelected
                            ? "border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/5"
                            : "border-border bg-card hover:bg-muted/30"
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            handleToggleBooking(booking.id)
                          }
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-foreground">
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
                              {booking.operationType === "import"
                                ? "Import"
                                : "Export"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px]"
                            >
                              {booking.containerSize}
                            </Badge>
                          </div>
                          <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Carrier
                              </p>
                              <p className="text-xs font-medium text-foreground">
                                {booking.carrier}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Truck
                              </p>
                              <p className="font-mono text-xs text-foreground">
                                {booking.truckPlate}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Driver
                              </p>
                              <p className="text-xs text-foreground">
                                {booking.driverName}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Container
                              </p>
                              <p className="font-mono text-xs text-foreground">
                                {booking.containerRef}
                              </p>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--destructive))]" />
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Reason section */}
              <div className="flex flex-col gap-3 border-t border-border pt-3">
                <div className="flex flex-col gap-2">
                  <Label>Cancellation Reason</Label>
                  <Select value={cancelReason} onValueChange={setCancelReason}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select a reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="capacity_reduced">
                        Capacity reduced
                      </SelectItem>
                      <SelectItem value="maintenance">
                        Terminal maintenance
                      </SelectItem>
                      <SelectItem value="weather">Weather conditions</SelectItem>
                      <SelectItem value="equipment">Equipment failure</SelectItem>
                      <SelectItem value="operational">
                        Operational constraints
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Additional Notes (optional)</Label>
                  <Textarea
                    placeholder="Enter any additional details to include in the cancellation notice..."
                    value={cancelNotes}
                    onChange={(e) => setCancelNotes(e.target.value)}
                    className="resize-none text-sm"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border pt-3">
            <Button variant="outline" onClick={() => setOverflowSlot(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleOpenCancelConfirm}
              disabled={
                selectedForCancel.length < (overflowSlot?.excessCount ?? 1) ||
                !cancelReason
              }
              className="gap-1.5 bg-[hsl(var(--destructive))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--destructive))]/90"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel {selectedForCancel.length} Booking
              {selectedForCancel.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirmation Dialog ─────────────────────────────────────── */}
      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
              Confirm Cancellation
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The following bookings will be
              cancelled and the carriers will be notified with the reason
              provided.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Bookings to cancel
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {overflowSlot &&
                  getActiveBookings(overflowSlot.hour)
                    .filter((b) => selectedForCancel.includes(b.id))
                    .map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-mono text-xs font-medium text-foreground">
                          {b.id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {b.carrier}
                        </span>
                      </div>
                    ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Reason sent to carriers
              </p>
              <p className="mt-1 text-sm text-foreground">
                {
                  {
                    capacity_reduced: "Capacity reduced",
                    maintenance: "Terminal maintenance",
                    weather: "Weather conditions",
                    equipment: "Equipment failure",
                    operational: "Operational constraints",
                    other: "Other",
                  }[cancelReason]
                }
                {cancelNotes ? ` - ${cancelNotes}` : ""}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelConfirmOpen(false)}
            >
              Go Back
            </Button>
            <Button
              onClick={handleConfirmCancel}
              className="gap-1.5 bg-[hsl(var(--destructive))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--destructive))]/90"
            >
              <XCircle className="h-3.5 w-3.5" />
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
