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

type NotificationType = "queue" | "capacity" | "booking" | "system"
type NotificationPriority = "high" | "medium" | "low"

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  read: boolean
  timestamp: string
  relativeTime: string
}

const initialNotifications: Notification[] = [
  {
    id: "N-101",
    title: "High volume in booking queue",
    message: "18 bookings are pending validation for Terminal A. The queue has grown 50% in the last hour. Priority review recommended.",
    type: "queue",
    priority: "high",
    read: false,
    timestamp: "Feb 6, 2026 09:10",
    relativeTime: "15 min ago",
  },
  {
    id: "N-102",
    title: "Terminal A 09:00 slot full",
    message: "The 09:00-10:00 slot has reached 100% capacity (20/20 trucks). No more bookings can be accepted for this hour.",
    type: "capacity",
    priority: "high",
    read: false,
    timestamp: "Feb 6, 2026 08:55",
    relativeTime: "30 min ago",
  },
  {
    id: "N-103",
    title: "Urgent booking requires review",
    message: "BK-2026-0901 by MedTransport SA has been waiting 52 minutes. This is a priority cargo booking with perishable goods.",
    type: "queue",
    priority: "high",
    read: false,
    timestamp: "Feb 6, 2026 08:30",
    relativeTime: "55 min ago",
  },
  {
    id: "N-104",
    title: "Express shipment pending",
    message: "BK-2026-0912 by Oran Maritime is marked as urgent - vessel departing at 18:00. Needs immediate validation.",
    type: "queue",
    priority: "high",
    read: false,
    timestamp: "Feb 6, 2026 08:05",
    relativeTime: "1 hour ago",
  },
  {
    id: "N-105",
    title: "Capacity warning: 14:00 slot",
    message: "Terminal A 14:00-15:00 slot is at 80% capacity (16/20 trucks). Consider monitoring incoming bookings for this period.",
    type: "capacity",
    priority: "medium",
    read: false,
    timestamp: "Feb 6, 2026 07:45",
    relativeTime: "2 hours ago",
  },
  {
    id: "N-106",
    title: "Booking BK-2026-0889 rejected",
    message: "Booking by Atlas Shipping for the 06:00 slot was automatically flagged - carrier is currently suspended.",
    type: "booking",
    priority: "medium",
    read: true,
    timestamp: "Feb 5, 2026 14:30",
    relativeTime: "Yesterday",
  },
  {
    id: "N-107",
    title: "Shift summary ready",
    message: "Morning shift (06:00-14:00) completed: 48 bookings processed, 45 approved, 3 rejected. Terminal utilization averaged 82%.",
    type: "system",
    priority: "low",
    read: true,
    timestamp: "Feb 5, 2026 14:00",
    relativeTime: "Yesterday",
  },
  {
    id: "N-108",
    title: "Terminal A capacity adjustment",
    message: "Admin has updated the 12:00-13:00 slot capacity from 10 to 12 trucks effective Feb 6. Your terminal schedule has been updated.",
    type: "system",
    priority: "medium",
    read: true,
    timestamp: "Feb 5, 2026 11:00",
    relativeTime: "Yesterday",
  },
  {
    id: "N-109",
    title: "Hazardous cargo booking",
    message: "BK-2026-0910 by Djurdjura Trans contains hazardous materials. Special permit verification required before approval.",
    type: "booking",
    priority: "high",
    read: true,
    timestamp: "Feb 5, 2026 09:15",
    relativeTime: "Yesterday",
  },
  {
    id: "N-110",
    title: "Daily target achieved",
    message: "Terminal A processed 64 bookings yesterday, exceeding the daily target of 55. Great operational efficiency!",
    type: "system",
    priority: "low",
    read: true,
    timestamp: "Feb 5, 2026 22:00",
    relativeTime: "Yesterday",
  },
]

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case "queue":
      return <ClipboardCheck className="h-4 w-4" />
    case "capacity":
      return <Container className="h-4 w-4" />
    case "booking":
      return <Clock className="h-4 w-4" />
    case "system":
      return <Info className="h-4 w-4" />
  }
}

function getPriorityIcon(priority: NotificationPriority) {
  switch (priority) {
    case "high":
      return <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
    case "medium":
      return <Bell className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
    case "low":
      return <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
  }
}

function getTypeBadge(type: NotificationType) {
  const map = {
    queue: { bg: "bg-[hsl(var(--warning))]/10", text: "text-[hsl(var(--warning))]" },
    capacity: { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]" },
    booking: { bg: "bg-[hsl(210,65%,45%)]/10", text: "text-[hsl(210,65%,45%)]" },
    system: { bg: "bg-muted", text: "text-muted-foreground" },
  }
  const s = map[type]
  return (
    <Badge className={`border-0 ${s.bg} ${s.text} capitalize`}>
      {type}
    </Badge>
  )
}

export default function OperatorNotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [typeFilter, setTypeFilter] = useState("all")
  const [readFilter, setReadFilter] = useState("all")

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchesType = typeFilter === "all" || n.type === typeFilter
      const matchesRead =
        readFilter === "all" ||
        (readFilter === "unread" && !n.read) ||
        (readFilter === "read" && n.read)
      return matchesType && matchesRead
    })
  }, [notifications, typeFilter, readFilter])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="border-0 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Queue alerts, capacity warnings, and operational updates
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" className="gap-2 bg-transparent" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-[140px] text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="queue">Queue</SelectItem>
            <SelectItem value="capacity">Capacity</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
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
          {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Notification List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No notifications found.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((notification) => (
            <Card
              key={notification.id}
              className={`border-border transition-colors ${
                notification.read ? "bg-card" : "border-l-2 border-l-[hsl(210,65%,45%)] bg-[hsl(210,65%,45%)]/[0.03]"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    notification.read
                      ? "bg-muted text-muted-foreground"
                      : "bg-[hsl(210,65%,45%)]/10 text-[hsl(210,65%,45%)]"
                  }`}>
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm ${notification.read ? "font-medium text-foreground" : "font-semibold text-foreground"}`}>
                            {notification.title}
                          </h3>
                          {getPriorityIcon(notification.priority)}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          {getTypeBadge(notification.type)}
                          <span className="text-xs text-muted-foreground">{notification.relativeTime}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => markRead(notification.id)}
                            aria-label="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteNotification(notification.id)}
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
    </div>
  )
}
