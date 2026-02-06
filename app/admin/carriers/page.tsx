"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Truck,
  Building2,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  User as UserIcon,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Skeleton } from "@/components/ui/skeleton"

import { useApi } from "@/hooks/use-api"
import { carrierService } from "@/services"
import type { Carrier } from "@/services/types"

// ── Helpers ──────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

function getAccountBadge(hasAccount: boolean) {
  if (hasAccount) {
    return (
      <Badge className="border-0 gap-1 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
        <UserIcon className="h-3 w-3" />
        Linked
      </Badge>
    )
  }
  return (
    <Badge className="border-0 gap-1 bg-muted text-muted-foreground">
      No Account
    </Badge>
  )
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminCarriersPage() {
  const { data: carriers, loading, error, refetch } = useApi<Carrier[]>(
    () => carrierService.getCarriers({ includeUnapproved: true }),
    [],
  )

  const [search, setSearch] = useState("")
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)

  // Add / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null)
  const [formCompanyName, setFormCompanyName] = useState("")
  const [formRegNumber, setFormRegNumber] = useState("")
  const [formAddress, setFormAddress] = useState("")
  const [formContactEmail, setFormContactEmail] = useState("")
  const [formContactPhone, setFormContactPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Carrier | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const carrierList = carriers ?? []

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return carrierList
    return carrierList.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.registrationNumber.toLowerCase().includes(q) ||
        c.contactEmail?.toLowerCase().includes(q) ||
        c.user?.email?.toLowerCase().includes(q),
    )
  }, [carrierList, search])

  const stats = useMemo(
    () => ({
      total: carrierList.length,
      withAccount: carrierList.filter((c) => c.userId != null).length,
      withoutAccount: carrierList.filter((c) => c.userId == null).length,
    }),
    [carrierList],
  )

  // ── Dialog helpers ─────────────────────────────────────────

  const openAddDialog = () => {
    setEditingCarrier(null)
    setFormCompanyName("")
    setFormRegNumber("")
    setFormAddress("")
    setFormContactEmail("")
    setFormContactPhone("")
    setSaveError("")
    setDialogOpen(true)
  }

  const openEditDialog = (c: Carrier) => {
    setEditingCarrier(c)
    setFormCompanyName(c.companyName)
    setFormRegNumber(c.registrationNumber)
    setFormAddress(c.address ?? "")
    setFormContactEmail(c.contactEmail ?? "")
    setFormContactPhone(c.contactPhone ?? "")
    setSaveError("")
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formCompanyName || !formRegNumber) return
    setSaving(true)
    setSaveError("")
    try {
      if (editingCarrier) {
        await carrierService.updateCarrier(editingCarrier.id, {
          companyName: formCompanyName,
          registrationNumber: formRegNumber,
          address: formAddress || undefined,
          contactEmail: formContactEmail || undefined,
          contactPhone: formContactPhone || undefined,
        })
      } else {
        await carrierService.createCarrier({
          companyName: formCompanyName,
          registrationNumber: formRegNumber,
          address: formAddress || undefined,
          contactEmail: formContactEmail || undefined,
          contactPhone: formContactPhone || undefined,
        })
      }
      setDialogOpen(false)
      refetch()
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ?? err?.message ?? "Failed to save carrier"
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
      await carrierService.deleteCarrier(deleteTarget.id)
      setDeleteTarget(null)
      if (selectedCarrier?.id === deleteTarget.id) setSelectedCarrier(null)
      refetch()
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ?? err?.message ?? "Failed to delete carrier"
      setDeleteError(msg)
    } finally {
      setDeleting(false)
    }
  }

  // ── Error state ────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="gap-2" onClick={refetch}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Carrier Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage carrier companies and their information
          </p>
        </div>
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Carrier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              label="Total Carriers"
              value={stats.total}
              icon={Building2}
              color="text-[hsl(210,65%,45%)]"
              bg="bg-[hsl(210,65%,45%)]/10"
            />
            <StatCard
              label="With Account"
              value={stats.withAccount}
              icon={CheckCircle2}
              color="text-[hsl(var(--success))]"
              bg="bg-[hsl(var(--success))]/10"
            />
            <StatCard
              label="No Account"
              value={stats.withoutAccount}
              icon={Truck}
              color="text-muted-foreground"
              bg="bg-muted"
            />
          </>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by company name, registration, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 bg-card pl-9 text-sm"
        />
      </div>

      {/* Carriers Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wider">
                  Company
                </TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">
                  Registration
                </TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">
                  Contact
                </TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">
                  Created
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider">
                  Account
                </TableHead>
                <TableHead className="pr-6 text-right text-xs uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-44" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="pr-6 text-right"><Skeleton className="ml-auto h-8 w-8 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    {search ? "No carriers match your search." : "No carriers yet. Add one to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((carrier) => (
                  <TableRow
                    key={carrier.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedCarrier(carrier)}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                          <Truck className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {carrier.companyName}
                          </p>
                          {carrier.contactEmail && (
                            <p className="text-xs text-muted-foreground">
                              {carrier.contactEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="font-mono text-xs text-foreground">{carrier.registrationNumber}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {carrier.user ? (
                        <p className="text-sm text-foreground">
                          {carrier.user.firstName} {carrier.user.lastName}
                        </p>
                      ) : carrier.contactPhone ? (
                        <p className="text-xs text-muted-foreground">{carrier.contactPhone}</p>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(carrier.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getAccountBadge(carrier.userId != null)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCarrier(carrier)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditDialog(carrier)
                            }}
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteTarget(carrier)
                              setDeleteError("")
                            }}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
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

      {/* ── Carrier Detail Dialog ─────────────────────────── */}
      <Dialog open={!!selectedCarrier} onOpenChange={() => setSelectedCarrier(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Carrier Details</DialogTitle>
          </DialogHeader>
          {selectedCarrier && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                    <Truck className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">
                      {selectedCarrier.companyName}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {selectedCarrier.registrationNumber}
                    </p>
                  </div>
                </div>
                {getAccountBadge(selectedCarrier.userId != null)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedCarrier.user && (
                  <DetailRow
                    icon={UserIcon}
                    label="Account Owner"
                    value={`${selectedCarrier.user.firstName} ${selectedCarrier.user.lastName}`}
                  />
                )}
                {selectedCarrier.user && (
                  <DetailRow icon={Mail} label="Account Email" value={selectedCarrier.user.email} />
                )}
                {selectedCarrier.contactEmail && (
                  <DetailRow icon={Mail} label="Contact Email" value={selectedCarrier.contactEmail} />
                )}
                {selectedCarrier.contactPhone && (
                  <DetailRow icon={Phone} label="Contact Phone" value={selectedCarrier.contactPhone} />
                )}
                {selectedCarrier.address && (
                  <DetailRow icon={Building2} label="Address" value={selectedCarrier.address} />
                )}
                <DetailRow
                  icon={Clock}
                  label="Created"
                  value={formatDateTime(selectedCarrier.createdAt)}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setSelectedCarrier(null)
                    openEditDialog(selectedCarrier)
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setSelectedCarrier(null)
                    setDeleteTarget(selectedCarrier)
                    setDeleteError("")
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Carrier Dialog ─────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {editingCarrier ? "Edit Carrier" : "Add Carrier"}
            </DialogTitle>
            <DialogDescription>
              {editingCarrier
                ? "Update the carrier company information."
                : "Register a new carrier company."}
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
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g. MedTransport SA"
                  className="h-9"
                  value={formCompanyName}
                  onChange={(e) => setFormCompanyName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="regNumber">Registration Number</Label>
                <Input
                  id="regNumber"
                  placeholder="e.g. RC-12345"
                  className="h-9"
                  value={formRegNumber}
                  onChange={(e) => setFormRegNumber(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <Label htmlFor="address">Address (optional)</Label>
                <Input
                  id="address"
                  placeholder="e.g. Zone Industrielle, Alger"
                  className="h-9"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactEmail">Contact Email (optional)</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@company.dz"
                  className="h-9"
                  value={formContactEmail}
                  onChange={(e) => setFormContactEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactPhone">Contact Phone (optional)</Label>
                <Input
                  id="contactPhone"
                  placeholder="+213..."
                  className="h-9"
                  value={formContactPhone}
                  onChange={(e) => setFormContactPhone(e.target.value)}
                />
              </div>
            </div>

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
              <Button
                type="submit"
                disabled={saving || !formCompanyName || !formRegNumber}
                className="gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingCarrier ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ───────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={() => { setDeleteTarget(null); setDeleteError("") }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Delete Carrier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.companyName}</strong>?
              {deleteTarget?.userId && " This carrier has a linked user account."}{" "}
              This action cannot be undone.
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
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
  bg: string
}) {
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

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
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
