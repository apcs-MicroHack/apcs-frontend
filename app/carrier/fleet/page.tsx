"use client"

import { useState } from "react"
import {
  Truck,
  Plus,
  Search,
  Power,
  PowerOff,
  RefreshCw,
  AlertCircle,
  Filter,
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/hooks/use-api"
import { truckService, bookingService } from "@/services"
import type { Truck as TruckType, Booking } from "@/services/types"

const TRUCK_TYPES = ["FLATBED", "CONTAINER", "TANKER", "REFRIGERATED", "OTHER"] as const

const TYPE_STYLES: Record<string, string> = {
  FLATBED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  CONTAINER: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  TANKER: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  REFRIGERATED: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  OTHER: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
}

export default function FleetPage() {
  const { data: trucks, loading, error, refetch } = useApi<TruckType[]>(
    () => truckService.getTrucks(),
    [],
  )

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<TruckType | null>(null)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)
  const [checkingBookings, setCheckingBookings] = useState(false)

  // Check for active bookings when opening deactivate dialog
  const openDeactivateDialog = async (truck: TruckType) => {
    setDeactivateTarget(truck)
    setDeactivateError(null)
    setCheckingBookings(true)
    try {
      const bookings = await bookingService.getBookings()
      const activeBookings = bookings.filter(
        (b: Booking) => b.truck.plateNumber === truck.plateNumber && (b.status === "PENDING" || b.status === "CONFIRMED")
      )
      if (activeBookings.length > 0) {
        setDeactivateError(`Cannot deactivate: this truck has ${activeBookings.length} active booking(s). Please cancel or complete them first.`)
      }
    } catch {
      // If we can't check, allow the attempt (backend may still reject)
    } finally {
      setCheckingBookings(false)
    }
  }

  // Add form state
  const [plateNumber, setPlateNumber] = useState("")
  const [truckType, setTruckType] = useState("")
  const [driverName, setDriverName] = useState("")
  const [driverPhone, setDriverPhone] = useState("")
  const [driverLicense, setDriverLicense] = useState("")

  const filtered = (trucks ?? []).filter((t) => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.plateNumber.toLowerCase().includes(q) || (t.driverName ?? "").toLowerCase().includes(q)
    const matchType = typeFilter === "all" || t.truckType === typeFilter
    return matchSearch && matchType
  })

  const active = (trucks ?? []).filter((t) => t.isActive).length
  const inactive = (trucks ?? []).length - active

  const handleAdd = async () => {
    if (!plateNumber || !truckType) return
    setSaving(true)
    try {
      await truckService.createTruck({
        plateNumber,
        truckType: truckType as TruckType["truckType"],
        driverName: driverName || undefined,
        driverPhone: driverPhone || undefined,
        driverLicense: driverLicense || undefined,
      })
      toast.success("Truck added successfully")
      setAddOpen(false)
      setPlateNumber("")
      setTruckType("")
      setDriverName("")
      setDriverPhone("")
      setDriverLicense("")
      refetch()
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error ?? "Failed to add truck"
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (truckId: string, currentlyActive: boolean) => {
    setTogglingId(truckId)
    setDeactivateError(null)
    try {
      await truckService.updateTruck(truckId, { isActive: !currentlyActive })
      toast.success(currentlyActive ? "Truck deactivated" : "Truck activated")
      setDeactivateTarget(null)
      refetch()
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error ?? "Failed to update truck"
      if (currentlyActive) {
        // Show error in dialog for deactivation
        setDeactivateError(msg)
      } else {
        toast.error(msg)
      }
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-10 w-10 text-[hsl(var(--destructive))]" />
        <p className="text-sm text-muted-foreground">Failed to load fleet</p>
        <Button onClick={refetch} variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Fleet Management</h1>
          <p className="text-sm text-muted-foreground">Manage your trucks and drivers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="outline" size="icon" className="h-9 w-9"><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => setAddOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Truck</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Trucks</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{trucks?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-bold text-[hsl(var(--success))]">{active}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="mt-1 text-2xl font-bold text-muted-foreground">{inactive}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by plate or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-10 w-[180px]">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TRUCK_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Truck className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No trucks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((truck) => (
            <Card key={truck.id} className="group border-border bg-card transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Truck className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold text-foreground">{truck.plateNumber}</p>
                      <Badge variant="secondary" className={`mt-0.5 text-[10px] ${TYPE_STYLES[truck.truckType] ?? TYPE_STYLES.OTHER}`}>
                        {truck.truckType.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="secondary" className={truck.isActive ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-muted text-muted-foreground"}>
                    {truck.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
                  {truck.driverName && <p>Driver: <span className="text-foreground">{truck.driverName}</span></p>}
                  {truck.driverPhone && <p>Phone: <span className="text-foreground">{truck.driverPhone}</span></p>}
                </div>

                <div className="mt-4 flex justify-end">
                  {truck.isActive ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs text-[hsl(var(--warning))]"
                      onClick={() => openDeactivateDialog(truck)}
                    >
                      <PowerOff className="h-3 w-3" />
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs text-[hsl(var(--success))]"
                      onClick={() => handleToggleActive(truck.id, false)}
                      disabled={togglingId === truck.id}
                    >
                      {togglingId === truck.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Power className="h-3 w-3" />}
                      Activate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Truck</DialogTitle>
            <DialogDescription>Register a new vehicle in your fleet.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Plate Number *</Label>
              <Input placeholder="e.g. ABC-1234" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Truck Type *</Label>
              <Select value={truckType} onValueChange={setTruckType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {TRUCK_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Driver Name</Label>
              <Input placeholder="Full name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Driver Phone</Label>
                <Input placeholder="+1 234..." value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>License</Label>
                <Input placeholder="DL-XXXXX" value={driverLicense} onChange={(e) => setDriverLicense(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="bg-transparent">Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !plateNumber || !truckType}>
              {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Truck
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirm Dialog */}
      <Dialog open={!!deactivateTarget} onOpenChange={(open) => { if (!open) { setDeactivateTarget(null); setDeactivateError(null) } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate Truck</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate truck <span className="font-mono font-semibold">{deactivateTarget?.plateNumber}</span>?
              Deactivated trucks cannot be used for new bookings.
            </DialogDescription>
          </DialogHeader>
          {checkingBookings && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Checking for active bookings...
            </div>
          )}
          {deactivateError && (
            <div className="flex items-start gap-2 rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--destructive))]" />
              <p className="text-sm text-[hsl(var(--destructive))]">{deactivateError}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeactivateTarget(null); setDeactivateError(null) }} className="bg-transparent">Cancel</Button>
            <Button
              variant="default"
              className="bg-[hsl(var(--warning))] text-white hover:bg-[hsl(var(--warning))]/90"
              onClick={() => deactivateTarget && handleToggleActive(deactivateTarget.id, true)}
              disabled={togglingId === deactivateTarget?.id || checkingBookings || !!deactivateError}
            >
              {togglingId === deactivateTarget?.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
