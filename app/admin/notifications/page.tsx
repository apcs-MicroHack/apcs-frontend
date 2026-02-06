"use client"

import { useState, useMemo } from "react"
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Ship,
  Container,
  Clock,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type NotificationType = "booking" | "capacity" | "carrier" | "system"
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
    id: "N-001",
    title: "Terminal D capacity critical",
    message: "Terminal D has reached 91% utilization for the 08:00-09:00 slot. Consider redirecting bookings to Terminal B or C.",
    type: "capacity",
    priority: "high",
    read: false,
    timestamp: "Feb 6, 2026 09:15",
    relativeTime: "2 hours ago",
  },
  {
    id: "N-002",
    title: "New carrier registration",
    message: "Skikda Express (CR-007) has submitted a registration request. Review and approve their account to enable booking access.",
    type: "carrier",
    priority: "medium",
    read: false,
    timestamp: "Feb 6, 2026 08:30",
    relativeTime: "3 hours ago",
  },
  {
    id: "N-003",
    title: "High volume booking period",
    message: "42 new bookings received in the last 24 hours. This is 35% above the weekly average. Morning slots (07:00-10:00) are filling up fast.",
    type: "booking",
    priority: "medium",
    read: false,
    timestamp: "Feb 6, 2026 07:00",
    relativeTime: "4 hours ago",
  },
  {
    id: "N-004",
    title: "Terminal C maintenance scheduled",
    message: "Terminal C will undergo scheduled maintenance on Feb 10, 2026 from 06:00-14:00. Existing bookings for that period need to be reassigned.",
    type: "system",
    priority: "high",
    read: true,
    timestamp: "Feb 5, 2026 16:00",
    relativeTime: "Yesterday",
  },
  {
    id: "N-005",
    title: "Atlas Shipping suspended",
    message: "Atlas Shipping (CR-004) has been suspended due to repeated no-shows. Their 0 active bookings will not be affected.",
    type: "carrier",
    priority: "high",
    read: true,
    timestamp: "Feb 5, 2026 14:20",
    relativeTime: "Yesterday",
  },
  {
    id: "N-006",
    title: "Daily report ready",
    message: "The daily operations report for Feb 5, 2026 has been generated. Total bookings processed: 87. Overall utilization: 71.2%.",
    type: "system",
    priority: "low",
    read: true,
    timestamp: "Feb 5, 2026 22:00",
    relativeTime: "Yesterday",
  },
  {
    id: "N-007",
    title: "Booking BK-2026-0889 rejected",
    message: "Booking BK-2026-0889 by Atlas Shipping for Terminal C was rejected by the operator. Reason: carrier suspended.",
    type: "booking",
    priority: "medium",
    read: true,
    timestamp: "Feb 5, 2026 11:45",
    relativeTime: "Yesterday",
  },
  {
    id: "N-008",
    title: "Terminal A peak utilization reached",
    message: "Terminal A reached 100% capacity during the 09:00-10:00 slot on Feb 5. All 20 slots were booked.",
    type: "capacity",
    priority: "medium",
    read: true,
    timestamp: "Feb 5, 2026 10:00",
    relativeTime: "Yesterday",
  },
  {
    id: "N-009",
    title: "Weekly analytics summary",
    message: "Week of Jan 27 - Feb 2: 534 total bookings, 78.4% avg utilization, 4.1% rejection rate. Up 8% from previous week.",
    type: "system",
    priority: "low",
    read: true,
    timestamp: "Feb 3, 2026 08:00",
    relativeTime: "3 days ago",
  },
  {
    id: "N-010",
    title: "MedTransport SA fleet update",
    message: "MedTransport SA (CR-001) updated their fleet size from 20 to 24 trucks. Their booking limits have been adjusted accordingly.",
    type: "carrier",
    priority: "low",
    read: true,
    timestamp: "Feb 2, 2026 13:30",
    relativeTime: "4 days ago",
  },
]

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case "booking":
      return <Clock className="h-4 w-4" />
    case "capacity":
      return <Container className="h-4 w-4" />
    case "carrier":
      return <Ship className="h-4 w-4" />
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
    booking: { bg: "bg-[hsl(210,65%,45%)]/10", text: "text-[hsl(210,65%,45%)]" },
    capacity: { bg: "bg-[hsl(var(--warning))]/10", text: "text-[hsl(var(--warning))]" },
    carrier: { bg: "bg-[hsl(185,60%,42%)]/10", text: "text-[hsl(185,60%,42%)]" },
    system: { bg: "bg-muted", text: "text-muted-foreground" },
  }
  const s = map[type]
  return (
    <Badge className={`border-0 ${s.bg} ${s.text} capitalize`}>
      {type}
    </Badge>
  )
}

export default function AdminNotificationsPage() {
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
            System alerts, booking events, and capacity warnings
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
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="capacity">Capacity</SelectItem>
            <SelectItem value="carrier">Carrier</SelectItem>
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
                  {/* Type icon */}
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    notification.read
                      ? "bg-muted text-muted-foreground"
                      : "bg-[hsl(210,65%,45%)]/10 text-[hsl(210,65%,45%)]"
                  }`}>
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
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

                      {/* Actions */}
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
