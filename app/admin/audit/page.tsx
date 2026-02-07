"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ChevronLeft, ChevronRight, Search, Eye, Filter } from "lucide-react"
import { getAuditLogs } from "@/services/audit.service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { getUserById } from "@/services/user.service"

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800 border-green-200",
  UPDATE: "bg-blue-100 text-blue-800 border-blue-200",
  DELETE: "bg-red-100 text-red-800 border-red-200",
  LOGIN: "bg-yellow-100 text-yellow-800 border-yellow-200",
  LOGIN_SUCCESS: "bg-green-100 text-green-800 border-green-200",
  LOGIN_FAILED: "bg-red-100 text-red-800 border-red-200",
  LOGOUT: "bg-gray-100 text-gray-800 border-gray-200",
  APPROVE: "bg-green-100 text-green-800 border-green-200",
  REJECT: "bg-red-100 text-red-800 border-red-200",
  CANCEL: "bg-orange-100 text-orange-800 border-orange-200",
  EXPORT: "bg-purple-100 text-purple-800 border-purple-200",
  PASSWORD_RESET_REQUESTED: "bg-yellow-100 text-yellow-800 border-yellow-200",
}

const DEFAULT_COLUMNS = ["date", "user", "action", "entity", "entityId", "details"]
const EXTRA_COLUMNS = ["ipAddress", "userAgent"]

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [entityFilter, setEntityFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined })
  const [showColumns, setShowColumns] = useState([...DEFAULT_COLUMNS])
  const [showExtra, setShowExtra] = useState(false)
  const [userDialog, setUserDialog] = useState<{ open: boolean, user: any | null, loading: boolean }>({ open: false, user: null, loading: false })

  // Create a stable string key for dateRange to avoid dependency array size/order issues
  const dateRangeKey = `${dateRange.from ? dateRange.from.toISOString().slice(0,10) : ''}|${dateRange.to ? dateRange.to.toISOString().slice(0,10) : ''}`;
  useEffect(() => {
    setLoading(true)
    getAuditLogs({
      page,
      search,
      action: actionFilter === "all" ? undefined : actionFilter,
      entity: entityFilter === "all" ? undefined : entityFilter,
      startDate: dateRange.from ? dateRange.from.toISOString().slice(0, 10) : undefined,
      endDate: dateRange.to ? dateRange.to.toISOString().slice(0, 10) : undefined,
    })
      .then((data) => {
        setLogs(data.logs || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load audit logs")
        setLoading(false)
      })
  }, [page, search, actionFilter, entityFilter, dateRangeKey])

  function renderDetails(details: any) {
    if (!details) return <span className="text-muted-foreground">-</span>
    if (typeof details === "string") {
      try {
        const parsed = JSON.parse(details)
        if (typeof parsed === "object" && parsed !== null) details = parsed
        else return <span className="break-words text-xs">{details}</span>
      } catch {
        return <span className="break-words text-xs">{details}</span>
      }
    }
    if (typeof details === "object" && details !== null) {
      return (
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {Object.entries(details).map(([k, v]) => (
            <li key={k} className="break-words"><span className="font-semibold text-foreground/80">{k}:</span> {String(v)}</li>
          ))}
        </ul>
      )
    }
    return <span className="break-words text-xs">{String(details)}</span>
  }

  function toggleColumn(col: string) {
    setShowColumns((cols) =>
      cols.includes(col) ? cols.filter((c) => c !== col) : [...cols, col]
    )
  }

  function toggleExtraColumns() {
    setShowExtra((v) => !v)
    setShowColumns((cols) => {
      if (!showExtra) return [...cols, ...EXTRA_COLUMNS]
      return cols.filter((c) => !EXTRA_COLUMNS.includes(c))
    })
  }

  async function handleViewUser(userId: string) {
    setUserDialog({ open: true, user: null, loading: true })
    try {
      const user = await getUserById(userId)
      setUserDialog({ open: true, user, loading: false })
    } catch {
      setUserDialog({ open: true, user: null, loading: false })
    }
  }

  if (loading) return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-6 py-3 flex gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b border-border px-6 py-3 flex gap-8">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-20" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
  if (error) return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div className="text-destructive font-semibold">{error}</div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            All system audit events ({loading ? "…" : `${logs.length} total`})
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" onClick={toggleExtraColumns}>
            {showExtra ? "Hide" : "Show"} IP & User Agent
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Toggle columns">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[...DEFAULT_COLUMNS, ...EXTRA_COLUMNS].map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={showColumns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs font-medium text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by action, user, entity..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="h-9 bg-muted/50 pl-9 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/5">
            <label className="text-xs font-medium text-muted-foreground">Action</label>
            <Select value={actionFilter} onValueChange={v => { setActionFilter(v); setPage(1) }}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGIN_SUCCESS">Login Success</SelectItem>
                <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="APPROVE">Approve</SelectItem>
                <SelectItem value="REJECT">Reject</SelectItem>
                <SelectItem value="CANCEL">Cancel</SelectItem>
                <SelectItem value="EXPORT">Export</SelectItem>
                <SelectItem value="PASSWORD_RESET_REQUESTED">Password Reset</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/5">
            <label className="text-xs font-medium text-muted-foreground">Entity</label>
            <Select value={entityFilter} onValueChange={v => { setEntityFilter(v); setPage(1) }}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="BOOKING">Booking</SelectItem>
                <SelectItem value="CARRIER">Carrier</SelectItem>
                <SelectItem value="TERMINAL">Terminal</SelectItem>
                <SelectItem value="NOTIFICATION">Notification</SelectItem>
                <SelectItem value="REPORT">Report</SelectItem>
                {/* Add more as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/4 min-w-[180px]">
            <label className="text-xs font-medium text-muted-foreground">Date Range</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between w-full h-9 text-left font-normal">
                  {dateRange.from && dateRange.to
                    ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                    : dateRange.from
                    ? dateRange.from.toLocaleDateString()
                    : "Pick a date range"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="p-0 mt-2">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range ?? { from: undefined, to: undefined })}
                  className="rounded-md border bg-background shadow-sm"
                  numberOfMonths={1}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-col gap-2 md:justify-end">
            <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs mt-6" onClick={() => { setSearch(""); setActionFilter("all"); setEntityFilter("all"); setDateRange({ from: undefined, to: undefined }); setPage(1); }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {showColumns.includes("date") && <TableHead className="pl-6 text-xs uppercase tracking-wider whitespace-nowrap min-w-[170px]">Date</TableHead>}
                {showColumns.includes("user") && <TableHead className="text-xs uppercase tracking-wider whitespace-nowrap min-w-[180px]">User</TableHead>}
                {showColumns.includes("action") && <TableHead className="text-xs uppercase tracking-wider whitespace-nowrap min-w-[120px]">Action</TableHead>}
                {showColumns.includes("entity") && <TableHead className="text-xs uppercase tracking-wider whitespace-nowrap min-w-[100px]">Entity</TableHead>}
                {showColumns.includes("entityId") && <TableHead className="text-xs uppercase tracking-wider whitespace-nowrap min-w-[120px]">Entity ID</TableHead>}
                {showColumns.includes("details") && <TableHead className="text-xs uppercase tracking-wider whitespace-nowrap min-w-[200px]">Details</TableHead>}
                {showColumns.includes("ipAddress") && <TableHead className="text-xs uppercase tracking-wider whitespace-nowrap min-w-[130px]">IP Address</TableHead>}
                {showColumns.includes("userAgent") && <TableHead className="text-xs uppercase tracking-wider whitespace-nowrap min-w-[200px]">User Agent</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showColumns.length + 1} className="py-12 text-center text-muted-foreground">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/40 transition-colors">
                    {showColumns.includes("date") && <TableCell className="pl-6 font-mono text-xs text-foreground whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</TableCell>}
                    {showColumns.includes("user") && (
                      <TableCell className="text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[150px]" title={log.user?.email}>{log.user?.email || "-"}</span>
                          {log.user?.id && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleViewUser(log.user.id)} aria-label="View user details">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                    {showColumns.includes("action") && <TableCell><span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold border whitespace-nowrap ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-800 border-gray-200"}`}>{log.action}</span></TableCell>}
                    {showColumns.includes("entity") && <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{log.entity}</TableCell>}
                    {showColumns.includes("entityId") && <TableCell className="text-xs text-muted-foreground font-mono">{log.entityId || "-"}</TableCell>}
                    {showColumns.includes("details") && <TableCell className="max-w-[300px]">{renderDetails(log.details)}</TableCell>}
                    {showColumns.includes("ipAddress") && <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">{log.ipAddress || "-"}</TableCell>}
                    {showColumns.includes("userAgent") && <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate" title={log.userAgent}>{log.userAgent || "-"}</TableCell>}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-3">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    {/* User Details Dialog */}
    <Dialog open={userDialog.open} onOpenChange={(open) => setUserDialog((d) => ({ ...d, open, user: open ? d.user : null }))}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        {userDialog.loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading…</div>
        ) : userDialog.user ? (
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-lg">{userDialog.user.firstName} {userDialog.user.lastName}</div>
            <div className="text-sm text-muted-foreground">{userDialog.user.email}</div>
            <div className="text-xs">Role: <span className="font-semibold">{userDialog.user.role}</span></div>
            <div className="text-xs">Active: <span className="font-semibold">{userDialog.user.isActive ? "Yes" : "No"}</span></div>
            <div className="text-xs">Created: {new Date(userDialog.user.createdAt).toLocaleString()}</div>
            <div className="text-xs">Phone: {userDialog.user.phone || "-"}</div>
            {userDialog.user.terminal && (
              <div className="text-xs">Terminal: {userDialog.user.terminal.name} ({userDialog.user.terminal.code})</div>
            )}
            {userDialog.user.carrier && (
              <div className="text-xs">Carrier: {userDialog.user.carrier.companyName || userDialog.user.carrier.name}</div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-destructive">User not found</div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setUserDialog({ open: false, user: null, loading: false })}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
  )
}
