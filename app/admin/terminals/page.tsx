"use client"

import { useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Container,
  CalendarDays,
  Loader2,
  AlertCircle,
  RefreshCw,
  Settings2,
  CalendarRange,
  X,
  Ban,
  Calendar as CalendarIcon,
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
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useApi } from "@/hooks/use-api"
import { terminalService, slotService } from "@/services"
import type {
  Terminal,
  TerminalType,
  AvailabilityResponse,
  AvailabilityDay,
  AvailabilitySlot,
} from "@/services/types"

// ── Helpers ──────────────────────────────────────────────────

function getTypeBadge(type: TerminalType) {
  const map: Record<TerminalType, { bg: string; text: string }> = {
    IMPORT: { bg: "bg-blue-500/10", text: "text-blue-500" },
    EXPORT: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
    REFRIGERATED: { bg: "bg-cyan-500/10", text: "text-cyan-500" },
    MIXED: { bg: "bg-violet-500/10", text: "text-violet-500" },
  }
  const s = map[type]
  return <Badge className={`border-0 ${s.bg} ${s.text}`}>{type}</Badge>
}

function getStatusBadge(isActive: boolean) {
  return isActive ? (
    <Badge className="border-0 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">Active</Badge>
  ) : (
    <Badge className="border-0 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]">Inactive</Badge>
  )
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

function toDateStr(date: Date) {
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
  return toDateStr(date) === toDateStr(new Date())
}

function isTomorrow(date: Date) {
  const tom = new Date()
  tom.setDate(tom.getDate() + 1)
  return toDateStr(date) === toDateStr(tom)
}

function formatSlotTime(t: string) {
  return t.slice(0, 5)
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

// ── Skeleton ─────────────────────────────────────────────────

function TerminalSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border bg-card animate-pulse">
          <CardHeader className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-3 w-60 rounded bg-muted" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

// ── Slot Panel (clickable slots with capacity adjustment) ────

function SlotPanel({ terminalId, date }: { terminalId: string; date: string }) {
  const { data: availability, loading, error, refetch } = useApi<AvailabilityResponse>(
    () => slotService.getAvailableSlots(terminalId, date),
    [terminalId, date],
  )

  // Slot capacity adjustment
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null)
  const [newCapacity, setNewCapacity] = useState(0)
  const [adjustSaving, setAdjustSaving] = useState(false)
  const [adjustError, setAdjustError] = useState("")

  const handleSlotClick = (slot: AvailabilitySlot) => {
    setEditingSlot(slot)
    setNewCapacity(slot.maxCapacity)
    setAdjustError("")
  }

  const handleAdjustCapacity = async () => {
    if (!editingSlot) return
    setAdjustSaving(true)
    setAdjustError("")
    try {
      // Determine day of week from the date
      const [y, m, d] = date.split("-").map(Number)
      const dayOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][
        new Date(y, m - 1, d).getDay()
      ]

      // Calculate slot duration from the slot times
      const [sh, sm] = editingSlot.startTime.split(":").map(Number)
      const [eh, em] = editingSlot.endTime.split(":").map(Number)
      const slotDurationMin = (eh * 60 + em) - (sh * 60 + sm)
      const safeDuration = slotDurationMin > 0 ? slotDurationMin : 60

      // Get operating hours from availability data
      const dayInfo = availability?.availability?.[0]
      const operatingStart = dayInfo?.operatingHours?.start?.slice(0, 5) ?? "08:00"
      const operatingEnd = dayInfo?.operatingHours?.end?.slice(0, 5) ?? "18:00"

      // Create a time-window override so only this specific slot is affected
      await terminalService.createCapacityOverride(terminalId, {
        label: `Slot adj. ${formatSlotTime(editingSlot.startTime)}–${formatSlotTime(editingSlot.endTime)} on ${date}`,
        startDate: date,
        endDate: date,
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
      setEditingSlot(null)
      refetch()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed to adjust capacity"
      setAdjustError(msg)
    } finally {
      setAdjustSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading slots…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    )
  }

  const dayData: AvailabilityDay | undefined = availability?.availability?.[0]

  if (!dayData) {
    return (
      <div className="rounded-lg border border-dashed border-border py-10 text-center">
        <p className="text-sm text-muted-foreground">No capacity configured for this date.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ensure a capacity configuration exists for this day of the week.
        </p>
      </div>
    )
  }

  if (dayData.isClosed) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 py-10 text-center">
        <Ban className="h-6 w-6 text-[hsl(var(--destructive))]" />
        <p className="text-sm font-medium text-[hsl(var(--destructive))]">Terminal Closed</p>
        {dayData.closedReason && (
          <p className="text-xs text-muted-foreground">{dayData.closedReason}</p>
        )}
      </div>
    )
  }

  const slotList = dayData.slots ?? []
  const totalBooked = slotList.reduce((s, sl) => s + sl.bookedCount, 0)
  const totalCapacity = slotList.reduce((s, sl) => s + sl.maxCapacity, 0)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Time Slots — {slotList.length} slot{slotList.length !== 1 && "s"}
          </p>
          {dayData.operatingHours && (
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

      {slotList.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">No slots for this date.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {slotList.map((slot, idx) => {
              const util = getUtilization(slot.bookedCount, slot.maxCapacity)
              const isSelected = editingSlot?.startTime === slot.startTime && editingSlot?.endTime === slot.endTime
              return (
                <div
                  key={`${slot.startTime}-${idx}`}
                  className={`cursor-pointer rounded-lg border p-3 transition-all hover:bg-muted/60 hover:shadow-sm ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border bg-muted/30"
                  }`}
                  onClick={() => handleSlotClick(slot)}
                >
                  <p className="text-xs font-semibold text-foreground">
                    {formatSlotTime(slot.startTime)} – {formatSlotTime(slot.endTime)}
                  </p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-lg font-bold leading-none text-foreground">{slot.bookedCount}</span>
                    <span className="text-xs text-muted-foreground">/ {slot.maxCapacity}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full transition-all ${getUtilColor(util)}`}
                      style={{ width: `${Math.min(util, 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{util}% full</span>
                    {!slot.isAvailable && (
                      <Badge variant="outline" className="h-4 px-1 text-[9px]">Full</Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Inline slot capacity editor */}
          {editingSlot && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">
                  Adjust capacity for <span className="font-semibold">{date}</span>
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
                <p className="text-xs text-destructive">{adjustError}</p>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Total Booked</p>
                <p className="font-heading text-base font-bold text-foreground">{totalBooked} trucks</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Capacity</p>
                <p className="font-heading text-base font-bold text-foreground">{totalCapacity} trucks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
                <span className="text-[10px] text-muted-foreground">{"< 40%"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[hsl(185,60%,42%)]" />
                <span className="text-[10px] text-muted-foreground">40-70%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--warning))]" />
                <span className="text-[10px] text-muted-foreground">70-90%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--destructive))]" />
                <span className="text-[10px] text-muted-foreground">{">= 90%"}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminTerminalsPage() {
  const { data: terminals, loading, error, refetch } = useApi<Terminal[]>(
    () => terminalService.getTerminals(),
    [],
  )

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [expandedTerminal, setExpandedTerminal] = useState<string | null>(null)

  // Add / Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTerminal, setEditingTerminal] = useState<Terminal | null>(null)
  const [formName, setFormName] = useState("")
  const [formCode, setFormCode] = useState("")
  const [formType, setFormType] = useState<TerminalType>("MIXED")
  const [formDescription, setFormDescription] = useState("")
  const [formIsActive, setFormIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  // Capacity config form state for create dialog
  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const
  const defaultCapConfig = () => DAYS.map((day) => ({
    dayOfWeek: day,
    operatingStart: "08:00",
    operatingEnd: "18:00",
    slotDurationMin: 60,
    maxTrucksPerSlot: 10,
  }))
  const [capacityConfigs, setCapacityConfigs] = useState(defaultCapConfig())

  const updateCapConfig = (index: number, field: string, value: string | number) => {
    setCapacityConfigs((prev) => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Terminal | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // Default capacity config edit dialog
  const [capEditOpen, setCapEditOpen] = useState(false)
  const [capEditTerminal, setCapEditTerminal] = useState<Terminal | null>(null)
  const [capEditConfigs, setCapEditConfigs] = useState(defaultCapConfig())
  const [capEditLoading, setCapEditLoading] = useState(false)
  const [capEditSaving, setCapEditSaving] = useState(false)

  // Add Capacity Rule dialog (simplified override creation)
  const [ruleOpen, setRuleOpen] = useState(false)
  const [ruleTerminal, setRuleTerminal] = useState<Terminal | null>(null)
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

  const dateKey = toDateStr(selectedDate)

  // ── Dialog helpers ───────────────────────────────────────

  const openAddDialog = () => {
    setEditingTerminal(null)
    setFormName("")
    setFormCode("")
    setFormType("MIXED")
    setFormDescription("")
    setFormIsActive(true)
    setCapacityConfigs(defaultCapConfig())
    setSaveError("")
    setDialogOpen(true)
  }

  const openEditDialog = (t: Terminal) => {
    setEditingTerminal(t)
    setFormName(t.name)
    setFormCode(t.code)
    setFormType(t.type)
    setFormDescription(t.description ?? "")
    setFormIsActive(t.isActive)
    setSaveError("")
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    try {
      if (editingTerminal) {
        await terminalService.updateTerminal(editingTerminal.id, {
          name: formName,
          code: formCode,
          type: formType,
          description: formDescription || undefined,
          isActive: formIsActive,
        })
      } else {
        await terminalService.createTerminal({
          name: formName,
          code: formCode,
          type: formType,
          description: formDescription || undefined,
          capacityConfigs,
        })
      }
      setDialogOpen(false)
      refetch()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed to save terminal"
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError("")
    try {
      await terminalService.deleteTerminal(deleteTarget.id)
      setDeleteTarget(null)
      if (expandedTerminal === deleteTarget.id) setExpandedTerminal(null)
      refetch()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed to delete terminal"
      setDeleteError(msg)
    } finally {
      setDeleting(false)
    }
  }

  // ── Default capacity config editor ─────────────────────

  const openCapEditor = async (t: Terminal) => {
    setCapEditTerminal(t)
    setCapEditLoading(true)
    setCapEditOpen(true)
    try {
      const configs = await terminalService.getCapacityConfig(t.id)
      const mapped = DAYS.map((day) => {
        const existing = configs.find((c: any) => c.dayOfWeek === day)
        return existing
          ? { dayOfWeek: day as typeof DAYS[number], operatingStart: existing.operatingStart, operatingEnd: existing.operatingEnd, slotDurationMin: existing.slotDurationMin, maxTrucksPerSlot: existing.maxTrucksPerSlot }
          : { dayOfWeek: day as typeof DAYS[number], operatingStart: "08:00", operatingEnd: "18:00", slotDurationMin: 60, maxTrucksPerSlot: 10 }
      })
      setCapEditConfigs(mapped)
    } catch {
      setCapEditConfigs(defaultCapConfig())
    } finally {
      setCapEditLoading(false)
    }
  }

  const handleCapEditSave = async () => {
    if (!capEditTerminal) return
    setCapEditSaving(true)
    try {
      await terminalService.upsertCapacityConfig(capEditTerminal.id, capEditConfigs)
      setCapEditOpen(false)
      refetch()
    } catch {
      // errors surfaced via toast
    } finally {
      setCapEditSaving(false)
    }
  }

  const updateCapEditConfig = (index: number, field: string, value: string | number) => {
    setCapEditConfigs((prev) => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  // ── Add Capacity Rule (override) ──────────────────────

  const openRuleDialog = (t: Terminal) => {
    const today = toDateStr(new Date())
    const todayDow = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][new Date().getDay()]
    setRuleTerminal(t)
    setRuleLabel("")
    setRuleStartDate(today)
    setRuleEndDate(today)
    // Single-day: only enable the matching day of week
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
        // For < 7 days (including single-day), all days in range are required
        if (dayCount < 7) return { ...dc, enabled: true }
        // For >= 7 days, preserve current selection for days in range
        return dc
      }),
    )
  }

  const handleSaveRule = async () => {
    if (!ruleTerminal || !ruleLabel || !ruleStartDate || !ruleEndDate) return
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

    // Single day: exactly 1 day config matching the date's day of week
    if (dayCount === 1) {
      const expectedDay = [...daysInRange][0]
      if (enabledDays.length !== 1 || enabledDays[0].dayOfWeek !== expectedDay) {
        setRuleError(`Single-day rule must configure only ${expectedDay}.`)
        return
      }
    }

    // Multi-day < 7: must configure ALL days in range
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
      await terminalService.createCapacityOverride(ruleTerminal.id, {
        label: ruleLabel,
        startDate: ruleStartDate,
        endDate: ruleEndDate,
        dayConfigs: enabledDays.map(({ enabled, ...rest }) => rest),
      })
      setRuleOpen(false)
      refetch()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed to create rule"
      setRuleError(msg)
    } finally {
      setRuleSaving(false)
    }
  }

  const updateRuleDayConfig = (
    index: number,
    field: string,
    value: string | number | boolean,
  ) => {
    setRuleDayConfigs((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    )
  }

  // ── Date navigation ──────────────────────────────────────

  const goToPrevDay = () =>
    setSelectedDate((p) => {
      const d = new Date(p)
      d.setDate(d.getDate() - 1)
      return d
    })

  const goToNextDay = () =>
    setSelectedDate((p) => {
      const d = new Date(p)
      d.setDate(d.getDate() + 1)
      return d
    })

  const goToToday = () => setSelectedDate(new Date())

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Terminal Configuration</h1>
          <p className="text-sm text-muted-foreground">Manage terminals and view time slot capacity</p>
        </div>
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Terminal
        </Button>
      </div>

      {/* Date Selector */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Viewing capacity for</p>
              <p className="font-heading text-sm font-semibold text-foreground">
                {formatDateDisplay(selectedDate)}
                {isToday(selectedDate) && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-[hsl(var(--success))]/10 px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--success))]">
                    Today
                  </span>
                )}
                {isTomorrow(selectedDate) && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-[hsl(210,65%,45%)]/10 px-2 py-0.5 text-[10px] font-medium text-[hsl(210,65%,45%)]">
                    Tomorrow
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPrevDay} aria-label="Previous day">
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
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextDay} aria-label="Next day">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && <TerminalSkeleton />}

      {/* Error state */}
      {error && !loading && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && terminals && terminals.length === 0 && (
        <Card className="border-dashed border-border bg-card">
          <CardContent className="flex flex-col items-center gap-3 py-14">
            <Container className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No terminals configured yet.</p>
            <Button size="sm" className="gap-1.5" onClick={openAddDialog}>
              <Plus className="h-3.5 w-3.5" /> Add Terminal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Terminal Cards */}
      {!loading && !error && terminals && terminals.length > 0 && (
        <div className="flex flex-col gap-4">
          {terminals.map((terminal) => {
            const isExpanded = expandedTerminal === terminal.id
            return (
              <Card key={terminal.id} className="border-border bg-card">
                <CardHeader
                  className="cursor-pointer p-5"
                  onClick={() => setExpandedTerminal(isExpanded ? null : terminal.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Container className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <CardTitle className="font-heading text-base font-semibold text-foreground">
                            {terminal.name}
                          </CardTitle>
                          {getStatusBadge(terminal.isActive)}
                          {getTypeBadge(terminal.type)}
                        </div>
                        <CardDescription className="mt-0.5 flex items-center gap-4">
                          <span className="font-mono text-xs">{terminal.code}</span>
                          {terminal.description && <span className="text-xs">{terminal.description}</span>}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          openRuleDialog(terminal)
                        }}
                        aria-label="Add capacity rule"
                        title="Add Capacity Rule"
                      >
                        <CalendarRange className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          openCapEditor(terminal)
                        }}
                        aria-label="Default capacity config"
                        title="Default Capacity Config"
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(terminal)
                        }}
                        aria-label="Edit terminal"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(terminal)
                          setDeleteError("")
                        }}
                        aria-label="Delete terminal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t border-border px-5 pb-5 pt-4">
                    <SlotPanel terminalId={terminal.id} date={dateKey} />
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Add / Edit Terminal Dialog ────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {editingTerminal ? "Edit Terminal" : "Add New Terminal"}
            </DialogTitle>
            <DialogDescription>
              {editingTerminal ? "Update terminal details." : "Configure a new terminal with capacity settings for each day of the week."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="termName">Terminal Name</Label>
                <Input
                  id="termName"
                  placeholder="e.g. Terminal A"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-9"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="termCode">Code</Label>
                <Input
                  id="termCode"
                  placeholder="e.g. TERM-A"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="h-9"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Type</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as TerminalType)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMPORT">Import</SelectItem>
                    <SelectItem value="EXPORT">Export</SelectItem>
                    <SelectItem value="REFRIGERATED">Refrigerated</SelectItem>
                    <SelectItem value="MIXED">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingTerminal && (
                <div className="flex flex-col gap-2">
                  <Label>Status</Label>
                  <Select
                    value={formIsActive ? "active" : "inactive"}
                    onValueChange={(v) => setFormIsActive(v === "active")}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="col-span-2 flex flex-col gap-2">
                <Label htmlFor="termDesc">Description (optional)</Label>
                <Input
                  id="termDesc"
                  placeholder="Brief description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {!editingTerminal && (
              <div className="border-t border-border pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Capacity Configuration (all 7 days required)
                </p>
                <div className="space-y-2">
                  <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                    <span>Day</span>
                    <span>Start</span>
                    <span>End</span>
                    <span>Slot (min)</span>
                    <span>Max Trucks</span>
                  </div>
                  {capacityConfigs.map((cfg, idx) => (
                    <div key={cfg.dayOfWeek} className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-2 items-center">
                      <span className="text-xs font-medium text-foreground">{cfg.dayOfWeek.slice(0, 3)}</span>
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
                        max={240}
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
              </div>
            )}

            {saveError && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{saveError}</p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !formName || !formCode} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingTerminal ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={() => { setDeleteTarget(null); setDeleteError("") }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Delete Terminal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.code})? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{deleteError}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteTarget(null); setDeleteError("") }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Default Capacity Config Edit Dialog ───────────── */}
      <Dialog open={capEditOpen} onOpenChange={setCapEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              Default Capacity — {capEditTerminal?.name}
            </DialogTitle>
            <DialogDescription>
              Update the default operating hours and slot configuration for each day of the week.
              These are the base settings used when no capacity rule applies.
            </DialogDescription>
          </DialogHeader>
          {capEditLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading config…</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                  <span>Day</span>
                  <span>Start</span>
                  <span>End</span>
                  <span>Slot (min)</span>
                  <span>Max Trucks</span>
                </div>
                {capEditConfigs.map((cfg, idx) => (
                  <div key={cfg.dayOfWeek} className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-2 items-center">
                    <span className="text-xs font-medium text-foreground">{cfg.dayOfWeek.slice(0, 3)}</span>
                    <Input
                      type="time"
                      value={cfg.operatingStart}
                      onChange={(e) => updateCapEditConfig(idx, "operatingStart", e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="time"
                      value={cfg.operatingEnd}
                      onChange={(e) => updateCapEditConfig(idx, "operatingEnd", e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      min={15}
                      max={240}
                      value={cfg.slotDurationMin}
                      onChange={(e) => updateCapEditConfig(idx, "slotDurationMin", Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={cfg.maxTrucksPerSlot}
                      onChange={(e) => updateCapEditConfig(idx, "maxTrucksPerSlot", Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCapEditOpen(false)}>Cancel</Button>
                <Button onClick={handleCapEditSave} disabled={capEditSaving} className="gap-2">
                  {capEditSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Add Capacity Rule Dialog ──────────────────────── */}
      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              Add Capacity Rule — {ruleTerminal?.name}
            </DialogTitle>
            <DialogDescription>
              Create a capacity override for a date range. For single-day rules, only the matching
              day of the week is configured. For periods under 7 days, all days in the range must
              be configured. For 7+ days, you may select any subset.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Rule Label</Label>
                <Input
                  placeholder="e.g. Holiday Season"
                  className="h-8 text-xs"
                  value={ruleLabel}
                  onChange={(e) => setRuleLabel(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 w-full justify-start gap-2 text-xs font-normal">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {ruleStartDate ? formatRuleDateDisplay(parseDateStr(ruleStartDate)) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={ruleStartDate ? parseDateStr(ruleStartDate) : undefined}
                      onSelect={(d) => d && handleRuleDateChange("start", toDateStr(d))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 w-full justify-start gap-2 text-xs font-normal">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {ruleEndDate ? formatRuleDateDisplay(parseDateStr(ruleEndDate)) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={ruleEndDate ? parseDateStr(ruleEndDate) : undefined}
                      onSelect={(d) => d && handleRuleDateChange("end", toDateStr(d))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {(() => {
              const dayCount = ruleStartDate && ruleEndDate && ruleEndDate >= ruleStartDate
                ? getDayCount(ruleStartDate, ruleEndDate)
                : 0
              return (
                <p className="text-xs font-medium text-muted-foreground">
                  {dayCount === 1
                    ? "Single-day rule — only the matching day of the week is configured automatically."
                    : dayCount > 0 && dayCount < 7
                      ? "All days in this range must be configured (locked). You cannot uncheck them."
                      : dayCount >= 7
                        ? "You may select any subset of the days in this range."
                        : "Set valid start and end dates to configure days."}
                </p>
              )
            })()}

            <div className="space-y-2">
              <div className="grid grid-cols-[24px_90px_1fr_1fr_1fr_1fr] gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                <span />
                <span>Day</span>
                <span>Start</span>
                <span>End</span>
                <span>Slot (min)</span>
                <span>Max Trucks</span>
              </div>
              {ruleDayConfigs.map((cfg, idx) => {
                const daysInRange = ruleStartDate && ruleEndDate && ruleEndDate >= ruleStartDate
                  ? getDaysInRange(ruleStartDate, ruleEndDate)
                  : new Set<string>()
                const dayCount = ruleStartDate && ruleEndDate && ruleEndDate >= ruleStartDate
                  ? getDayCount(ruleStartDate, ruleEndDate)
                  : 0
                const inRange = daysInRange.has(cfg.dayOfWeek)
                const locked = inRange && dayCount > 0 && dayCount < 7
                return (
                <div
                  key={cfg.dayOfWeek}
                  className={`grid grid-cols-[24px_90px_1fr_1fr_1fr_1fr] gap-2 items-center ${!cfg.enabled ? "opacity-40" : ""}`}
                >
                  <Checkbox
                    checked={cfg.enabled}
                    disabled={!inRange || locked}
                    onCheckedChange={(checked) => updateRuleDayConfig(idx, "enabled", !!checked)}
                  />
                  <span className="text-xs font-medium text-foreground">{cfg.dayOfWeek.slice(0, 3)}</span>
                  <Input
                    type="time"
                    value={cfg.operatingStart}
                    onChange={(e) => updateRuleDayConfig(idx, "operatingStart", e.target.value)}
                    className="h-8 text-xs"
                    disabled={!cfg.enabled}
                  />
                  <Input
                    type="time"
                    value={cfg.operatingEnd}
                    onChange={(e) => updateRuleDayConfig(idx, "operatingEnd", e.target.value)}
                    className="h-8 text-xs"
                    disabled={!cfg.enabled}
                  />
                  <Input
                    type="number"
                    min={15}
                    max={240}
                    value={cfg.slotDurationMin}
                    onChange={(e) => updateRuleDayConfig(idx, "slotDurationMin", Number(e.target.value))}
                    className="h-8 text-xs"
                    disabled={!cfg.enabled}
                  />
                  <Input
                    type="number"
                    min={1}
                    value={cfg.maxTrucksPerSlot}
                    onChange={(e) => updateRuleDayConfig(idx, "maxTrucksPerSlot", Number(e.target.value))}
                    className="h-8 text-xs"
                    disabled={!cfg.enabled}
                  />
                </div>
              )})}
            </div>

            {ruleError && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{ruleError}</p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setRuleOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveRule}
                disabled={ruleSaving || !ruleLabel || !ruleStartDate || !ruleEndDate}
                className="gap-2"
              >
                {ruleSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Rule
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
