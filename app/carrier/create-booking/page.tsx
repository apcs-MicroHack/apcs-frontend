"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import {
  Calendar as CalendarIcon,
  Container,
  Truck,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Ship,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { StepProgress } from "@/components/ui/step-progress"
import { PageTransition } from "@/components/ui/page-transition"
import { useApi } from "@/hooks/use-api"
import { terminalService, slotService, truckService, bookingService } from "@/services"
import type { Terminal, AvailabilitySlot, Truck as TruckType } from "@/services/types"

export default function CreateBookingPage() {
  const { data: terminals, loading: loadingTerminals } = useApi<Terminal[]>(
    () => terminalService.getTerminals(),
    [],
  )
  const { data: trucks, loading: loadingTrucks } = useApi<TruckType[]>(
    () => truckService.getTrucks({ isActive: true }),
    [],
  )

  const [terminalId, setTerminalId] = useState("")
  const [date, setDate] = useState(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  })

  function formatDateStr(dt: Date) {
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, "0")
    const dd = String(dt.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  function parseDateStr(str: string): Date {
    const [y, m, d] = str.split("-").map(Number)
    return new Date(y, m - 1, d)
  }

  function formatDateDisplay(dt: Date) {
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }
  const [slotId, setSlotId] = useState("")
  const [cargoType, setCargoType] = useState("")
  const [truckId, setTruckId] = useState("")
  const [containerNumber, setContainerNumber] = useState("")
  const [isHazardous, setIsHazardous] = useState(false)
  const [specialRequirements, setSpecialRequirements] = useState("")
  const searchParams = useSearchParams()
  
  // Track prefilled slot to apply after slots load
  const prefillSlotRef = useRef<string | null>(null)

  // Pre-fill from query params (from chat AI)
  useEffect(() => {
    const prefillTerminalId = searchParams.get("terminalId")
    const prefillTerminalName = searchParams.get("terminal")
    const prefillDate = searchParams.get("date")
    const prefillCargoType = searchParams.get("cargoType")
    const prefillContainer = searchParams.get("containerNumber")
    const prefillHazardous = searchParams.get("isHazardous")
    const prefillRequirements = searchParams.get("specialRequirements")
    const prefillSlot = searchParams.get("startTime")

    // Store prefill slot for later
    if (prefillSlot) prefillSlotRef.current = prefillSlot

    // Match terminal by ID or by name
    if (prefillTerminalId) {
      setTerminalId(prefillTerminalId)
    } else if (prefillTerminalName && terminals && terminals.length > 0) {
      const match = terminals.find(
        (t) => t.name.toLowerCase() === prefillTerminalName.toLowerCase() ||
               t.code?.toLowerCase() === prefillTerminalName.toLowerCase()
      )
      if (match) setTerminalId(match.id)
    }
    if (prefillDate) setDate(prefillDate)
    if (prefillCargoType) setCargoType(prefillCargoType)
    if (prefillContainer) setContainerNumber(prefillContainer)
    if (prefillHazardous === "true") setIsHazardous(true)
    if (prefillRequirements) setSpecialRequirements(prefillRequirements)
  }, [searchParams, terminals])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bookingRef, setBookingRef] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch available slots when terminal + date selected
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    if (!terminalId || !date) {
      setAvailableSlots([])
      setSlotId("")
      return
    }
    let cancelled = false
    setLoadingSlots(true)
    slotService.getAvailableSlots(terminalId, date, date).then((resp) => {
      if (!cancelled) {
        // Extract slots from the first (only) day in the availability response
        const dayData = resp?.availability?.[0]
        const slots: AvailabilitySlot[] =
          dayData && !dayData.isClosed ? (dayData.slots ?? []) : []
        setAvailableSlots(slots)
        
        // Apply prefilled slot if it exists and is available
        if (prefillSlotRef.current) {
          const matchingSlot = slots.find(s => s.startTime === prefillSlotRef.current)
          if (matchingSlot) {
            setSlotId(prefillSlotRef.current)
          }
          prefillSlotRef.current = null // Clear after applying
        } else {
          setSlotId("")
        }
      }
    }).catch(() => {
      if (!cancelled) setAvailableSlots([])
    }).finally(() => {
      if (!cancelled) setLoadingSlots(false)
    })
    return () => { cancelled = true }
  }, [terminalId, date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!terminalId || !slotId || !truckId || !cargoType) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      // slotId is the startTime (e.g. "08:00") - backend expects date + startTime
      const booking = await bookingService.createBooking({
        terminalId,
        date,
        startTime: slotId,
        truckId,
        cargoType: cargoType as "IMPORT" | "EXPORT" | "EMPTY_RETURN" | "TRANSSHIPMENT",
        containerNumber: containerNumber || undefined,
        isHazardous,
        specialRequirements: specialRequirements || undefined,
      })
      setBookingRef(booking.bookingNumber)
      setSubmitted(true)
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.error ??
        (err instanceof Error ? err.message : "Failed to create booking")
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setTerminalId("")
    setDate(new Date().toISOString().split("T")[0])
    setSlotId("")
    setCargoType("")
    setTruckId("")
    setContainerNumber("")
    setIsHazardous(false)
    setSpecialRequirements("")
    setSubmitted(false)
    setBookingRef("")
    setSubmitError(null)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
          <CheckCircle2 className="h-8 w-8 text-[hsl(var(--success))]" />
        </div>
        <h2 className="mt-6 font-heading text-2xl font-bold text-foreground">Booking Submitted</h2>
        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
          Your booking request has been submitted and is now pending operator approval.
          You will receive a notification once it is reviewed.
        </p>
        <div className="mt-6 rounded-lg border border-border bg-muted/50 px-6 py-3">
          <p className="text-xs text-muted-foreground">Booking Reference</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-foreground">{bookingRef}</p>
        </div>
        <div className="mt-8 flex items-center gap-3">
          <Link href="/carrier/bookings">
            <Button variant="outline" className="gap-2 bg-transparent">View My Bookings</Button>
          </Link>
          <Button onClick={resetForm} className="gap-2">Create Another</Button>
        </div>
      </div>
    )
  }

  const selectedTerminal = terminals?.find((t) => t.id === terminalId)
  const selectedSlot = availableSlots.find((s) => s.startTime === slotId)
  const selectedTruck = trucks?.find((t) => t.id === truckId)

  // Calculate current step for progress indicator
  const currentStep = (() => {
    if (!terminalId || !slotId) return 0
    if (!cargoType || !truckId) return 1
    return 2
  })()

  const steps = [
    { label: "Terminal & Schedule", description: "Select location and time" },
    { label: "Cargo & Vehicle", description: "Add cargo details" },
    { label: "Review & Submit", description: "Confirm booking" },
  ]

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/carrier"><Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Create Booking</h1>
            <p className="text-sm text-muted-foreground">Request a new time slot for container pickup or delivery</p>
          </div>
        </div>

        {/* Step Progress */}
        <Card className="border-border bg-card">
          <CardContent className="py-6">
            <StepProgress steps={steps} currentStep={currentStep} />
          </CardContent>
        </Card>

        {submitError && (
          <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
            <p className="text-sm text-[hsl(var(--destructive))]">{submitError}</p>
          </div>
        )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Terminal & Schedule */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                <Ship className="h-4 w-4 text-[hsl(210,65%,45%)]" /> Terminal & Schedule
              </CardTitle>
              <CardDescription>Select your desired terminal and time slot</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-foreground">Terminal</Label>
                  {loadingTerminals ? <Skeleton className="h-10 w-full" /> : (
                    <Select value={terminalId} onValueChange={setTerminalId} required>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select terminal" /></SelectTrigger>
                      <SelectContent>
                        {terminals?.filter((t) => t.isActive).map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} ({t.code}) – {t.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-foreground">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-10 w-full justify-start gap-2 text-left font-normal">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {formatDateDisplay(parseDateStr(date))}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={parseDateStr(date)}
                        onSelect={(d) => d && setDate(formatDateStr(d))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-foreground">Cargo Type</Label>
                  <Select value={cargoType} onValueChange={setCargoType} required>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMPORT">Import (Pickup)</SelectItem>
                      <SelectItem value="EXPORT">Export (Delivery)</SelectItem>
                      <SelectItem value="EMPTY_RETURN">Empty Return</SelectItem>
                      <SelectItem value="TRANSSHIPMENT">Transshipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Available slots shown as a visual grid */}
              {terminalId && date && (
                <div className="flex flex-col gap-2 pt-2">
                  <Label className="text-sm font-medium text-foreground">
                    Available Time Slots
                    {loadingSlots && <span className="ml-2 text-xs text-muted-foreground">(loading…)</span>}
                  </Label>
                  {loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border py-8 text-center">
                      <AlertCircle className="mx-auto h-5 w-5 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">No slots available for this date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                      {availableSlots.map((s) => {
                        const remaining = s.availableCapacity ?? ((s.maxCapacity ?? 0) - (s.bookedCount ?? 0))
                        const isFull = remaining <= 0
                        const isSelected = slotId === s.startTime
                        return (
                          <button
                            key={s.startTime}
                            type="button"
                            disabled={isFull}
                            onClick={() => setSlotId(isSelected ? "" : s.startTime)}
                            className={`rounded-lg border p-3 text-left transition-all ${
                              isFull
                                ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                                : isSelected
                                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                            }`}
                          >
                            <p className="text-sm font-semibold text-foreground">
                              {s.startTime.slice(0, 5)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              to {s.endTime.slice(0, 5)}
                            </p>
                            <p className={`mt-1 text-xs font-medium ${
                              isFull
                                ? "text-destructive"
                                : remaining <= 3
                                  ? "text-[hsl(var(--warning))]"
                                  : "text-[hsl(var(--success))]"
                            }`}>
                              {isFull ? "Full" : `${remaining} available`}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Truck */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                <Truck className="h-4 w-4 text-[hsl(185,60%,42%)]" /> Truck
              </CardTitle>
              <CardDescription>Select a vehicle from your fleet</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTrucks ? <Skeleton className="h-10 w-full" /> : (
                <Select value={truckId} onValueChange={setTruckId} required>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select truck" /></SelectTrigger>
                  <SelectContent>
                    {trucks?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.plateNumber} - {t.truckType.replace("_", " ")} {t.driverName ? `(${t.driverName})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Container Details */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                <Container className="h-4 w-4 text-[hsl(var(--warning))]" /> Container Details
              </CardTitle>
              <CardDescription>Enter the container information for this booking</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-foreground">Container Number (optional)</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="e.g. MSKU-4829173"
                      value={containerNumber}
                      onChange={(e) => setContainerNumber(e.target.value)}
                      className="h-10 pl-10 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-foreground">Hazardous Cargo</Label>
                  <div className="flex h-10 items-center gap-3">
                    <Switch checked={isHazardous} onCheckedChange={setIsHazardous} />
                    <span className="text-sm text-muted-foreground">{isHazardous ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">Special Requirements (optional)</Label>
                <Textarea
                  placeholder="Any special requirements, handling instructions, etc."
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="flex flex-col gap-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold text-foreground">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <SummaryRow label="Terminal" value={selectedTerminal ? `${selectedTerminal.name}` : "\u2014"} />
                <SummaryRow label="Cargo Type" value={cargoType ? cargoType.replace("_", " ") : "\u2014"} />
                <SummaryRow label="Date" value={date || "\u2014"} />
                <SummaryRow label="Time Slot" value={selectedSlot ? `${selectedSlot.startTime.slice(0, 5)} – ${selectedSlot.endTime.slice(0, 5)}` : "—"} />
                <SummaryRow label="Truck" value={selectedTruck ? selectedTruck.plateNumber : "\u2014"} />
                <SummaryRow label="Driver" value={selectedTruck?.driverName ?? "\u2014"} />
                <SummaryRow label="Container" value={containerNumber || "\u2014"} />
                <SummaryRow label="Hazardous" value={isHazardous ? "Yes" : "No"} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-[hsl(210,65%,45%)]/[0.03]">
            <CardContent className="p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Once submitted, your booking will be reviewed by the terminal operator.
                Approval typically takes 15-30 minutes during business hours.
              </p>
            </CardContent>
          </Card>

          <Button type="submit" className="h-11 w-full gap-2" disabled={submitting || !terminalId || !slotId || !truckId || !cargoType}>
            {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {submitting ? "Submitting\u2026" : "Submit Booking Request"}
          </Button>
        </div>
      </form>
    </div>
    </PageTransition>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  )
}
