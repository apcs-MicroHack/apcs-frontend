"use client"

import { useState, useMemo } from "react"
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Container,
  Check,
  CheckCheck,
  Trash2,
  ClipboardCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  BOOKING_CREATED: <ClipboardCheck className="h-4 w-4" />,
  BOOKING_CONFIRMED: <CheckCircle2 className="h-4 w-4" />,
  BOOKING_REJECTED: <AlertTriangle className="h-4 w-4" />,
  BOOKING_CANCELLED: <AlertTriangle className="h-4 w-4" />,
  BOOKING_CONSUMED: <Container className="h-4 w-4" />,
  BOOKING_EXPIRED: <Clock className="h-4 w-4" />,
  SLOT_AVAILABLE: <Clock className="h-4 w-4" />,
  SYSTEM: <Info className="h-4 w-4" />,
}

function typeBadgeStyle(type: NotificationType) {
  if (type.includes("REJECTED") || type.includes("CANCELLED") || type.includes("EXPIRED"))
    return "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]"
  if (type.includes("CONFIRMED") || type.includes("CONSUMED"))
    return "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
  if (type.includes("CREATED") || type.includes("SLOT"))
    return "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]"
  return "bg-muted text-muted-foreground"
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OperatorNotificationsPage() {
  const { data: raw, loading, error, refetch } = useApi<{ notifications: Notification[] }>(
    () => notificationService.getNotifications({ limit: 50 }),
    [],
  )

  const { refetch: refreshContext } = useNotifications()

  // Listen for new notifications and auto-refetch
  useSocketEvent("notification:new", () => {
    refetch()
  })

  const notifications = raw?.notifications ?? []
  const [typeFilter, setTypeFilter] = useState("all")
  const [readFilter, setReadFilter] = useState("all")

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchesType = typeFilter === "all" || n.type === typeFilter
      const matchesRead =
        readFilter === "all" ||
        (readFilter === "unread" && !n.isRead) ||
        (readFilter === "read" && n.isRead)
      return matchesType && matchesRead
    })
  }, [notifications, typeFilter, readFilter])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      refetch()
      refreshContext()
    } catch { /* error */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      refetch()
      refreshContext()
    } catch { /* error */ }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      refetch()
      refreshContext()
    } catch { /* error */ }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="gap-2" onClick={refetch}><RefreshCw className="h-4 w-4" /> Retry</Button>
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
            Queue alerts, capacity warnings, and operational updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" className="gap-2 bg-transparent" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-[180px] text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="BOOKING_CREATED">Created</SelectItem>
            <SelectItem value="BOOKING_CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="BOOKING_REJECTED">Rejected</SelectItem>
            <SelectItem value="BOOKING_CANCELLED">Cancelled</SelectItem>
            <SelectItem value="BOOKING_CONSUMED">Consumed</SelectItem>
            <SelectItem value="BOOKING_EXPIRED">Expired</SelectItem>
            <SelectItem value="SLOT_AVAILABLE">Slot Available</SelectItem>
            <SelectItem value="SYSTEM">System</SelectItem>
          </SelectContent>
        </Select>
        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="h-9 w-[130px] text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
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

      {/* List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border bg-card"><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))
        ) : filtered.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No notifications found.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((n) => (
            <Card
              key={n.id}
              className={`border-border transition-colors ${
                n.isRead ? "bg-card" : "border-l-2 border-l-[hsl(210,65%,45%)] bg-[hsl(210,65%,45%)]/[0.03]"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    n.isRead ? "bg-muted text-muted-foreground" : "bg-[hsl(210,65%,45%)]/10 text-[hsl(210,65%,45%)]"
                  }`}>
                    {TYPE_ICON[n.type] ?? <Info className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className={`text-sm ${n.isRead ? "font-medium" : "font-semibold"} text-foreground`}>
                          {n.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.message}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <Badge className={`border-0 text-[10px] ${typeBadgeStyle(n.type)}`}>
                            {n.type.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{relativeTime(n.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        {!n.isRead && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMarkRead(n.id)}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(n.id)}
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
    </div>
  )
}
