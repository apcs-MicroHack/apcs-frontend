"use client"

import { useState } from "react"
import {
  Calendar,
  Clock,
  Container,
  Truck,
  User,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Ship,
} from "lucide-react"
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

const terminals = [
  { value: "terminal-a", label: "Terminal A - North Quay", slots: 12 },
  { value: "terminal-b", label: "Terminal B - East Quay", slots: 8 },
  { value: "terminal-c", label: "Terminal C - South Quay", slots: 15 },
  { value: "terminal-d", label: "Terminal D - West Quay", slots: 5 },
]

const timeSlots = [
  { value: "06:00-07:00", label: "06:00 - 07:00", available: 8 },
  { value: "07:00-08:00", label: "07:00 - 08:00", available: 5 },
  { value: "08:00-09:00", label: "08:00 - 09:00", available: 2 },
  { value: "09:00-10:00", label: "09:00 - 10:00", available: 10 },
  { value: "10:00-11:00", label: "10:00 - 11:00", available: 12 },
  { value: "11:00-12:00", label: "11:00 - 12:00", available: 7 },
  { value: "12:00-13:00", label: "12:00 - 13:00", available: 15 },
  { value: "14:00-15:00", label: "14:00 - 15:00", available: 4 },
  { value: "15:00-16:00", label: "15:00 - 16:00", available: 9 },
  { value: "16:00-17:00", label: "16:00 - 17:00", available: 11 },
  { value: "17:00-18:00", label: "17:00 - 18:00", available: 14 },
  { value: "18:00-19:00", label: "18:00 - 19:00", available: 18 },
]

const trucks = [
  { value: "00216-142-AB", label: "00216-142-AB - Scania R450" },
  { value: "00216-142-MN", label: "00216-142-MN - Volvo FH16" },
  { value: "00216-142-WX", label: "00216-142-WX - MAN TGX" },
  { value: "00216-142-FF", label: "00216-142-FF - DAF XF" },
]

export default function CreateBookingPage() {
  const [submitted, setSubmitted] = useState(false)
  const [terminal, setTerminal] = useState("")
  const [date, setDate] = useState("")
  const [timeSlot, setTimeSlot] = useState("")
  const [operationType, setOperationType] = useState("")
  const [truck, setTruck] = useState("")
  const [driverName, setDriverName] = useState("")
  const [containerRef, setContainerRef] = useState("")
  const [containerSize, setContainerSize] = useState("")
  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
          <CheckCircle2 className="h-8 w-8 text-[hsl(var(--success))]" />
        </div>
        <h2 className="mt-6 font-heading text-2xl font-bold text-foreground">
          Booking Submitted
        </h2>
        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
          Your booking request has been submitted successfully and is now pending
          operator approval. You will receive a notification once it is reviewed.
        </p>
        <div className="mt-6 rounded-lg border border-border bg-muted/50 px-6 py-3">
          <p className="text-xs text-muted-foreground">Booking Reference</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-foreground">
            BK-2026-0919
          </p>
        </div>
        <div className="mt-8 flex items-center gap-3">
          <Link href="/carrier/bookings">
            <Button variant="outline" className="gap-2 bg-transparent">
              View My Bookings
            </Button>
          </Link>
          <Button onClick={() => setSubmitted(false)} className="gap-2">
            Create Another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/carrier">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Create Booking</h1>
          <p className="text-sm text-muted-foreground">
            Request a new time slot for container pickup or delivery
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Terminal & Schedule */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                <Ship className="h-4 w-4 text-[hsl(210,65%,45%)]" />
                Terminal & Schedule
              </CardTitle>
              <CardDescription>Select your desired terminal and time slot</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="terminal" className="text-sm font-medium text-foreground">
                    Terminal
                  </Label>
                  <Select value={terminal} onValueChange={setTerminal} required>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select terminal" />
                    </SelectTrigger>
                    <SelectContent>
                      {terminals.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center justify-between gap-3">
                            <span>{t.label}</span>
                            <Badge variant="outline" className="ml-2 text-[10px]">
                              {t.slots} slots
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="operation" className="text-sm font-medium text-foreground">
                    Operation Type
                  </Label>
                  <Select value={operationType} onValueChange={setOperationType} required>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Import or Export" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="import">Import (Pickup)</SelectItem>
                      <SelectItem value="export">Export (Delivery)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="date" className="text-sm font-medium text-foreground">
                    Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-10 pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="timeSlot" className="text-sm font-medium text-foreground">
                    Time Slot
                  </Label>
                  <Select value={timeSlot} onValueChange={setTimeSlot} required>
                    <SelectTrigger className="h-10">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          <div className="flex items-center gap-2">
                            <span>{slot.label}</span>
                            <span className={`text-xs ${slot.available <= 3 ? "text-[hsl(var(--destructive))]" : "text-muted-foreground"}`}>
                              ({slot.available} left)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Truck & Driver */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                <Truck className="h-4 w-4 text-[hsl(185,60%,42%)]" />
                Truck & Driver
              </CardTitle>
              <CardDescription>Assign a vehicle and driver from your fleet</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="truck" className="text-sm font-medium text-foreground">
                    Truck
                  </Label>
                  <Select value={truck} onValueChange={setTruck} required>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select truck" />
                    </SelectTrigger>
                    <SelectContent>
                      {trucks.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="driver" className="text-sm font-medium text-foreground">
                    Driver Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="driver"
                      placeholder="Enter driver name"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="h-10 pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Container Details */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                <Container className="h-4 w-4 text-[hsl(var(--warning))]" />
                Container Details
              </CardTitle>
              <CardDescription>Enter the container information for this booking</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="containerRef" className="text-sm font-medium text-foreground">
                    Container Reference
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="containerRef"
                      placeholder="e.g. MSKU-4829173"
                      value={containerRef}
                      onChange={(e) => setContainerRef(e.target.value)}
                      className="h-10 pl-10 font-mono text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="containerSize" className="text-sm font-medium text-foreground">
                    Container Size
                  </Label>
                  <Select value={containerSize} onValueChange={setContainerSize} required>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20ft">20ft Standard</SelectItem>
                      <SelectItem value="40ft">40ft Standard</SelectItem>
                      <SelectItem value="40ft-hc">40ft High Cube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="weight" className="text-sm font-medium text-foreground">
                    Weight (tons)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 28.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="h-10"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements, hazardous cargo info, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <SummaryRow label="Terminal" value={terminal ? terminals.find(t => t.value === terminal)?.label?.split(" - ")[0] || "-" : "-"} />
                <SummaryRow label="Operation" value={operationType ? (operationType === "import" ? "Import" : "Export") : "-"} />
                <SummaryRow label="Date" value={date || "-"} />
                <SummaryRow label="Time Slot" value={timeSlot ? timeSlots.find(s => s.value === timeSlot)?.label || "-" : "-"} />
                <SummaryRow label="Truck" value={truck || "-"} />
                <SummaryRow label="Driver" value={driverName || "-"} />
                <SummaryRow label="Container" value={containerRef || "-"} />
                <SummaryRow label="Size" value={containerSize || "-"} />
                <SummaryRow label="Weight" value={weight ? `${weight} tons` : "-"} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-[hsl(210,65%,45%)]/[0.03]">
            <CardContent className="p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Once submitted, your booking will be reviewed by the terminal
                operator. Approval typically takes 15-30 minutes during business
                hours. You will receive a notification when your booking status
                changes.
              </p>
            </CardContent>
          </Card>

          <Button type="submit" className="h-11 w-full gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Submit Booking Request
          </Button>
        </div>
      </form>
    </div>
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
