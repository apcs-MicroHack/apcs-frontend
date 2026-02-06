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
  MapPin,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
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
import { Textarea } from "@/components/ui/textarea"

type UserRole = "admin" | "operator" | "carrier"
type UserStatus = "active" | "inactive" | "suspended"

interface UserAccount {
  id: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  createdAt: string
  lastLogin: string
  linkedEntity?: string
}

const initialUsers: UserAccount[] = [
  {
    id: "USR-001",
    fullName: "Admin User",
    email: "admin@apcs.dz",
    phone: "+213 21 00 00 01",
    role: "admin",
    status: "active",
    createdAt: "Jan 10, 2024",
    lastLogin: "Feb 6, 2026, 08:30",
  },
  {
    id: "USR-002",
    fullName: "Yacine Benmoussa",
    email: "y.benmoussa@apcs.dz",
    phone: "+213 21 00 00 02",
    role: "admin",
    status: "active",
    createdAt: "Mar 15, 2024",
    lastLogin: "Feb 5, 2026, 14:12",
  },
  {
    id: "USR-003",
    fullName: "Terminal A Operator",
    email: "operator@apcs.dz",
    phone: "+213 21 00 00 03",
    role: "operator",
    status: "active",
    createdAt: "Jan 15, 2024",
    lastLogin: "Feb 6, 2026, 07:45",
    linkedEntity: "Terminal A",
  },
  {
    id: "USR-004",
    fullName: "Karim Medjdoub",
    email: "k.medjdoub@apcs.dz",
    phone: "+213 21 00 00 04",
    role: "operator",
    status: "active",
    createdAt: "Apr 2, 2024",
    lastLogin: "Feb 6, 2026, 06:50",
    linkedEntity: "Terminal B",
  },
  {
    id: "USR-005",
    fullName: "Nadia Hamlaoui",
    email: "n.hamlaoui@apcs.dz",
    phone: "+213 21 00 00 05",
    role: "operator",
    status: "inactive",
    createdAt: "Jun 20, 2024",
    lastLogin: "Dec 10, 2025, 17:30",
    linkedEntity: "Terminal C",
  },
  {
    id: "USR-006",
    fullName: "Ahmed Benali",
    email: "contact@medtransport.dz",
    phone: "+213 21 45 67 89",
    role: "carrier",
    status: "active",
    createdAt: "Jan 15, 2024",
    lastLogin: "Feb 6, 2026, 09:15",
    linkedEntity: "MedTransport SA",
  },
  {
    id: "USR-007",
    fullName: "Fatima Zerhouni",
    email: "info@algfreight.dz",
    phone: "+213 21 55 88 12",
    role: "carrier",
    status: "active",
    createdAt: "Mar 22, 2024",
    lastLogin: "Feb 5, 2026, 16:40",
    linkedEntity: "Algiers Freight Co",
  },
  {
    id: "USR-008",
    fullName: "Samira Boudiaf",
    email: "contact@atlasship.dz",
    phone: "+213 21 77 99 11",
    role: "carrier",
    status: "suspended",
    createdAt: "Feb 5, 2024",
    lastLogin: "Nov 20, 2025, 10:00",
    linkedEntity: "Atlas Shipping",
  },
  {
    id: "USR-009",
    fullName: "Mohammed Kaci",
    email: "ops@sahel-log.dz",
    phone: "+213 21 33 44 55",
    role: "carrier",
    status: "active",
    createdAt: "Jun 10, 2024",
    lastLogin: "Feb 4, 2026, 11:20",
    linkedEntity: "Sahel Logistics",
  },
  {
    id: "USR-010",
    fullName: "Leila Bensalem",
    email: "info@oranmaritime.dz",
    phone: "+213 41 22 33 44",
    role: "carrier",
    status: "active",
    createdAt: "Apr 30, 2024",
    lastLogin: "Feb 3, 2026, 13:55",
    linkedEntity: "Oran Maritime",
  },
]

function getRoleBadge(role: UserRole) {
  const map: Record<UserRole, { bg: string; text: string; label: string; icon: React.ElementType }> = {
    admin: {
      bg: "bg-[hsl(210,65%,45%)]/10",
      text: "text-[hsl(210,65%,45%)]",
      label: "Admin",
      icon: Shield,
    },
    operator: {
      bg: "bg-[hsl(185,60%,42%)]/10",
      text: "text-[hsl(185,60%,42%)]",
      label: "Operator",
      icon: UserCog,
    },
    carrier: {
      bg: "bg-[hsl(var(--warning))]/10",
      text: "text-[hsl(var(--warning))]",
      label: "Carrier",
      icon: Truck,
    },
  }
  const s = map[role]
  return (
    <Badge className={`border-0 gap-1 ${s.bg} ${s.text}`}>
      <s.icon className="h-3 w-3" />
      {s.label}
    </Badge>
  )
}

function getStatusBadge(status: UserStatus) {
  const map: Record<UserStatus, { bg: string; text: string; label: string }> = {
    active: { bg: "bg-[hsl(var(--success))]/10", text: "text-[hsl(var(--success))]", label: "Active" },
    inactive: { bg: "bg-muted", text: "text-muted-foreground", label: "Inactive" },
    suspended: { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]", label: "Suspended" },
  }
  const s = map[status]
  return <Badge className={`border-0 ${s.bg} ${s.text}`}>{s.label}</Badge>
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%"
  let password = ""
  for (let i = 0; i < 14; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ user: UserAccount; action: "suspend" | "activate" | "reset" } | null>(null)

  // Add admin form
  const [newFullName, setNewFullName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        search === "" ||
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase()) ||
        (u.linkedEntity && u.linkedEntity.toLowerCase().includes(search.toLowerCase()))
      const matchesRole = roleFilter === "all" || u.role === roleFilter
      const matchesStatus = statusFilter === "all" || u.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      operators: users.filter((u) => u.role === "operator").length,
      carriers: users.filter((u) => u.role === "carrier").length,
    }),
    [users]
  )

  const openAddDialog = () => {
    setNewFullName("")
    setNewEmail("")
    setNewPhone("")
    setGeneratedPassword(generatePassword())
    setShowPassword(false)
    setCopied(false)
    setAddSuccess(false)
    setAddDialogOpen(true)
  }

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFullName || !newEmail) return
    const newUser: UserAccount = {
      id: `USR-${String(users.length + 1).padStart(3, "0")}`,
      fullName: newFullName,
      email: newEmail,
      phone: newPhone || "N/A",
      role: "admin",
      status: "active",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastLogin: "Never",
    }
    setUsers((prev) => [...prev, newUser])
    setAddSuccess(true)
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmAction = () => {
    if (!confirmAction) return
    const { user, action } = confirmAction
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== user.id) return u
        if (action === "suspend") return { ...u, status: "suspended" as UserStatus }
        if (action === "activate") return { ...u, status: "active" as UserStatus }
        return u
      })
    )
    setConfirmAction(null)
    setSelectedUser(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage admin, operator, and carrier accounts
          </p>
        </div>
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.total} icon={CheckCircle2} color="text-[hsl(210,65%,45%)]" bg="bg-[hsl(210,65%,45%)]/10" />
        <StatCard label="Admins" value={stats.admins} icon={Shield} color="text-[hsl(210,65%,55%)]" bg="bg-[hsl(210,65%,55%)]/10" />
        <StatCard label="Operators" value={stats.operators} icon={UserCog} color="text-[hsl(185,60%,42%)]" bg="bg-[hsl(185,60%,42%)]/10" />
        <StatCard label="Carriers" value={stats.carriers} icon={Truck} color="text-[hsl(var(--warning))]" bg="bg-[hsl(var(--warning))]/10" />
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-[hsl(210,65%,45%)]/20 bg-[hsl(210,65%,45%)]/5 px-4 py-3">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(210,65%,45%)]" />
        <div className="text-sm text-foreground">
          <span className="font-medium">Operator accounts</span> are created when adding a new terminal.{" "}
          <span className="font-medium">Carrier accounts</span> are created when registering a new carrier.{" "}
          Use this page to add <span className="font-medium">admin accounts</span> or manage all existing users.
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, ID, or linked entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 bg-card pl-9 text-sm"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-9 w-[130px] text-sm">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
            <SelectItem value="carrier">Carrier</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[130px] text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wider">User</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">Role</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">Linked To</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">Last Login</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="pr-6 text-right text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
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
                            className={`text-xs font-semibold ${
                              user.role === "admin"
                                ? "bg-[hsl(210,65%,45%)]/10 text-[hsl(210,65%,45%)]"
                                : user.role === "operator"
                                  ? "bg-[hsl(185,60%,42%)]/10 text-[hsl(185,60%,42%)]"
                                  : "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]"
                            }`}
                          >
                            {user.fullName
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm text-foreground">{user.linkedEntity || "-"}</p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{user.lastLogin}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
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
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
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
                          {user.status === "active" ? (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setConfirmAction({ user, action: "suspend" })
                              }}
                            >
                              Suspend Account
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

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={`text-sm font-semibold ${
                        selectedUser.role === "admin"
                          ? "bg-[hsl(210,65%,45%)]/10 text-[hsl(210,65%,45%)]"
                          : selectedUser.role === "operator"
                            ? "bg-[hsl(185,60%,42%)]/10 text-[hsl(185,60%,42%)]"
                            : "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]"
                      }`}
                    >
                      {selectedUser.fullName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">
                      {selectedUser.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedUser.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(selectedUser.role)}
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailRow icon={Mail} label="Email" value={selectedUser.email} />
                <DetailRow icon={Phone} label="Phone" value={selectedUser.phone} />
                {selectedUser.linkedEntity && (
                  <DetailRow
                    icon={selectedUser.role === "operator" ? UserCog : Truck}
                    label={selectedUser.role === "operator" ? "Terminal" : "Carrier Company"}
                    value={selectedUser.linkedEntity}
                  />
                )}
                <DetailRow icon={Clock} label="Last Login" value={selectedUser.lastLogin} />
              </div>

              <p className="text-xs text-muted-foreground">Account created on {selectedUser.createdAt}</p>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmAction({ user: selectedUser, action: "reset" })}
                >
                  Reset Password
                </Button>
                {selectedUser.status === "active" ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmAction({ user: selectedUser, action: "suspend" })}
                  >
                    Suspend Account
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setConfirmAction({ user: selectedUser, action: "activate" })}
                  >
                    Activate Account
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Admin Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {addSuccess ? "Admin Account Created" : "Add Admin Account"}
            </DialogTitle>
            <DialogDescription>
              {addSuccess
                ? "The new admin account has been created. Share the credentials below."
                : "Create a new administrator account with full system access."}
            </DialogDescription>
          </DialogHeader>

          {addSuccess ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
                <div>
                  <p className="text-sm font-medium text-foreground">Account created successfully</p>
                  <p className="text-xs text-muted-foreground">
                    {newFullName} ({newEmail})
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Login Credentials
                </p>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground">{newEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temporary Password</p>
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
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

              <div className="flex items-start gap-2 rounded-lg border border-[hsl(var(--warning))]/20 bg-[hsl(var(--warning))]/5 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--warning))]" />
                <p className="text-xs text-foreground">
                  Make sure to share these credentials securely. The user will be prompted to change their password on first login.
                </p>
              </div>

              <DialogFooter>
                <Button onClick={() => setAddDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleCreateAdmin}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-2">
                  <Label htmlFor="adminFullName">Full Name</Label>
                  <Input
                    id="adminFullName"
                    placeholder="e.g. Amine Belkacem"
                    className="h-9"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminEmail">Email Address</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="name@apcs.dz"
                    className="h-9"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminPhone">Phone</Label>
                  <Input
                    id="adminPhone"
                    placeholder="+213..."
                    className="h-9"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Generated Password
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="text-sm font-mono text-foreground">
                        {showPassword ? generatedPassword : "••••••••••••••"}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGeneratedPassword(generatePassword())}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 16h5v5" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-[hsl(210,65%,45%)]/5 px-3 py-2">
                <Shield className="h-4 w-4 text-[hsl(210,65%,45%)]" />
                <p className="text-xs text-foreground">
                  This account will have <span className="font-semibold">full administrator privileges</span> including user management, terminal configuration, and system settings.
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Create Admin Account
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {confirmAction?.action === "suspend" && "Suspend Account"}
              {confirmAction?.action === "activate" && "Activate Account"}
              {confirmAction?.action === "reset" && "Reset Password"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.action === "suspend" &&
                `Are you sure you want to suspend ${confirmAction.user.fullName}'s account? They will no longer be able to log in.`}
              {confirmAction?.action === "activate" &&
                `Reactivate ${confirmAction?.user.fullName}'s account? They will be able to log in again.`}
              {confirmAction?.action === "reset" &&
                `Generate a new temporary password for ${confirmAction?.user.fullName}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction?.action === "suspend" ? "destructive" : "default"}
              onClick={handleConfirmAction}
            >
              {confirmAction?.action === "suspend" && "Suspend"}
              {confirmAction?.action === "activate" && "Activate"}
              {confirmAction?.action === "reset" && "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

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
