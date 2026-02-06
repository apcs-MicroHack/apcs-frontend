"use client"

import { useState, useMemo } from "react"
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Check,
  CheckCheck,
  Trash2,
  ClipboardList,
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

type NotificationType = "booking" | "approval" | "fleet" | "system"
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
    id: "N-201",
    title: "Booking BK-2026-0892 Approved",
    message: "Your booking for Terminal A on Feb 6 (08:00-09:00) has been approved. Your entry QR code is now available.",
    type: "approval",
    priority: "high",
    read: false,
    timestamp: "Feb 6, 2026 08:10",
    relativeTime: "20 min ago",
  },
  {
    id: "N-202",
    title: "Booking BK-2026-0891 Pending Review",
    message: "Your booking request for Terminal D on Feb 6 (10:00-11:00) is now in the operator queue for review.",
    type: "booking",
    priority: "medium",
    read: false,
    timestamp: "Feb 5, 2026 16:15",
    relativeTime: "16 hours ago",
  },
  {
    id: "N-203",
    title: "Vehicle 00216-142-FF in Maintenance",
    message: "DAF XF (00216-142-FF) has been marked for scheduled maintenance. It will be unavailable until Feb 8.",
    type: "fleet",
    priority: "medium",
    read: false,
    timestamp: "Feb 5, 2026 11:00",
    relativeTime: "Yesterday",
  },
  {
    id: "N-204",
    title: "Booking BK-2026-0889 Rejected",
    message: "Your booking for Terminal C on Feb 5 (06:00-07:00) was rejected. Reason: Slot capacity exceeded. Please select another time.",
    type: "approval",
    priority: "high",
    read: false,
    timestamp: "Feb 4, 2026 14:30",
    relativeTime: "2 days ago",
  },
  {
    id: "N-205",
    title: "Monthly Summary Available",
    message: "Your January 2026 booking summary is ready. You had 42 bookings with a 95% completion rate. View reports for details.",
    type: "system",
    priority: "low",
    read: true,
    timestamp: "Feb 1, 2026 09:00",
    relativeTime: "5 days ago",
  },
  {
    id: "N-206",
    title: "Terminal A Schedule Update",
    message: "Operating hours for Terminal A have been extended to 20:00 effective Feb 3. New time slots are now available for booking.",
    type: "system",
    priority: "medium",
    read: true,
    timestamp: "Feb 2, 2026 08:00",
    relativeTime: "4 days ago",
  },
  {
    id: "N-207",
    title: "Booking BK-2026-0875 Completed",
    message: "Your booking at Terminal A on Feb 1 has been marked as completed. Container MSKU-1123456 processed successfully.",
    type: "booking",
    priority: "low",
    read: true,
    timestamp: "Feb 1, 2026 09:00",
    relativeTime: "5 days ago",
  },
]

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case "booking":
      return <ClipboardList className="h-4 w-4" />
    case "approval":
      return <CheckCircle2 className="h-4 w-4" />
    case "fleet":
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
    booking: { bg: "bg-[hsl(210,65%,45%)]/10", text: "text-[hsl(210,65%,45%)]" },
    approval: { bg: "bg-[hsl(var(--success))]/10", text: "text-[hsl(var(--success))]" },
    fleet: { bg: "bg-[hsl(var(--warning))]/10", text: "text-[hsl(var(--warning))]" },
    system: { bg: "bg-muted", text: "text-muted-foreground" },
  }
  const s = map[type]
  return (
    <Badge className={`border-0 ${s.bg} ${s.text} capitalize`}>
      {type}
    </Badge>
  )
}

export default function CarrierNotificationsPage() {
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
            Booking updates, approvals, and system alerts
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
            <SelectItem value="approval">Approval</SelectItem>
            <SelectItem value="fleet">Fleet</SelectItem>
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

      {/* List */}
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
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markRead(notification.id)} aria-label="Mark as read">
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteNotification(notification.id)} aria-label="Delete notification">
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
