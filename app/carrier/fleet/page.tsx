"use client"

import { useState } from "react"
import {
  Truck,
  Plus,
  Search,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Calendar,
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type VehicleStatus = "active" | "maintenance" | "inactive"

interface Vehicle {
  id: string
  plate: string
  model: string
  type: string
  status: VehicleStatus
  lastUsed: string
  totalBookings: number
  driver: string
}

const initialFleet: Vehicle[] = [
  {
    id: "V-001",
    plate: "00216-142-AB",
    model: "Scania R450",
    type: "Container Hauler",
    status: "active",
    lastUsed: "Feb 6, 2026",
    totalBookings: 142,
    driver: "Karim Bouzid",
  },
  {
    id: "V-002",
    plate: "00216-142-MN",
    model: "Volvo FH16",
    type: "Container Hauler",
    status: "active",
    lastUsed: "Feb 5, 2026",
    totalBookings: 98,
    driver: "Adel Khelifi",
  },
  {
    id: "V-003",
    plate: "00216-142-WX",
    model: "MAN TGX",
    type: "Flatbed",
    status: "active",
    lastUsed: "Feb 6, 2026",
    totalBookings: 76,
    driver: "Noureddine Ait",
  },
  {
    id: "V-004",
    plate: "00216-142-FF",
    model: "DAF XF",
    type: "Container Hauler",
    status: "maintenance",
    lastUsed: "Feb 2, 2026",
    totalBookings: 114,
    driver: "Rachid Hamdi",
  },
  {
    id: "V-005",
    plate: "00216-142-GG",
    model: "Mercedes Actros",
    type: "Tanker",
    status: "active",
    lastUsed: "Feb 5, 2026",
    totalBookings: 67,
    driver: "Said Bennour",
  },
  {
    id: "V-006",
    plate: "00216-142-HH",
    model: "Renault T480",
    type: "Container Hauler",
    status: "active",
    lastUsed: "Feb 4, 2026",
    totalBookings: 53,
    driver: "Omar Belkacem",
  },
  {
    id: "V-007",
    plate: "00216-142-JJ",
    model: "Iveco S-Way",
    type: "Flatbed",
    status: "active",
    lastUsed: "Feb 6, 2026",
    totalBookings: 41,
    driver: "Farid Zaidi",
  },
  {
    id: "V-008",
    plate: "00216-142-KK",
    model: "Scania S500",
    type: "Container Hauler",
    status: "inactive",
    lastUsed: "Jan 20, 2026",
    totalBookings: 12,
    driver: "Unassigned",
  },
]

function getStatusConfig(status: VehicleStatus) {
  switch (status) {
    case "active":
      return { icon: CheckCircle2, bg: "bg-[hsl(var(--success))]/10", text: "text-[hsl(var(--success))]", label: "Active" }
    case "maintenance":
      return { icon: Wrench, bg: "bg-[hsl(var(--warning))]/10", text: "text-[hsl(var(--warning))]", label: "Maintenance" }
    case "inactive":
      return { icon: AlertTriangle, bg: "bg-muted", text: "text-muted-foreground", label: "Inactive" }
  }
}

export default function FleetManagementPage() {
  const [fleet] = useState(initialFleet)
  const [search, setSearch] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const filtered = fleet.filter(
    (v) =>
      search === "" ||
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.driver.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = fleet.filter((v) => v.status === "active").length
  const maintenanceCount = fleet.filter((v) => v.status === "maintenance").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Fleet Management</h1>
          <p className="text-sm text-muted-foreground">
            {fleet.length} vehicles registered ({activeCount} active, {maintenanceCount} in maintenance)
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
              <Wrench className="h-5 w-5 text-[hsl(var(--warning))]" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-foreground">{maintenanceCount}</p>
              <p className="text-xs text-muted-foreground">Maintenance</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(210,65%,45%)]/10">
              <Truck className="h-5 w-5 text-[hsl(210,65%,45%)]" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-foreground">{fleet.length}</p>
              <p className="text-xs text-muted-foreground">Total Fleet</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by plate, model, or driver..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 bg-muted/50 pl-9 text-sm"
        />
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((vehicle) => {
          const statusConfig = getStatusConfig(vehicle.status)
          return (
            <Card key={vehicle.id} className="border-border bg-card transition-colors hover:bg-muted/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold text-foreground">{vehicle.plate}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                    </div>
                  </div>
                  <Badge className={`border-0 ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Type</p>
                    <p className="text-xs font-medium text-foreground">{vehicle.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Driver</p>
                    <p className="text-xs font-medium text-foreground">{vehicle.driver}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Used</p>
                    <p className="text-xs text-foreground">{vehicle.lastUsed}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Bookings</p>
                    <p className="text-xs font-medium text-foreground">{vehicle.totalBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Add Vehicle</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Plate Number</Label>
              <Input placeholder="e.g. 00216-142-XX" className="h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Vehicle Model</Label>
              <Input placeholder="e.g. Scania R450" className="h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Vehicle Type</Label>
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hauler">Container Hauler</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="tanker">Tanker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Assigned Driver</Label>
              <Input placeholder="Driver name" className="h-10" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button onClick={() => setAddDialogOpen(false)}>
              Add Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
