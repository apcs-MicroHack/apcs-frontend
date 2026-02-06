"use client"

import React from "react"

import { useState, useMemo } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Ship,
  Truck,
  FileText,
  Ban,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  X,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type CarrierStatus = "active" | "suspended" | "pending"

interface Carrier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  registrationNumber: string
  fleetSize: number
  totalBookings: number
  activeBookings: number
  status: CarrierStatus
  joinedDate: string
}

const carriers: Carrier[] = [
  {
    id: "CR-001",
    name: "MedTransport SA",
    contactPerson: "Ahmed Benali",
    email: "contact@medtransport.dz",
    phone: "+213 21 45 67 89",
    address: "Zone Industrielle, Rouiba, Algiers",
    registrationNumber: "RC-16/00-0234567",
    fleetSize: 24,
    totalBookings: 342,
    activeBookings: 8,
    status: "active",
    joinedDate: "Jan 15, 2024",
  },
  {
    id: "CR-002",
    name: "Algiers Freight Co",
    contactPerson: "Fatima Zerhouni",
    email: "info@algfreight.dz",
    phone: "+213 21 55 88 12",
    address: "Port d'Alger, Quai Nord",
    registrationNumber: "RC-16/00-0198234",
    fleetSize: 18,
    totalBookings: 287,
    activeBookings: 5,
    status: "active",
    joinedDate: "Mar 22, 2024",
  },
  {
    id: "CR-003",
    name: "Sahel Logistics",
    contactPerson: "Mohammed Kaci",
    email: "ops@sahel-log.dz",
    phone: "+213 21 33 44 55",
    address: "Bab Ezzouar, Algiers",
    registrationNumber: "RC-16/00-0312456",
    fleetSize: 12,
    totalBookings: 156,
    activeBookings: 3,
    status: "active",
    joinedDate: "Jun 10, 2024",
  },
  {
    id: "CR-004",
    name: "Atlas Shipping",
    contactPerson: "Samira Boudiaf",
    email: "contact@atlasship.dz",
    phone: "+213 21 77 99 11",
    address: "Hussein Dey, Algiers",
    registrationNumber: "RC-16/00-0445678",
    fleetSize: 30,
    totalBookings: 421,
    activeBookings: 0,
    status: "suspended",
    joinedDate: "Feb 5, 2024",
  },
  {
    id: "CR-005",
    name: "Djurdjura Trans",
    contactPerson: "Karim Messaoudi",
    email: "djurdjura@trans.dz",
    phone: "+213 21 66 22 33",
    address: "Tizi Ouzou, Algiers Region",
    registrationNumber: "RC-15/00-0567890",
    fleetSize: 8,
    totalBookings: 89,
    activeBookings: 2,
    status: "active",
    joinedDate: "Sep 14, 2024",
  },
  {
    id: "CR-006",
    name: "Oran Maritime",
    contactPerson: "Leila Bensalem",
    email: "info@oranmaritime.dz",
    phone: "+213 41 22 33 44",
    address: "Port d'Oran, Oran",
    registrationNumber: "RC-31/00-0234890",
    fleetSize: 15,
    totalBookings: 198,
    activeBookings: 4,
    status: "active",
    joinedDate: "Apr 30, 2024",
  },
  {
    id: "CR-007",
    name: "Skikda Express",
    contactPerson: "Walid Ferhat",
    email: "contact@skikdaex.dz",
    phone: "+213 38 11 22 33",
    address: "Zone Portuaire, Skikda",
    registrationNumber: "RC-21/00-0112345",
    fleetSize: 6,
    totalBookings: 0,
    activeBookings: 0,
    status: "pending",
    joinedDate: "Feb 1, 2026",
  },
]

function getStatusBadge(status: CarrierStatus) {
  const map: Record<CarrierStatus, { bg: string; text: string; label: string }> = {
    active: { bg: "bg-[hsl(var(--success))]/10", text: "text-[hsl(var(--success))]", label: "Active" },
    suspended: { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]", label: "Suspended" },
    pending: { bg: "bg-[hsl(var(--warning))]/10", text: "text-[hsl(var(--warning))]", label: "Pending" },
  }
  const s = map[status]
  return <Badge className={`border-0 ${s.bg} ${s.text}`}>{s.label}</Badge>
}

export default function AdminCarriersPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)

  const filtered = useMemo(() => {
    return carriers.filter((c) => {
      const matchesSearch =
        search === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  const stats = useMemo(() => ({
    total: carriers.length,
    active: carriers.filter((c) => c.status === "active").length,
    suspended: carriers.filter((c) => c.status === "suspended").length,
    pending: carriers.filter((c) => c.status === "pending").length,
  }), [])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Carrier Management</h1>
          <p className="text-sm text-muted-foreground">
            Register and manage carrier accounts
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Carrier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Carriers" value={stats.total} icon={Ship} color="text-[hsl(210,65%,45%)]" bg="bg-[hsl(210,65%,45%)]/10" />
        <StatCard label="Active" value={stats.active} icon={CheckCircle2} color="text-[hsl(var(--success))]" bg="bg-[hsl(var(--success))]/10" />
        <StatCard label="Suspended" value={stats.suspended} icon={Ban} color="text-[hsl(var(--destructive))]" bg="bg-[hsl(var(--destructive))]/10" />
        <StatCard label="Pending Review" value={stats.pending} icon={FileText} color="text-[hsl(var(--warning))]" bg="bg-[hsl(var(--warning))]/10" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search carriers by name, contact, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 bg-card pl-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[140px] text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wider">Carrier</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">Contact</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">Fleet</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">Bookings</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="pr-6 text-right text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No carriers found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((carrier) => (
                  <TableRow key={carrier.id} className="cursor-pointer" onClick={() => setSelectedCarrier(carrier)}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[hsl(215,55%,20%)]/10 text-xs font-semibold text-[hsl(210,65%,45%)]">
                            {carrier.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{carrier.name}</p>
                          <p className="text-xs text-muted-foreground">{carrier.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm text-foreground">{carrier.contactPerson}</p>
                      <p className="text-xs text-muted-foreground">{carrier.email}</p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-foreground">{carrier.fleetSize}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm text-foreground">{carrier.totalBookings} total</p>
                      <p className="text-xs text-muted-foreground">{carrier.activeBookings} active</p>
                    </TableCell>
                    <TableCell>{getStatusBadge(carrier.status)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCarrier(carrier)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Carrier</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {carrier.status === "active" ? (
                            <DropdownMenuItem className="text-destructive">Suspend Carrier</DropdownMenuItem>
                          ) : carrier.status === "suspended" ? (
                            <DropdownMenuItem>Reactivate Carrier</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>Approve Carrier</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Carrier Detail Dialog */}
      <Dialog open={!!selectedCarrier} onOpenChange={() => setSelectedCarrier(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Carrier Details</DialogTitle>
          </DialogHeader>
          {selectedCarrier && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[hsl(215,55%,20%)]/10 text-sm font-semibold text-[hsl(210,65%,45%)]">
                      {selectedCarrier.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">{selectedCarrier.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedCarrier.id}</p>
                  </div>
                </div>
                {getStatusBadge(selectedCarrier.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailRow icon={Mail} label="Email" value={selectedCarrier.email} />
                <DetailRow icon={Phone} label="Phone" value={selectedCarrier.phone} />
                <DetailRow icon={MapPin} label="Address" value={selectedCarrier.address} />
                <DetailRow icon={FileText} label="Registration" value={selectedCarrier.registrationNumber} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                  <p className="font-heading text-lg font-bold text-foreground">{selectedCarrier.fleetSize}</p>
                  <p className="text-xs text-muted-foreground">Fleet Size</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                  <p className="font-heading text-lg font-bold text-foreground">{selectedCarrier.totalBookings}</p>
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                  <p className="font-heading text-lg font-bold text-foreground">{selectedCarrier.activeBookings}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">Member since {selectedCarrier.joinedDate}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Carrier Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Register New Carrier</DialogTitle>
            <DialogDescription>Add a new carrier to the APCS platform and create their login account</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setAddDialogOpen(false) }}>
            {/* Company Details */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Company Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-2">
                  <Label htmlFor="carrierName">Company Name</Label>
                  <Input id="carrierName" placeholder="e.g. Transport Express SA" className="h-9" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="regNumber">Registration Number</Label>
                  <Input id="regNumber" placeholder="RC-XX/00-XXXXXXX" className="h-9" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fleetSize">Fleet Size</Label>
                  <Input id="fleetSize" type="number" placeholder="e.g. 15" className="h-9" min="1" />
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Company address" className="h-9" />
                </div>
              </div>
            </div>

            {/* Carrier Account */}
            <div className="border-t border-border pt-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--warning))]/10">
                  <Truck className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Carrier Login Account
                </p>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                A carrier account will be created for the primary contact. They will use this to submit bookings and track their shipments.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-2">
                  <Label htmlFor="contactName">Contact Person (Full Name)</Label>
                  <Input id="contactName" placeholder="e.g. Ahmed Benali" className="h-9" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contactEmail">Login Email</Label>
                  <Input id="contactEmail" type="email" placeholder="contact@company.dz" className="h-9" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input id="contactPhone" placeholder="+213..." className="h-9" />
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-[hsl(var(--warning))]/5 px-3 py-2">
                <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--warning))]" />
                <p className="text-xs text-foreground">
                  A temporary password will be generated and shown after registration. The carrier will be required to change it on first login.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Register Carrier & Create Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: number; icon: React.ElementType; color: string; bg: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="font-heading text-xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}
