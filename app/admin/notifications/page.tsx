"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Check,
  CheckCheck,
  Trash2,
  Container,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/hooks/use-api"
import { notificationService } from "@/services"
import type { Notification, NotificationType } from "@/services/types"
import { useSocketEvent, useNotifications } from "@/contexts"

// ── Relative-time helper ─────────────────────────────────────

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay === 1) return "Yesterday"
  if (diffDay < 7) return `${diffDay} days ago`
  return new Date(dateStr).toLocaleDateString()
}

// ── Icon / badge helpers ─────────────────────────────────────

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case "BOOKING_CREATED":
    case "BOOKING_CONFIRMED":
    case "BOOKING_REJECTED":
    case "BOOKING_CANCELLED":
    case "BOOKING_REMINDER":
      return <Clock className="h-4 w-4" />
    case "CAPACITY_WARNING":
    case "CAPACITY_FULL":
      return <Container className="h-4 w-4" />
    case "SYSTEM_ALERT":
      return <Info className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

function getTypeCategory(type: NotificationType): "booking" | "capacity" | "system" {
  if (type.startsWith("BOOKING_")) return "booking"
  if (type.startsWith("CAPACITY_")) return "capacity"
  return "system"
}

function getTypeBadge(type: NotificationType) {
  const cat = getTypeCategory(type)
  const map = {
    booking:  { bg: "bg-[hsl(210,65%,45%)]/10",       text: "text-[hsl(210,65%,45%)]" },
    capacity: { bg: "bg-[hsl(var(--warning))]/10",     text: "text-[hsl(var(--warning))]" },
    system:   { bg: "bg-muted",                         text: "text-muted-foreground" },
  }
  const s = map[cat]
  const label: Record<NotificationType, string> = {
    BOOKING_CREATED:   "Booking Created",
    BOOKING_CONFIRMED: "Booking Confirmed",
    BOOKING_REJECTED:  "Booking Rejected",
    BOOKING_CANCELLED: "Booking Cancelled",
    BOOKING_REMINDER:  "Reminder",
    CAPACITY_WARNING:  "Capacity Warning",
    CAPACITY_FULL:     "Capacity Full",
    SYSTEM_ALERT:      "System Alert",
  }
  return (
    <Badge className={`border-0 ${s.bg} ${s.text}`}>
      {label[type]}
    </Badge>
  )
}

function getSeverityIcon(type: NotificationType) {
  switch (type) {
    case "BOOKING_REJECTED":
    case "BOOKING_CANCELLED":
    case "CAPACITY_FULL":
      return <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
    case "CAPACITY_WARNING":
    case "BOOKING_REMINDER":
      return <Bell className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
    case "BOOKING_CONFIRMED":
    case "BOOKING_CREATED":
      return <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
    case "SYSTEM_ALERT":
      return <Info className="h-3.5 w-3.5 text-muted-foreground" />
    default:
      return null
  }
}

// ── Loading skeleton ─────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-7 w-7 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────

export default function AdminNotificationsPage() {
  const {
    data: response,
    loading,
    error,
    refetch,
  } = useApi(
    () => notificationService.getNotifications({ limit: 50 }),
    [],
  )

  const { refetch: refreshContext } = useNotifications()

  // Listen for new notifications and auto-refetch
  useSocketEvent("notification:new", () => {
    refetch()
  })

  const notifications = response?.notifications ?? []

  const [typeFilter, setTypeFilter] = useState("all")
  const [readFilter, setReadFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return notifications.filter((n: Notification) => {
      const cat = getTypeCategory(n.type)
      const matchesType = typeFilter === "all" || cat === typeFilter
      const matchesRead =
        readFilter === "all" ||
        (readFilter === "unread" && !n.isRead) ||
        (readFilter === "read" && n.isRead)
      return matchesType && matchesRead
    })
  }, [notifications, typeFilter, readFilter])

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length

  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        setActionLoading(id)
        await notificationService.markAsRead(id)
        refetch()
        refreshContext()
      } catch {
        // silently fail – user can retry
      } finally {
        setActionLoading(null)
      }
    },
    [refetch, refreshContext],
  )

  const handleMarkAllRead = useCallback(async () => {
    try {
      setActionLoading("all")
      await notificationService.markAllAsRead()
      refetch()
      refreshContext()
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }, [refetch, refreshContext])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setActionLoading(id)
        await notificationService.deleteNotification(id)
        refetch()
        refreshContext()
      } catch {
        // silently fail
      } finally {
        setActionLoading(null)
      }
    },
    [refetch, refreshContext],
  )

  // ── Error state ─────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-10 w-10 text-destructive" />
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
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-foreground">Notifications</h1>
            {!loading && unreadCount > 0 && (
              <Badge className="border-0 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            System alerts, booking events, and capacity warnings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={refetch}
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={handleMarkAllRead}
              disabled={actionLoading === "all"}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-[140px] text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="capacity">Capacity</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="h-9 w-[130px] text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
        <p className="ml-auto text-xs text-muted-foreground">
          {loading ? "\u2026" : `${filtered.length} notification${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Notification List */}
      {loading ? (
        <NotificationSkeleton />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Bell className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">No notifications found.</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((notification: Notification) => (
              <Card
                key={notification.id}
                className={`border-border transition-colors ${
                  notification.isRead
                    ? "bg-card"
                    : "border-l-2 border-l-[hsl(210,65%,45%)] bg-[hsl(210,65%,45%)]/[0.03]"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Type icon */}
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        notification.isRead
                          ? "bg-muted text-muted-foreground"
                          : "bg-[hsl(210,65%,45%)]/10 text-[hsl(210,65%,45%)]"
                      }`}
                    >
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-sm ${
                                notification.isRead
                                  ? "font-medium text-foreground"
                                  : "font-semibold text-foreground"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {getSeverityIcon(notification.type)}
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {notification.message}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            {getTypeBadge(notification.type)}
                            <span className="text-xs text-muted-foreground">
                              {relativeTime(notification.createdAt)}
                            </span>
                            {notification.booking && (
                              <span className="font-mono text-xs text-muted-foreground">
                                {notification.booking.bookingNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleMarkRead(notification.id)}
                              disabled={actionLoading === notification.id}
                              aria-label="Mark as read"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(notification.id)}
                            disabled={actionLoading === notification.id}
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
