"use client"

import { useState, useMemo } from "react"
import {
  Settings,
  MapPin,
  Clock,
  Save,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Container,
  CalendarDays,
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

interface HourlySlot {
  hour: string
  maxTrucks: number
  bookedTrucks: number
}

interface Terminal {
  id: string
  name: string
  location: string
  status: "operational" | "maintenance" | "closed"
  operatingHours: string
  defaultCapacity: number
  hourlySlots: HourlySlot[]
}

const initialTerminals: Terminal[] = [
  {
    id: "T-A",
    name: "Terminal A",
    location: "North Quay",
    status: "operational",
    operatingHours: "06:00 - 22:00",
    defaultCapacity: 20,
    hourlySlots: [
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
    ],
  },
  {
    id: "T-B",
    name: "Terminal B",
    location: "South Quay",
    status: "operational",
    operatingHours: "06:00 - 20:00",
    defaultCapacity: 20,
    hourlySlots: [
      { hour: "06:00", maxTrucks: 15, bookedTrucks: 8 },
      { hour: "07:00", maxTrucks: 20, bookedTrucks: 14 },
      { hour: "08:00", maxTrucks: 20, bookedTrucks: 12 },
      { hour: "09:00", maxTrucks: 20, bookedTrucks: 16 },
      { hour: "10:00", maxTrucks: 20, bookedTrucks: 10 },
      { hour: "11:00", maxTrucks: 18, bookedTrucks: 9 },
      { hour: "12:00", maxTrucks: 12, bookedTrucks: 5 },
      { hour: "13:00", maxTrucks: 12, bookedTrucks: 4 },
      { hour: "14:00", maxTrucks: 20, bookedTrucks: 18 },
      { hour: "15:00", maxTrucks: 20, bookedTrucks: 11 },
      { hour: "16:00", maxTrucks: 18, bookedTrucks: 13 },
      { hour: "17:00", maxTrucks: 15, bookedTrucks: 8 },
      { hour: "18:00", maxTrucks: 10, bookedTrucks: 3 },
      { hour: "19:00", maxTrucks: 8, bookedTrucks: 2 },
    ],
  },
  {
    id: "T-C",
    name: "Terminal C",
    location: "East Berth",
    status: "maintenance",
    operatingHours: "07:00 - 19:00",
    defaultCapacity: 15,
    hourlySlots: [
      { hour: "07:00", maxTrucks: 15, bookedTrucks: 5 },
      { hour: "08:00", maxTrucks: 15, bookedTrucks: 8 },
      { hour: "09:00", maxTrucks: 15, bookedTrucks: 6 },
      { hour: "10:00", maxTrucks: 15, bookedTrucks: 10 },
      { hour: "11:00", maxTrucks: 12, bookedTrucks: 7 },
      { hour: "12:00", maxTrucks: 10, bookedTrucks: 3 },
      { hour: "13:00", maxTrucks: 10, bookedTrucks: 4 },
      { hour: "14:00", maxTrucks: 15, bookedTrucks: 9 },
      { hour: "15:00", maxTrucks: 15, bookedTrucks: 6 },
      { hour: "16:00", maxTrucks: 12, bookedTrucks: 5 },
      { hour: "17:00", maxTrucks: 10, bookedTrucks: 3 },
      { hour: "18:00", maxTrucks: 8, bookedTrucks: 1 },
    ],
  },
  {
    id: "T-D",
    name: "Terminal D",
    location: "West Dock",
    status: "operational",
    operatingHours: "06:00 - 22:00",
    defaultCapacity: 25,
    hourlySlots: [
      { hour: "06:00", maxTrucks: 20, bookedTrucks: 15 },
      { hour: "07:00", maxTrucks: 25, bookedTrucks: 22 },
      { hour: "08:00", maxTrucks: 25, bookedTrucks: 24 },
      { hour: "09:00", maxTrucks: 25, bookedTrucks: 20 },
      { hour: "10:00", maxTrucks: 25, bookedTrucks: 18 },
      { hour: "11:00", maxTrucks: 20, bookedTrucks: 14 },
      { hour: "12:00", maxTrucks: 15, bookedTrucks: 10 },
      { hour: "13:00", maxTrucks: 15, bookedTrucks: 8 },
      { hour: "14:00", maxTrucks: 25, bookedTrucks: 21 },
      { hour: "15:00", maxTrucks: 25, bookedTrucks: 19 },
      { hour: "16:00", maxTrucks: 20, bookedTrucks: 17 },
      { hour: "17:00", maxTrucks: 18, bookedTrucks: 12 },
      { hour: "18:00", maxTrucks: 15, bookedTrucks: 9 },
      { hour: "19:00", maxTrucks: 12, bookedTrucks: 5 },
      { hour: "20:00", maxTrucks: 10, bookedTrucks: 3 },
      { hour: "21:00", maxTrucks: 8, bookedTrucks: 1 },
    ],
  },
]

function getTerminalStatusBadge(status: Terminal["status"]) {
  const map = {
    operational: { bg: "bg-[hsl(var(--success))]/10", text: "text-[hsl(var(--success))]", label: "Operational" },
    maintenance: { bg: "bg-[hsl(var(--warning))]/10", text: "text-[hsl(var(--warning))]", label: "Maintenance" },
    closed: { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]", label: "Closed" },
  }
  const s = map[status]
  return <Badge className={`border-0 ${s.bg} ${s.text}`}>{s.label}</Badge>
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

function isTomorrow(date: Date) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDate(date) === formatDate(tomorrow)
}

function getDateLabel(date: Date) {
  if (isToday(date)) return "Today"
  if (isTomorrow(date)) return "Tomorrow"
  return formatDateDisplay(date)
}

/** Simulate different booked numbers per date using a simple seed */
function seededBookings(base: number, max: number, dateSeed: number) {
  const booked = Math.round(base * (0.4 + 0.6 * ((Math.sin(dateSeed * base + max) + 1) / 2)))
  return Math.min(booked, max)
}

function getTerminalsForDate(date: Date): Terminal[] {
  const seed = date.getDate() + date.getMonth() * 31 + date.getFullYear()
  return initialTerminals.map((t) => ({
    ...t,
    hourlySlots: t.hourlySlots.map((slot) => ({
      ...slot,
      bookedTrucks: seededBookings(slot.bookedTrucks, slot.maxTrucks, seed + slot.hour.charCodeAt(0)),
    })),
  }))
}

export default function AdminTerminalsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [capacityOverrides, setCapacityOverrides] = useState<Record<string, Record<string, number>>>({})
  const [expandedTerminal, setExpandedTerminal] = useState<string | null>("T-A")
  const [editingSlot, setEditingSlot] = useState<{ terminalId: string; hourIndex: number } | null>(null)
  const [editCapacity, setEditCapacity] = useState("")
  const [addTerminalOpen, setAddTerminalOpen] = useState(false)

  const dateKey = formatDate(selectedDate)

  const terminals = useMemo(() => {
    const base = getTerminalsForDate(selectedDate)
    const overrides = capacityOverrides[dateKey]
    if (!overrides) return base
    return base.map((t) => ({
      ...t,
      hourlySlots: t.hourlySlots.map((slot) => {
        const key = `${t.id}-${slot.hour}`
        return overrides[key] !== undefined ? { ...slot, maxTrucks: overrides[key] } : slot
      }),
    }))
  }, [selectedDate, dateKey, capacityOverrides])

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

    const terminal = terminals.find((t) => t.id === editingSlot.terminalId)
    if (!terminal) return
    const slot = terminal.hourlySlots[editingSlot.hourIndex]
    if (!slot) return

    const overrideKey = `${editingSlot.terminalId}-${slot.hour}`
    setCapacityOverrides((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [overrideKey]: newCap,
      },
    }))
    setEditingSlot(null)
    setEditCapacity("")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Terminal Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Manage terminals and configure hourly truck capacity
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddTerminalOpen(true)}>
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
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextDay} aria-label="Next day">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Terminal Cards */}
      <div className="flex flex-col gap-4">
        {terminals.map((terminal) => {
          const isExpanded = expandedTerminal === terminal.id
          const totalBooked = terminal.hourlySlots.reduce((sum, s) => sum + s.bookedTrucks, 0)
          const totalCapacity = terminal.hourlySlots.reduce((sum, s) => sum + s.maxTrucks, 0)
          const overallUtil = getUtilization(totalBooked, totalCapacity)

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
                        {getTerminalStatusBadge(terminal.status)}
                      </div>
                      <CardDescription className="mt-0.5 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {terminal.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {terminal.operatingHours}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-semibold text-foreground">{overallUtil}%</p>
                      <p className="text-xs text-muted-foreground">Avg Utilization</p>
                    </div>
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
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Hourly Capacity Schedule
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Default: {terminal.defaultCapacity} trucks/hour
                    </p>
                  </div>

                  {/* Hourly slots grid */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                    {terminal.hourlySlots.map((slot, idx) => {
                      const util = getUtilization(slot.bookedTrucks, slot.maxTrucks)
                      return (
                        <div
                          key={slot.hour}
                          className="group relative rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-foreground">{slot.hour}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingSlot({ terminalId: terminal.id, hourIndex: idx })
                                setEditCapacity(String(slot.maxTrucks))
                              }}
                              className="rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                              aria-label={`Edit capacity for ${slot.hour}`}
                            >
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-end gap-1">
                            <span className="text-lg font-bold leading-none text-foreground">{slot.bookedTrucks}</span>
                            <span className="text-xs text-muted-foreground">/ {slot.maxTrucks}</span>
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className={`h-full rounded-full transition-all ${getUtilColor(util)}`}
                              style={{ width: `${Math.min(util, 100)}%` }}
                            />
                          </div>
                          <p className="mt-1 text-[10px] text-muted-foreground">{util}% full</p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Summary row */}
                  <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Booked ({getDateLabel(selectedDate)})</p>
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
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Edit Slot Dialog */}
      <Dialog open={!!editingSlot} onOpenChange={() => setEditingSlot(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Edit Hourly Capacity</DialogTitle>
            <DialogDescription>
              {editingSlot && (
                <>
                  {terminals.find((t) => t.id === editingSlot.terminalId)?.name} at{" "}
                  {terminals.find((t) => t.id === editingSlot.terminalId)?.hourlySlots[editingSlot.hourIndex]?.hour}
                  {" "}on {formatDateDisplay(selectedDate)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="maxTrucks">Max Trucks per Hour</Label>
              <Input
                id="maxTrucks"
                type="number"
                min="0"
                max="100"
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSlot(null)}>Cancel</Button>
            <Button onClick={handleSaveSlot} className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Terminal Dialog */}
      <Dialog open={addTerminalOpen} onOpenChange={setAddTerminalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Add New Terminal</DialogTitle>
            <DialogDescription>Configure a new terminal and assign an operator account</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setAddTerminalOpen(false) }}>
            {/* Terminal Details */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Terminal Configuration
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="termName">Terminal Name</Label>
                  <Input id="termName" placeholder="e.g. Terminal E" className="h-9" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="termLoc">Location</Label>
                  <Input id="termLoc" placeholder="e.g. North Extension" className="h-9" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="termHours">Operating Hours</Label>
                  <Input id="termHours" placeholder="06:00 - 22:00" className="h-9" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="termCap">Default Capacity (trucks/hour)</Label>
                  <Input id="termCap" type="number" placeholder="20" className="h-9" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Status</Label>
                  <Select defaultValue="operational">
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Operator Account */}
            <div className="border-t border-border pt-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(185,60%,42%)]/10">
                  <Settings className="h-3.5 w-3.5 text-[hsl(185,60%,42%)]" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Operator Account
                </p>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                An operator account will be created and linked to this terminal. The operator will manage bookings and capacity for this terminal.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-2">
                  <Label htmlFor="opFullName">Operator Full Name</Label>
                  <Input id="opFullName" placeholder="e.g. Karim Benslimane" className="h-9" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="opEmail">Operator Email</Label>
                  <Input id="opEmail" type="email" placeholder="k.benslimane@apcs.dz" className="h-9" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="opPhone">Operator Phone</Label>
                  <Input id="opPhone" placeholder="+213..." className="h-9" />
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-[hsl(185,60%,42%)]/5 px-3 py-2">
                <Settings className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(185,60%,42%)]" />
                <p className="text-xs text-foreground">
                  A temporary password will be generated and shown after creation. The operator will be required to change it on first login.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddTerminalOpen(false)}>Cancel</Button>
              <Button type="submit">Create Terminal & Operator</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
