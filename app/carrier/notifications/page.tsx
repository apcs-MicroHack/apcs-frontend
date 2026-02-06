"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Package,
  AlertTriangle,
  Info,
  Clock,
  UserCheck,
  ShieldAlert,
  CalendarClock,
  Megaphone,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
import { useApi } from "@/hooks/use-api"
import { notificationService } from "@/services"
import type { Notification } from "@/services/types"
import { useSocketEvent, useNotifications } from "@/contexts"

const TYPE_ICON: Record<string, React.ReactNode> = {
  BOOKING_CONFIRMED: <Package className="h-4 w-4 text-emerald-500" />,
  BOOKING_REJECTED: <AlertTriangle className="h-4 w-4 text-red-500" />,
  BOOKING_CANCELLED: <AlertTriangle className="h-4 w-4 text-gray-500" />,
  BOOKING_EXPIRED: <Clock className="h-4 w-4 text-amber-500" />,
  SLOT_REMINDER: <CalendarClock className="h-4 w-4 text-blue-500" />,
  CARRIER_APPROVED: <UserCheck className="h-4 w-4 text-emerald-500" />,
  SYSTEM_ALERT: <ShieldAlert className="h-4 w-4 text-red-500" />,
  GENERAL: <Megaphone className="h-4 w-4 text-blue-500" />,
}

function typeBadgeStyle(type: string) {
  switch (type) {
    case "BOOKING_CONFIRMED": case "CARRIER_APPROVED": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    case "BOOKING_REJECTED": case "SYSTEM_ALERT": return "bg-red-500/10 text-red-600 dark:text-red-400"
    case "BOOKING_CANCELLED": return "bg-gray-500/10 text-gray-600 dark:text-gray-400"
    case "BOOKING_EXPIRED": case "SLOT_REMINDER": return "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    default: return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function CarrierNotificationsPage() {
  const { data: notifications, loading, error, refetch } = useApi<Notification[]>(
    () => notificationService.getNotifications({ limit: 50 }).then((r) => r.notifications),
    [],
  )

  const { refetch: refreshContext } = useNotifications()

  // Listen for new notifications and auto-refetch
  useSocketEvent("notification:new", () => {
    refetch()
  })

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [readFilter, setReadFilter] = useState("all")

  const filtered = useMemo(() => {
    return (notifications ?? []).filter((n) => {
      const q = search.toLowerCase()
      const matchSearch = !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
      const matchType = typeFilter === "all" || n.type === typeFilter
      const matchRead = readFilter === "all" || (readFilter === "unread" ? !n.isRead : n.isRead)
      return matchSearch && matchType && matchRead
    })
  }, [notifications, search, typeFilter, readFilter])

  const unreadCount = (notifications ?? []).filter((n) => !n.isRead).length

  const handleMarkRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id)
    refetch()
    refreshContext()
  }, [refetch, refreshContext])

  const handleMarkAllRead = useCallback(async () => {
    await notificationService.markAllAsRead()
    refetch()
    refreshContext()
  }, [refetch, refreshContext])

  const handleDelete = useCallback(async (id: string) => {
    await notificationService.deleteNotification(id)
    refetch()
    refreshContext()
  }, [refetch, refreshContext])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-10 w-10 text-[hsl(var(--destructive))]" />
        <p className="text-sm text-muted-foreground">Failed to load notifications</p>
        <Button onClick={refetch} variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="outline" size="icon" className="h-9 w-9"><RefreshCw className="h-4 w-4" /></Button>
          {unreadCount > 0 && (
            <Button variant="outline" className="gap-2" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search notifications..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-10 w-[200px]"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="BOOKING_CONFIRMED">Booking Confirmed</SelectItem>
            <SelectItem value="BOOKING_REJECTED">Booking Rejected</SelectItem>
            <SelectItem value="BOOKING_CANCELLED">Booking Cancelled</SelectItem>
            <SelectItem value="BOOKING_EXPIRED">Booking Expired</SelectItem>
            <SelectItem value="SLOT_REMINDER">Slot Reminder</SelectItem>
            <SelectItem value="CARRIER_APPROVED">Carrier Approved</SelectItem>
            <SelectItem value="SYSTEM_ALERT">System Alert</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
          </SelectContent>
        </Select>
        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="h-10 w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Bell className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No notifications found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((n) => (
            <Card
              key={n.id}
              className={`border-border transition-colors ${!n.isRead ? "bg-[hsl(210,65%,45%)]/[0.03] border-[hsl(210,65%,45%)]/20" : "bg-card"}`}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {TYPE_ICON[n.type] ?? <Info className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                    {!n.isRead && <div className="h-1.5 w-1.5 rounded-full bg-[hsl(210,65%,45%)]" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className={`text-[10px] ${typeBadgeStyle(n.type)}`}>
                      {n.type.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{relativeTime(n.createdAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!n.isRead && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMarkRead(n.id)} title="Mark as read">
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[hsl(var(--destructive))]" onClick={() => handleDelete(n.id)} title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
