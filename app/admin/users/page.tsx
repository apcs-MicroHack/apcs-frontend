"use client"

import React from "react"
import { useState, useMemo } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Shield,
  UserCog,
  Truck,
  Mail,
  Phone,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
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
import { Skeleton } from "@/components/ui/skeleton"

import { useApi } from "@/hooks/use-api"
import { userService, carrierService, terminalService } from "@/services"
import type { User, Role, Carrier, Terminal } from "@/services/types"

// ── Helpers ──────────────────────────────────────────────────

function fullName(u: User) {
  return `${u.firstName} ${u.lastName}`
}

function initials(u: User) {
  return `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase()
}

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

function getRoleBadge(role: Role) {
  const map: Record<Role, { bg: string; text: string; label: string; icon: React.ElementType }> = {
    ADMIN: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      label: "Admin",
      icon: Shield,
    },
    OPERATOR: {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      label: "Operator",
      icon: UserCog,
    },
    CARRIER: {
      bg: "bg-green-500/10",
      text: "text-green-500",
      label: "Carrier",
      icon: Truck,
    },
  }
  const s = map[role]
  if (!s) return <Badge variant="outline">{role}</Badge>
  return (
    <Badge className={`border-0 gap-1 ${s.bg} ${s.text}`}>
      <s.icon className="h-3 w-3" />
      {s.label}
    </Badge>
  )
}

function getStatusBadge(isActive: boolean) {
  if (isActive) {
    return (
      <Badge className="border-0 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
        Active
      </Badge>
    )
  }
  return (
    <Badge className="border-0 bg-muted text-muted-foreground">Inactive</Badge>
  )
}

function avatarColor(role: Role) {
  switch (role) {
    case "ADMIN":
      return "bg-red-500/10 text-red-500"
    case "OPERATOR":
      return "bg-blue-500/10 text-blue-500"
    case "CARRIER":
      return "bg-green-500/10 text-green-500"
    default:
      return "bg-muted text-muted-foreground"
  }
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { data: users, loading, error, refetch } = useApi<User[]>(
    () => userService.getUsers(),
    [],
  )

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    user: User
    action: "deactivate" | "activate" | "reset" | "delete"
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Add user form state
  const [newFirstName, setNewFirstName] = useState("")
  const [newLastName, setNewLastName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newRole, setNewRole] = useState<Role>("ADMIN")
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Carrier / Terminal assignment
  const [availableCarriers, setAvailableCarriers] = useState<Carrier[]>([])
  const [availableTerminals, setAvailableTerminals] = useState<Terminal[]>([])
  const [selectedCarrierId, setSelectedCarrierId] = useState("")
  const [selectedTerminalId, setSelectedTerminalId] = useState("")
  const [assignLoading, setAssignLoading] = useState(false)

  // Reset password result
  const [resetPasswordResult, setResetPasswordResult] = useState<{
    user: User
    tempPassword: string
  } | null>(null)
  const [resetPasswordCopied, setResetPasswordCopied] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)

  const userList = users ?? []

  const filtered = useMemo(() => {
    return userList.filter((u) => {
      const name = fullName(u).toLowerCase()
      const q = search.toLowerCase()
      const matchesSearch =
        search === "" ||
        name.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.carrier?.name && u.carrier.name.toLowerCase().includes(q))
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [userList, search, roleFilter])

  const stats = useMemo(
    () => ({
      total: userList.length,
      admins: userList.filter((u) => u.role === "ADMIN").length,
      operators: userList.filter((u) => u.role === "OPERATOR").length,
      carriers: userList.filter((u) => u.role === "CARRIER").length,
    }),
    [userList],
  )

  // ── Add User ───────────────────────────────────────────────

  const openAddDialog = () => {
    setNewFirstName("")
    setNewLastName("")
    setNewEmail("")
    setNewPhone("")
    setNewRole("ADMIN")
    setSelectedCarrierId("")
    setSelectedTerminalId("")
    setAvailableCarriers([])
    setAvailableTerminals([])
    setGeneratedPassword("")
    setShowPassword(false)
    setCopied(false)
    setAddSuccess(false)
    setAddLoading(false)
    setAddError(null)
    setAddDialogOpen(true)
  }

  const handleRoleChange = async (role: Role) => {
    setNewRole(role)
    setSelectedCarrierId("")
    setSelectedTerminalId("")
    if (role === "CARRIER") {
      setAssignLoading(true)
      try {
        const carriers = await carrierService.getCarriers({ includeUnapproved: true, withoutUser: true })
        setAvailableCarriers(carriers)
      } catch { setAvailableCarriers([]) }
      finally { setAssignLoading(false) }
    } else if (role === "OPERATOR") {
      setAssignLoading(true)
      try {
        const terminals = await terminalService.getTerminals()
        // Filter out terminals that already have an operator assigned
        const assignedTerminalIds = new Set(
          userList
            .filter((u) => u.role === "OPERATOR")
            .flatMap((u) => {
              // Support multiple backend response formats
              const ids: string[] = []
              // Direct terminal field
              if (u.terminal?.id) ids.push(u.terminal.id)
              // Singular operatorTerminal with nested terminal (current backend format)
              if (u.operatorTerminal?.terminal?.id) ids.push(u.operatorTerminal.terminal.id)
              // Array format
              if (u.operatorTerminals) {
                ids.push(...u.operatorTerminals.map((ot) => ot.terminalId))
              }
              return ids
            })
        )
        const unassignedTerminals = terminals.filter((t) => !assignedTerminalIds.has(t.id))
        setAvailableTerminals(unassignedTerminals)
      } catch { setAvailableTerminals([]) }
      finally { setAssignLoading(false) }
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFirstName || !newLastName || !newEmail) return
    if (newRole === "CARRIER" && !selectedCarrierId) return
    if (newRole === "OPERATOR" && !selectedTerminalId) return

    setAddLoading(true)
    setAddError(null)
    try {
      if (newRole === "CARRIER") {
        // Use carrier assign-user endpoint which creates user + assigns in one step
        const result = await carrierService.assignUser(selectedCarrierId, {
          createUser: {
            email: newEmail,
            firstName: newFirstName,
            lastName: newLastName,
            phone: newPhone || undefined,
          },
        })
        // Get tempPassword from backend response if available
        if (result.tempPassword) {
          setGeneratedPassword(result.tempPassword)
        }
      } else {
        const result = await userService.createUser({
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          phone: newPhone || undefined,
          role: newRole,
        })
        // Get tempPassword from backend response
        if (result.tempPassword) {
          setGeneratedPassword(result.tempPassword)
        }
        // For OPERATOR, also assign to the selected terminal
        if (newRole === "OPERATOR" && selectedTerminalId && result.user?.id) {
          try {
            await terminalService.assignOperator(selectedTerminalId, result.user.id)
          } catch {
            // assignment may have been done server-side
          }
        }
      }
      setAddSuccess(true)
      refetch()
    } catch (err: unknown) {
      setAddError(
        (err as any)?.response?.data?.error ??
          (err as Error).message ??
          "Failed to create user",
      )
    } finally {
      setAddLoading(false)
    }
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Confirm Actions ────────────────────────────────────────

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    const { user, action } = confirmAction
    setActionLoading(true)
    try {
      if (action === "deactivate") {
        await userService.updateUser(user.id, { isActive: false })
      } else if (action === "activate") {
        await userService.updateUser(user.id, { isActive: true })
      } else if (action === "reset") {
        const result = await userService.resetUserPassword(user.id)
        // Show the generated password to the admin
        setResetPasswordResult({ user, tempPassword: result.tempPassword })
        setShowResetPassword(false)
        setResetPasswordCopied(false)
      } else if (action === "delete") {
        await userService.deleteUser(user.id)
      }
      refetch()
    } catch {
      // silently handled – could add toast here
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
      setSelectedUser(null)
    }
  }

  const handleCopyResetPassword = () => {
    if (resetPasswordResult?.tempPassword) {
      navigator.clipboard.writeText(resetPasswordResult.tempPassword)
      setResetPasswordCopied(true)
      setTimeout(() => setResetPasswordCopied(false), 2000)
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
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage admin, operator, and carrier accounts
          </p>
        </div>
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
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
              label="Total Users"
              value={stats.total}
              icon={CheckCircle2}
              color="text-[hsl(210,65%,45%)]"
              bg="bg-[hsl(210,65%,45%)]/10"
            />
            <StatCard
              label="Admins"
              value={stats.admins}
              icon={Shield}
              color="text-red-500"
              bg="bg-red-500/10"
            />
            <StatCard
              label="Operators"
              value={stats.operators}
              icon={UserCog}
              color="text-blue-500"
              bg="bg-blue-500/10"
            />
            <StatCard
              label="Carriers"
              value={stats.carriers}
              icon={Truck}
              color="text-green-500"
              bg="bg-green-500/10"
            />
          </>
        )}
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-[hsl(210,65%,45%)]/20 bg-[hsl(210,65%,45%)]/5 px-4 py-3">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(210,65%,45%)]" />
        <div className="text-sm text-foreground">
          When creating a <span className="font-medium">Carrier</span> or{" "}
          <span className="font-medium">Operator</span> account, you must assign
          them to an existing carrier company or terminal that has no account
          linked to it yet.
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, ID, or carrier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 bg-card pl-9 text-sm"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as "ALL" | Role)}
        >
          <SelectTrigger className="h-9 w-[140px] text-sm">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="OPERATOR">Operator</SelectItem>
            <SelectItem value="CARRIER">Carrier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wider">
                  User
                </TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">
                  Role
                </TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">
                  Linked To
                </TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">
                  Last Activity
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="pr-6 text-right text-xs uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Skeleton className="ml-auto h-8 w-8 rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={`text-xs font-semibold ${avatarColor(user.role)}`}
                          >
                            {initials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {fullName(user)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm text-foreground">
                        {user.carrier?.name ?? "-"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(user.updatedAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.isActive)}</TableCell>
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
                          <DropdownMenuItem
                            onClick={() => setSelectedUser(user)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmAction({ user, action: "reset" })
                            }}
                          >
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.isActive ? (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setConfirmAction({ user, action: "deactivate" })
                              }}
                            >
                              Deactivate Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setConfirmAction({ user, action: "activate" })
                              }}
                            >
                              Activate Account
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmAction({ user, action: "delete" })
                            }}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete User
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

      {/* ── User Detail Dialog ──────────────────────────────── */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={`text-sm font-semibold ${avatarColor(selectedUser.role)}`}
                    >
                      {initials(selectedUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">
                      {fullName(selectedUser)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(selectedUser.role)}
                  {getStatusBadge(selectedUser.isActive)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={selectedUser.email}
                />
                <DetailRow
                  icon={Phone}
                  label="Phone"
                  value={selectedUser.phone ?? "N/A"}
                />
                {selectedUser.carrier?.name && (
                  <DetailRow
                    icon={Truck}
                    label="Carrier Company"
                    value={selectedUser.carrier.name}
                  />
                )}
                <DetailRow
                  icon={Clock}
                  label="Last Activity"
                  value={formatDateTime(selectedUser.updatedAt)}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Account created on {formatDate(selectedUser.createdAt)}
              </p>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setConfirmAction({
                      user: selectedUser,
                      action: "reset",
                    })
                  }
                >
                  Reset Password
                </Button>
                {selectedUser.isActive ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setConfirmAction({
                        user: selectedUser,
                        action: "deactivate",
                      })
                    }
                  >
                    Deactivate Account
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() =>
                      setConfirmAction({
                        user: selectedUser,
                        action: "activate",
                      })
                    }
                  >
                    Activate Account
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Add User Dialog ─────────────────────────────────── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {addSuccess ? "User Account Created" : "Add User Account"}
            </DialogTitle>
            <DialogDescription>
              {addSuccess
                ? "The new account has been created. Share the credentials below."
                : "Create a new user account."}
            </DialogDescription>
          </DialogHeader>

          {addSuccess ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Account created successfully
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {newFirstName} {newLastName} ({newEmail})
                  </p>
                </div>
              </div>

              {generatedPassword ? (
                <>
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Login Credentials
                    </p>
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground">
                          {newEmail}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Temporary Password
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground">
                            {showPassword ? generatedPassword : "••••••••••••••"}
                          </code>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={handleCopyPassword}
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-xs text-foreground">
                      <span className="font-semibold">Save this password now!</span> This is the only time you will see it. 
                      Share it securely with the user. They will be prompted to change it on first login.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-[hsl(210,65%,45%)]/20 bg-[hsl(210,65%,45%)]/5 px-3 py-2.5">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(210,65%,45%)]" />
                  <p className="text-xs text-foreground">
                    A temporary password has been generated by the system. Use the{" "}
                    <span className="font-semibold">Reset Password</span> action from the user menu to generate 
                    a new password that you can share with the user.
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button onClick={() => setAddDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleCreateUser}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="newFirstName">First Name</Label>
                  <Input
                    id="newFirstName"
                    placeholder="e.g. Amine"
                    className="h-9"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="newLastName">Last Name</Label>
                  <Input
                    id="newLastName"
                    placeholder="e.g. Belkacem"
                    className="h-9"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="newEmail">Email Address</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="name@apcs.dz"
                    className="h-9"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="newPhone">Phone</Label>
                  <Input
                    id="newPhone"
                    placeholder="+213..."
                    className="h-9"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                  <Label htmlFor="newRole">Role</Label>
                  <Select
                    value={newRole}
                    onValueChange={(v) => handleRoleChange(v as Role)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="OPERATOR">Operator</SelectItem>
                      <SelectItem value="CARRIER">Carrier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newRole === "CARRIER" && (
                  <div className="col-span-2 flex flex-col gap-2">
                    <Label>Assign Carrier</Label>
                    {assignLoading ? (
                      <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Loading carriers…</span>
                      </div>
                    ) : availableCarriers.length === 0 ? (
                      <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-dashed border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/5">
                        <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
                        <span className="text-xs text-[hsl(var(--warning))]">No carriers without an account. Create a carrier first.</span>
                      </div>
                    ) : (
                      <Select value={selectedCarrierId} onValueChange={setSelectedCarrierId}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select a carrier to assign…" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCarriers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.companyName} — {c.registrationNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {newRole === "OPERATOR" && (
                  <div className="col-span-2 flex flex-col gap-2">
                    <Label>Assign Terminal</Label>
                    {assignLoading ? (
                      <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Loading terminals…</span>
                      </div>
                    ) : availableTerminals.length === 0 ? (
                      <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-dashed border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/5">
                        <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
                        <span className="text-xs text-[hsl(var(--warning))]">No terminals available.</span>
                      </div>
                    ) : (
                      <Select value={selectedTerminalId} onValueChange={setSelectedTerminalId}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select a terminal to assign…" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTerminals.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} ({t.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </div>

              {addError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-xs text-destructive">{addError}</p>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg bg-[hsl(210,65%,45%)]/5 px-3 py-2">
                <Shield className="h-4 w-4 text-[hsl(210,65%,45%)]" />
                <p className="text-xs text-foreground">
                  {newRole === "ADMIN" && (
                    <>
                      This account will have{" "}
                      <span className="font-semibold">
                        full administrator privileges
                      </span>{" "}
                      including user management, terminal configuration, and
                      system settings.
                    </>
                  )}
                  {newRole === "OPERATOR" && (
                    <>
                      This account will have{" "}
                      <span className="font-semibold">operator privileges</span>{" "}
                      to manage terminal operations and queue assignments.
                    </>
                  )}
                  {newRole === "CARRIER" && (
                    <>
                      This account will have{" "}
                      <span className="font-semibold">carrier privileges</span>{" "}
                      to manage bookings and fleet.
                    </>
                  )}
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="gap-2" disabled={addLoading}>
                  {addLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <Plus className="h-4 w-4" />
                  Create Account
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Confirm Action Dialog ───────────────────────────── */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {confirmAction?.action === "deactivate" && "Deactivate Account"}
              {confirmAction?.action === "activate" && "Activate Account"}
              {confirmAction?.action === "reset" && "Reset Password"}
              {confirmAction?.action === "delete" && "Delete User"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.action === "deactivate" &&
                `Are you sure you want to deactivate ${fullName(confirmAction.user)}'s account? They will no longer be able to log in.`}
              {confirmAction?.action === "activate" &&
                `Reactivate ${confirmAction ? fullName(confirmAction.user) : ""}'s account? They will be able to log in again.`}
              {confirmAction?.action === "reset" &&
                `Generate a new temporary password for ${confirmAction ? fullName(confirmAction.user) : ""}?`}
              {confirmAction?.action === "delete" &&
                `Permanently delete ${confirmAction ? fullName(confirmAction.user) : ""}'s account? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={
                confirmAction?.action === "deactivate" ||
                confirmAction?.action === "delete"
                  ? "destructive"
                  : "default"
              }
              onClick={handleConfirmAction}
              disabled={actionLoading}
              className="gap-2"
            >
              {actionLoading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {confirmAction?.action === "deactivate" && "Deactivate"}
              {confirmAction?.action === "activate" && "Activate"}
              {confirmAction?.action === "reset" && "Reset Password"}
              {confirmAction?.action === "delete" && "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reset Password Result Dialog ────────────────────── */}
      <Dialog open={!!resetPasswordResult} onOpenChange={() => setResetPasswordResult(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              Password Reset Complete
            </DialogTitle>
            <DialogDescription>
              A new temporary password has been generated for{" "}
              {resetPasswordResult ? fullName(resetPasswordResult.user) : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Password reset successfully
                </p>
                <p className="text-xs text-muted-foreground">
                  {resetPasswordResult?.user.email}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                New Temporary Password
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground">
                  {showResetPassword ? resetPasswordResult?.tempPassword : "••••••••••••••"}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                >
                  {showResetPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleCopyResetPassword}
                >
                  {resetPasswordCopied ? (
                    <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-xs text-foreground">
                <span className="font-semibold">Save this password now!</span> This is the only time you will see it.
                Share it securely with the user. They will be prompted to change it on next login.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setResetPasswordResult(null)}>Done</Button>
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
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="font-heading text-xl font-bold text-foreground">
            {value}
          </p>
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
