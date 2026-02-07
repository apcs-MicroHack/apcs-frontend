"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  Container,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertTriangle,
  XCircle,
  Truck,
  RefreshCw,
  AlertCircle,
  Settings2,
  CalendarRange,
  X,
  Loader2,
  Ban,
  Calendar as CalendarIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useApi } from "@/hooks/use-api"
import { terminalService, slotService, bookingService, authService } from "@/services"
import type { Terminal, Booking, AvailabilitySlot, AvailabilityResponse, AvailabilityDay, User } from "@/services/types"
import { toast } from "sonner"

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function formatDateDisplay(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatRuleDateDisplay(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function parseDateStr(str: string): Date {
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function isToday(date: Date) {
  const today = new Date()
  return formatDate(date) === formatDate(today)
}

function formatSlotTime(t: string) {
  return t.slice(0, 5)
}

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

function getDaysInRange(startDate: string, endDate: string): Set<string> {
  const DAYS_ORDER = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
  const days = new Set<string>()
  const [sy, sm, sd] = startDate.split("-").map(Number)
  const [ey, em, ed] = endDate.split("-").map(Number)
  const start = new Date(sy, sm - 1, sd)
  const end = new Date(ey, em - 1, ed)
  const current = new Date(start)
  while (current <= end) {
    days.add(DAYS_ORDER[current.getDay()])
    current.setDate(current.getDate() + 1)
    if (days.size === 7) break
  }
  return days
}

function getDayCount(startDate: string, endDate: string): number {
  const [sy, sm, sd] = startDate.split("-").map(Number)
  const [ey, em, ed] = endDate.split("-").map(Number)
  const start = new Date(sy, sm - 1, sd)
  const end = new Date(ey, em - 1, ed)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

interface SlotWithUsage {
  slot: AvailabilitySlot
  bookedCount: number
  maxCapacity: number
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const

// ── Component ────────────────────────────────────────────────────────────────

export default function OperatorCapacityPage() {
  // Fetch operator's profile to get assigned terminals
  const { data: profile, loading: loadingProfile } = useApi<User>(
    () => authService.getProfile(),
    [],
  )

  // Extract terminals from operator's assignments
  // Backend returns terminal directly, or operatorTerminals array
  const assignedTerminals = profile?.terminal 
    ? [profile.terminal] 
    : profile?.operatorTerminals?.map((ot) => ot.terminal) ?? []
  const loadingTerminals = loadingProfile

  const [selectedTerminalId, setSelectedTerminalId] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [dayData, setDayData] = useState<AvailabilityDay | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cancel booking state
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [processing, setProcessing] = useState(false)

  // Slot capacity adjustment state
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null)
  const [newCapacity, setNewCapacity] = useState(0)
  const [adjustSaving, setAdjustSaving] = useState(false)
  const [adjustError, setAdjustError] = useState("")

  // Default capacity config dialog state
  const [capConfigOpen, setCapConfigOpen] = useState(false)
  const [capConfigLoading, setCapConfigLoading] = useState(false)
  const [capConfigSaving, setCapConfigSaving] = useState(false)
  const [capConfigs, setCapConfigs] = useState<{
    dayOfWeek: string
    operatingStart: string
    operatingEnd: string
    slotDurationMin: number
    maxTrucksPerSlot: number
  }[]>([])

  // Add capacity rule (override) dialog state
  const [ruleOpen, setRuleOpen] = useState(false)
  const [ruleLabel, setRuleLabel] = useState("")
  const [ruleStartDate, setRuleStartDate] = useState("")
  const [ruleEndDate, setRuleEndDate] = useState("")
  const [ruleDayConfigs, setRuleDayConfigs] = useState<{
    dayOfWeek: string
    enabled: boolean
    operatingStart: string
    operatingEnd: string
    slotDurationMin: number
    maxTrucksPerSlot: number
  }[]>([])
  const [ruleSaving, setRuleSaving] = useState(false)
  const [ruleError, setRuleError] = useState("")

  // Auto-select operator's assigned terminal
  useEffect(() => {
    if (assignedTerminals.length > 0 && !selectedTerminalId) {
      setSelectedTerminalId(assignedTerminals[0].id)
    }
  }, [assignedTerminals, selectedTerminalId])

  const selectedTerminal = assignedTerminals.find((t) => t.id === selectedTerminalId)
  const dateKey = formatDate(selectedDate)

  // Fetch slots + bookings when terminal or date changes
  const fetchCapacityData = useCallback(async () => {
    if (!selectedTerminalId) return
    setLoadingSlots(true)
    setError(null)
    try {
      const [slotsRes, bookingsResponse] = await Promise.all([
        slotService.getAvailableSlots(selectedTerminalId, dateKey, dateKey),
        bookingService.getBookings({ terminalId: selectedTerminalId, startDate: dateKey, endDate: dateKey }),
      ])
      const availRes = slotsRes as AvailabilityResponse
      const day = availRes.availability?.[0] ?? null
      setDayData(day)
      setSlots(day?.slots ?? [])
      setBookings(bookingsResponse.bookings ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load capacity data")
    } finally {
      setLoadingSlots(false)
    }
  }, [selectedTerminalId, dateKey])

  useEffect(() => {
    fetchCapacityData()
  }, [fetchCapacityData])

  // Build slot-with-usage data
  const slotData: SlotWithUsage[] = useMemo(() => {
    return slots.map((slot) => ({
      slot,
      bookedCount: slot.bookedCount,
      maxCapacity: slot.maxCapacity,
    }))
  }, [slots])

  const totalBooked = slotData.reduce((s, d) => s + d.bookedCount, 0)
  const totalCapacity = slotData.reduce((s, d) => s + d.maxCapacity, 0)
  const overallUtil = getUtilization(totalBooked, totalCapacity)
  const overflowSlots = slotData.filter((d) => d.bookedCount > d.maxCapacity)

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

  // ── Cancel booking ─────────────────────────────────────────

  const handleCancelBooking = async () => {
    if (!cancelTarget) return
    setProcessing(true)
    try {
      await bookingService.cancelBooking(cancelTarget.id, cancelReason || undefined)
      toast.success("Booking cancelled successfully")
      setCancelTarget(null)
      setCancelReason("")
      fetchCapacityData()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed to cancel booking"
      toast.error(msg)
    } finally {
      setProcessing(false)
    }
  }

  // ── Inline slot capacity adjustment ────────────────────────

  const handleSlotClick = (slot: AvailabilitySlot) => {
    setEditingSlot(slot)
    setNewCapacity(slot.maxCapacity)
    setAdjustError("")
  }

  const handleAdjustCapacity = async () => {
    if (!editingSlot || !selectedTerminalId) return
    setAdjustSaving(true)
    setAdjustError("")
    try {
      const [y, m, d] = dateKey.split("-").map(Number)
      const dayOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][
        new Date(y, m - 1, d).getDay()
      ]

      const [sh, sm] = editingSlot.startTime.split(":").map(Number)
      const [eh, em] = editingSlot.endTime.split(":").map(Number)
      const slotDurationMin = (eh * 60 + em) - (sh * 60 + sm)
      const safeDuration = slotDurationMin > 0 ? slotDurationMin : 60

      const operatingStart = dayData?.operatingHours?.start?.slice(0, 5) ?? "08:00"
      const operatingEnd = dayData?.operatingHours?.end?.slice(0, 5) ?? "18:00"

      await terminalService.createCapacityOverride(selectedTerminalId, {
        label: `Slot adj. ${formatSlotTime(editingSlot.startTime)}–${formatSlotTime(editingSlot.endTime)} on ${dateKey}`,
        startDate: dateKey,
        endDate: dateKey,
        timeStart: editingSlot.startTime.slice(0, 5),
        timeEnd: editingSlot.endTime.slice(0, 5),
        slotDurationMin: safeDuration,
        maxTrucksPerSlot: newCapacity,
        dayConfigs: [{
          dayOfWeek,
          operatingStart,
          operatingEnd,
          slotDurationMin: safeDuration,
          maxTrucksPerSlot: newCapacity,
        }],
      })
      toast.success("Slot capacity updated")
      setEditingSlot(null)
      fetchCapacityData()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed to adjust capacity"
      setAdjustError(msg)
      toast.error(msg)
    } finally {
      setAdjustSaving(false)
    }
  }

  // ── Default capacity config dialog ─────────────────────────

  const openCapConfigDialog = async () => {
    if (!selectedTerminalId) return
    setCapConfigOpen(true)
    setCapConfigLoading(true)
    try {
      const configs = await terminalService.getCapacityConfig(selectedTerminalId)
      const mapped = DAYS.map((day) => {
        const existing = configs.find((c: any) => c.dayOfWeek === day)
        return existing
          ? {
              dayOfWeek: day,
              operatingStart: existing.operatingStart,
              operatingEnd: existing.operatingEnd,
              slotDurationMin: existing.slotDurationMin,
              maxTrucksPerSlot: existing.maxTrucksPerSlot,
            }
          : {
              dayOfWeek: day,
              operatingStart: "08:00",
              operatingEnd: "18:00",
              slotDurationMin: 60,
              maxTrucksPerSlot: 10,
            }
      })
      setCapConfigs(mapped)
    } catch {
      setCapConfigs(DAYS.map((day) => ({
        dayOfWeek: day,
        operatingStart: "08:00",
        operatingEnd: "18:00",
        slotDurationMin: 60,
        maxTrucksPerSlot: 10,
      })))
    } finally {
      setCapConfigLoading(false)
    }
  }

  const handleCapConfigSave = async () => {
    if (!selectedTerminalId) return
    setCapConfigSaving(true)
    try {
      await terminalService.upsertCapacityConfig(selectedTerminalId, capConfigs)
      toast.success("Capacity configuration saved")
      setCapConfigOpen(false)
      fetchCapacityData()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed to save configuration"
      toast.error(msg)
    } finally {
      setCapConfigSaving(false)
    }
  }

  const updateCapConfig = (index: number, field: string, value: string | number) => {
    setCapConfigs((prev) => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  // ── Add capacity rule (override) dialog ────────────────────

  const openRuleDialog = () => {
    const today = formatDate(new Date())
    const todayDow = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][new Date().getDay()]
    setRuleLabel("")
    setRuleStartDate(today)
    setRuleEndDate(today)
    setRuleDayConfigs(
      DAYS.map((day) => ({
        dayOfWeek: day,
        enabled: day === todayDow,
        operatingStart: "08:00",
        operatingEnd: "18:00",
        slotDurationMin: 60,
        maxTrucksPerSlot: 10,
      })),
    )
    setRuleError("")
    setRuleOpen(true)
  }

  const handleRuleDateChange = (field: "start" | "end", value: string) => {
    const newStart = field === "start" ? value : ruleStartDate
    const newEnd = field === "end" ? value : ruleEndDate
    if (field === "start") setRuleStartDate(value)
    if (field === "end") setRuleEndDate(value)
    if (!newStart || !newEnd || newEnd < newStart) return
    const daysInRange = getDaysInRange(newStart, newEnd)
    const dayCount = getDayCount(newStart, newEnd)
    setRuleDayConfigs((prev) =>
      prev.map((dc) => {
        const inRange = daysInRange.has(dc.dayOfWeek)
        if (!inRange) return { ...dc, enabled: false }
        if (dayCount < 7) return { ...dc, enabled: true }
        return dc
      }),
    )
  }

  const handleSaveRule = async () => {
    if (!selectedTerminalId || !ruleLabel || !ruleStartDate || !ruleEndDate) return
    if (ruleEndDate < ruleStartDate) {
      setRuleError("End date must be on or after start date.")
      return
    }
    const enabledDays = ruleDayConfigs.filter((dc) => dc.enabled)
    if (enabledDays.length === 0) {
      setRuleError("Select at least one day of the week.")
      return
    }

    const daysInRange = getDaysInRange(ruleStartDate, ruleEndDate)
    const dayCount = getDayCount(ruleStartDate, ruleEndDate)

    if (dayCount === 1) {
      const expectedDay = [...daysInRange][0]
      if (enabledDays.length !== 1 || enabledDays[0].dayOfWeek !== expectedDay) {
        setRuleError(`Single-day rule must configure only ${expectedDay}.`)
        return
      }
    }

    if (dayCount > 1 && dayCount < 7) {
      const missingDays = [...daysInRange].filter((d) => !enabledDays.some((ed) => ed.dayOfWeek === d))
      if (missingDays.length > 0) {
        setRuleError(`Periods under 7 days must configure all days in range. Missing: ${missingDays.join(", ")}`)
        return
      }
    }

    setRuleSaving(true)
    setRuleError("")
    try {
      await terminalService.createCapacityOverride(selectedTerminalId, {
        label: ruleLabel,
        startDate: ruleStartDate,
        endDate: ruleEndDate,
        dayConfigs: enabledDays.map(({ enabled, ...rest }) => rest),
      })
      toast.success("Capacity rule created")
      setRuleOpen(false)
      fetchCapacityData()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed to create rule"
      setRuleError(msg)
      toast.error(msg)
    } finally {
      setRuleSaving(false)
    }
  }

  const updateRuleDayConfig = (index: number, field: string, value: string | number | boolean) => {
    setRuleDayConfigs((prev) => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  const loading = loadingTerminals || loadingSlots
  const daysInRuleRange = ruleStartDate && ruleEndDate && ruleEndDate >= ruleStartDate
    ? getDaysInRange(ruleStartDate, ruleEndDate)
    : new Set<string>()
  const ruleDayCount = ruleStartDate && ruleEndDate && ruleEndDate >= ruleStartDate
    ? getDayCount(ruleStartDate, ruleEndDate)
    : 0

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="gap-2" onClick={fetchCapacityData}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with action buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Capacity Configuration</h1>
          <p className="text-sm text-muted-foreground">Manage hourly truck capacity and scheduling rules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={openRuleDialog}
            disabled={!selectedTerminalId}
            title="Add Capacity Rule"
          >
            <CalendarRange className="h-4 w-4" />
            Add Rule
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={openCapConfigDialog}
            disabled={!selectedTerminalId}
            title="Default Capacity Config"
          >
            <Settings2 className="h-4 w-4" />
            Defaults
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={fetchCapacityData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Terminal + Date Selector */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Container className="h-4 w-4 text-primary" />
            </div>
            {loadingTerminals ? (
              <Skeleton className="h-9 w-[200px]" />
            ) : assignedTerminals.length === 1 ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{assignedTerminals[0].name}</span>
                <Badge variant="outline" className="text-xs">{assignedTerminals[0].code}</Badge>
              </div>
            ) : assignedTerminals.length === 0 ? (
              <span className="text-sm text-muted-foreground">No terminal assigned</span>
            ) : (
              <Select value={selectedTerminalId} onValueChange={setSelectedTerminalId}>
                <SelectTrigger className="h-9 w-[200px] text-sm"><SelectValue placeholder="Select Terminal" /></SelectTrigger>
                <SelectContent>
                  {assignedTerminals.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant={isToday(selectedDate) ? "default" : "outline"} size="sm" className="h-8 text-xs" onClick={goToToday}>
              Today
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 gap-2 px-3 text-xs font-normal">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDateDisplay(selectedDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overflow warnings */}
      {overflowSlots.length > 0 && (
        <div className="flex flex-col gap-3">
          {overflowSlots.map((d) => {
            const excess = d.bookedCount - d.maxCapacity
            return (
              <div key={d.slot.startTime} className="flex items-center gap-3 rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 px-4 py-3">
                <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
                <div>
                  <p className="text-sm font-medium text-foreground">Capacity overflow at {d.slot.startTime}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.bookedCount} bookings exceed the {d.maxCapacity}-truck limit by{" "}
                    <span className="font-semibold text-[hsl(var(--destructive))]">{excess}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Terminal Info + Slot Grid */}
      <Card className="border-border bg-card">
        <CardHeader className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Container className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-heading text-base font-semibold text-foreground">
                  {selectedTerminal?.name ?? "Select a Terminal"}
                </CardTitle>
                <CardDescription className="mt-0.5 flex items-center gap-4">
                  {selectedTerminal && (
                    <>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedTerminal.code}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedTerminal.type}</span>
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              {loading ? <Skeleton className="h-7 w-12" /> : (
                <>
                  <p className="text-sm font-semibold text-foreground">{overallUtil}%</p>
                  <p className="text-xs text-muted-foreground">Avg Utilization</p>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="border-t border-border px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {formatDateDisplay(selectedDate)}
                {isToday(selectedDate) && (
                  <span className="ml-2 inline-flex rounded-full bg-[hsl(var(--success))]/10 px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--success))]">Today</span>
                )}
              </p>
              {dayData?.operatingHours && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  {formatSlotTime(dayData.operatingHours.start)} – {formatSlotTime(dayData.operatingHours.end)}
                  {dayData.operatingHours.source !== "DEFAULT_CONFIG" && (
                    <span className="ml-1 text-[hsl(var(--warning))]">
                      ({dayData.operatingHours.source.split(":")[0]})
                    </span>
                  )}
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">Click a slot to adjust its capacity</p>
          </div>

          {/* Closed day */}
          {dayData?.isClosed ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 py-10 text-center">
              <Ban className="h-6 w-6 text-[hsl(var(--destructive))]" />
              <p className="text-sm font-medium text-[hsl(var(--destructive))]">Terminal Closed</p>
              {dayData.closedReason && (
                <p className="text-xs text-muted-foreground">{dayData.closedReason}</p>
              )}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
            </div>
          ) : slotData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No time slots configured for this date.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                {slotData.map((d, idx) => {
                  const util = getUtilization(d.bookedCount, d.maxCapacity)
                  const isOverflow = d.bookedCount > d.maxCapacity
                  const isSelected = editingSlot?.startTime === d.slot.startTime && editingSlot?.endTime === d.slot.endTime
                  return (
                    <div
                      key={`${d.slot.startTime}-${idx}`}
                      className={`cursor-pointer rounded-lg border p-3 transition-all hover:bg-muted/60 hover:shadow-sm ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : isOverflow
                          ? "border-[hsl(var(--destructive))]/50 bg-[hsl(var(--destructive))]/5"
                          : "border-border bg-muted/30"
                      }`}
                      onClick={() => handleSlotClick(d.slot)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground">
                          {formatSlotTime(d.slot.startTime)} – {formatSlotTime(d.slot.endTime)}
                        </p>
                        {isOverflow && <AlertTriangle className="h-3 w-3 text-[hsl(var(--destructive))]" />}
                      </div>
                      <div className="mt-2 flex items-end gap-1">
                        <span className={`text-lg font-bold leading-none ${isOverflow ? "text-[hsl(var(--destructive))]" : "text-foreground"}`}>
                          {d.bookedCount}
                        </span>
                        <span className="text-xs text-muted-foreground">/ {d.maxCapacity}</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-all ${isOverflow ? "bg-[hsl(var(--destructive))]" : getUtilColor(util)}`}
                          style={{ width: `${Math.min(util, 100)}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className={`text-[10px] ${isOverflow ? "font-medium text-[hsl(var(--destructive))]" : "text-muted-foreground"}`}>
                          {isOverflow ? `+${d.bookedCount - d.maxCapacity} over` : `${util}% full`}
                        </span>
                        {!d.slot.isAvailable && (
                          <Badge variant="outline" className="h-4 px-1 text-[9px]">Full</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Inline slot capacity editor */}
              {editingSlot && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-xs font-medium text-foreground">
                      Adjust capacity for <span className="font-semibold">{dateKey}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Adjusts only the {formatSlotTime(editingSlot.startTime)}–{formatSlotTime(editingSlot.endTime)} slot · Currently {editingSlot.bookedCount} booked
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground shrink-0">Max Trucks</Label>
                    <Input
                      type="number"
                      min={editingSlot.bookedCount}
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(Number(e.target.value))}
                      className="h-8 w-20 text-xs"
                    />
                    <Button
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={handleAdjustCapacity}
                      disabled={adjustSaving || newCapacity === editingSlot.maxCapacity}
                    >
                      {adjustSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingSlot(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {adjustError && (
                    <p className="w-full text-xs text-destructive">{adjustError}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Summary bar */}
          {slotData.length > 0 && !loading && !dayData?.isClosed && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Total Booked</p>
                  <p className="font-heading text-base font-bold text-foreground">{totalBooked} trucks</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Capacity</p>
                  <p className="font-heading text-base font-bold text-foreground">{totalCapacity} trucks</p>
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
                {[
                  { color: "bg-[hsl(var(--success))]", label: "< 40%" },
                  { color: "bg-[hsl(185,60%,42%)]", label: "40-70%" },
                  { color: "bg-[hsl(var(--warning))]", label: "70-90%" },
                  { color: "bg-[hsl(var(--destructive))]", label: ">= 90%" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${l.color}`} />
                    <span className="text-[10px] text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings list */}
      {!loading && bookings.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Bookings ({bookings.length})
            </CardTitle>
            <CardDescription>All bookings for {formatDateDisplay(selectedDate)}</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex flex-col gap-2">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold">{b.bookingNumber}</span>
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{b.cargoType.replace("_", " ")}</Badge>
                        <Badge
                          className={`border-0 px-1.5 py-0 text-[10px] ${
                            b.status === "CONFIRMED" ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                            : b.status === "PENDING" ? "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]"
                            : "bg-muted text-muted-foreground"
                          }`}
                        >{b.status}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {b.carrier.companyName} · {b.truck.plateNumber} · {b.timeSlot.startTime}-{b.timeSlot.endTime}
                      </p>
                    </div>
                  </div>
                  {(b.status === "CONFIRMED" || b.status === "PENDING") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-[hsl(var(--destructive))]"
                      onClick={() => { setCancelTarget(b); setCancelReason("") }}
                    >
                      <XCircle className="mr-1 h-3 w-3" /> Cancel
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Cancel Booking</DialogTitle>
            <DialogDescription>Cancel {cancelTarget?.bookingNumber} by {cancelTarget?.carrier.companyName}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label>Reason (optional)</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="resize-none text-sm"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>Keep Booking</Button>
            <Button
              onClick={handleCancelBooking}
              disabled={processing}
              className="gap-1.5 bg-[hsl(var(--destructive))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--destructive))]/90"
            >
              <XCircle className="h-3.5 w-3.5" /> {processing ? "Cancelling…" : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Default Capacity Config Dialog */}
      <Dialog open={capConfigOpen} onOpenChange={setCapConfigOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Default Capacity Configuration</DialogTitle>
            <DialogDescription>
              Configure default operating hours and capacity for each day of the week for {selectedTerminal?.name}.
            </DialogDescription>
          </DialogHeader>
          {capConfigLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-2 text-xs font-medium text-muted-foreground border-b border-border pb-2">
                <span>Day</span>
                <span>Start</span>
                <span>End</span>
                <span>Slot (min)</span>
                <span>Max Trucks</span>
              </div>
              {capConfigs.map((cfg, idx) => (
                <div key={cfg.dayOfWeek} className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-2 items-center">
                  <span className="text-sm font-medium text-foreground">{cfg.dayOfWeek.slice(0, 3)}</span>
                  <Input
                    type="time"
                    value={cfg.operatingStart}
                    onChange={(e) => updateCapConfig(idx, "operatingStart", e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    type="time"
                    value={cfg.operatingEnd}
                    onChange={(e) => updateCapConfig(idx, "operatingEnd", e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    type="number"
                    min={15}
                    step={15}
                    value={cfg.slotDurationMin}
                    onChange={(e) => updateCapConfig(idx, "slotDurationMin", Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={cfg.maxTrucksPerSlot}
                    onChange={(e) => updateCapConfig(idx, "maxTrucksPerSlot", Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCapConfigOpen(false)}>Cancel</Button>
            <Button onClick={handleCapConfigSave} disabled={capConfigSaving || capConfigLoading} className="gap-1.5">
              {capConfigSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Capacity Rule Dialog */}
      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Add Capacity Rule</DialogTitle>
            <DialogDescription>
              Create a capacity override for a specific date range on {selectedTerminal?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Rule Label</Label>
              <Input
                placeholder="e.g. Holiday Hours, Peak Season, Maintenance"
                value={ruleLabel}
                onChange={(e) => setRuleLabel(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-9 w-full justify-start gap-2 font-normal">
                      <CalendarIcon className="h-4 w-4" />
                      {ruleStartDate ? formatRuleDateDisplay(parseDateStr(ruleStartDate)) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={ruleStartDate ? parseDateStr(ruleStartDate) : undefined}
                      onSelect={(d) => d && handleRuleDateChange("start", formatDate(d))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-9 w-full justify-start gap-2 font-normal">
                      <CalendarIcon className="h-4 w-4" />
                      {ruleEndDate ? formatRuleDateDisplay(parseDateStr(ruleEndDate)) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={ruleEndDate ? parseDateStr(ruleEndDate) : undefined}
                      onSelect={(d) => d && handleRuleDateChange("end", formatDate(d))}
                      disabled={(date) => ruleStartDate ? date < parseDateStr(ruleStartDate) : false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {ruleDayCount > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  {ruleDayCount === 1
                    ? "Single-day rule: only the matching day is configured."
                    : ruleDayCount < 7
                    ? "All days in the selected range must be configured."
                    : "Select which days of the week this rule should apply to."}
                </p>
                <div className="grid grid-cols-[auto_100px_1fr_1fr_1fr_1fr] gap-2 text-xs font-medium text-muted-foreground border-b border-border pb-2">
                  <span></span>
                  <span>Day</span>
                  <span>Start</span>
                  <span>End</span>
                  <span>Slot (min)</span>
                  <span>Max Trucks</span>
                </div>
                {ruleDayConfigs.map((cfg, idx) => {
                  const inRange = daysInRuleRange.has(cfg.dayOfWeek)
                  const isLocked = ruleDayCount < 7 && inRange
                  return (
                    <div
                      key={cfg.dayOfWeek}
                      className={`grid grid-cols-[auto_100px_1fr_1fr_1fr_1fr] gap-2 items-center ${!inRange ? "opacity-40" : ""}`}
                    >
                      <Checkbox
                        checked={cfg.enabled}
                        disabled={!inRange || isLocked}
                        onCheckedChange={(checked) => updateRuleDayConfig(idx, "enabled", !!checked)}
                      />
                      <span className="text-sm font-medium text-foreground">{cfg.dayOfWeek.slice(0, 3)}</span>
                      <Input
                        type="time"
                        value={cfg.operatingStart}
                        onChange={(e) => updateRuleDayConfig(idx, "operatingStart", e.target.value)}
                        disabled={!cfg.enabled}
                        className="h-8 text-xs"
                      />
                      <Input
                        type="time"
                        value={cfg.operatingEnd}
                        onChange={(e) => updateRuleDayConfig(idx, "operatingEnd", e.target.value)}
                        disabled={!cfg.enabled}
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        min={15}
                        step={15}
                        value={cfg.slotDurationMin}
                        onChange={(e) => updateRuleDayConfig(idx, "slotDurationMin", Number(e.target.value))}
                        disabled={!cfg.enabled}
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={cfg.maxTrucksPerSlot}
                        onChange={(e) => updateRuleDayConfig(idx, "maxTrucksPerSlot", Number(e.target.value))}
                        disabled={!cfg.enabled}
                        className="h-8 text-xs"
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {ruleError && (
              <div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                <p className="text-xs text-[hsl(var(--destructive))]">{ruleError}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveRule}
              disabled={ruleSaving || !ruleLabel || !ruleStartDate || !ruleEndDate}
              className="gap-1.5"
            >
              {ruleSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
