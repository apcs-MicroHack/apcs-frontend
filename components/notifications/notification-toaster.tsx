"use client"

import React, { useEffect } from "react"
import { toast } from "sonner"
import { useSocketEvent } from "@/contexts/socket-context"
import { Bell, Package, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"

interface NotificationPayload {
  id: string
  type: string
  title: string
  message: string
  bookingId?: string
}

interface BookingEventPayload {
  id: string
  bookingNumber: string
  status: string
  terminalName?: string
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  BOOKING_CREATED: <Package className="h-4 w-4" />,
  BOOKING_CONFIRMED: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  BOOKING_REJECTED: <XCircle className="h-4 w-4 text-red-500" />,
  BOOKING_CANCELLED: <AlertTriangle className="h-4 w-4 text-gray-500" />,
  BOOKING_REMINDER: <Clock className="h-4 w-4 text-blue-500" />,
  CAPACITY_WARNING: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  CAPACITY_FULL: <AlertTriangle className="h-4 w-4 text-red-500" />,
  SYSTEM_ALERT: <AlertTriangle className="h-4 w-4 text-red-500" />,
}

/**
 * Listens to socket events and shows toast notifications
 * Should be rendered once in a layout
 */
export function NotificationToaster() {
  // Listen for new notifications
  useSocketEvent<NotificationPayload>("notification:new", (payload) => {
    const Icon = TYPE_ICONS[payload.type] || <Bell className="h-4 w-4" />

    toast(payload.title, {
      description: payload.message,
      icon: Icon,
      duration: 5000,
      action: payload.bookingId
        ? {
            label: "View",
            onClick: () => {
              window.location.href = `/carrier/bookings?highlight=${payload.bookingId}`
            },
          }
        : undefined,
    })
  })

  // Listen for booking status changes
  useSocketEvent<BookingEventPayload>("booking:status-changed", (payload) => {
    const statusMessages: Record<string, { title: string; variant: "success" | "error" | "warning" | "info" }> = {
      CONFIRMED: { title: "Booking Confirmed", variant: "success" },
      REJECTED: { title: "Booking Rejected", variant: "error" },
      CANCELLED: { title: "Booking Cancelled", variant: "warning" },
      CONSUMED: { title: "Booking Completed", variant: "success" },
      EXPIRED: { title: "Booking Expired", variant: "warning" },
    }

    const config = statusMessages[payload.status]
    if (config) {
      const toastFn = config.variant === "success" ? toast.success
        : config.variant === "error" ? toast.error
        : config.variant === "warning" ? toast.warning
        : toast.info

      toastFn(config.title, {
        description: `Booking ${payload.bookingNumber}`,
        duration: 4000,
      })
    }
  })

  // Listen for capacity warnings (operators/admins)
  useSocketEvent<{ terminalName: string; utilizationPercent: number; date: string }>(
    "capacity:warning",
    (payload) => {
      toast.warning("Capacity Warning", {
        description: `${payload.terminalName} is at ${payload.utilizationPercent}% capacity for ${payload.date}`,
        duration: 6000,
      })
    }
  )

  // Listen for new bookings (operators)
  useSocketEvent<{ bookingNumber: string; carrierName: string; terminalName: string }>(
    "booking:new",
    (payload) => {
      toast.info("New Booking Request", {
        description: `${payload.carrierName} requested a slot at ${payload.terminalName}`,
        duration: 5000,
        action: {
          label: "Review",
          onClick: () => {
            window.location.href = "/operator/queue"
          },
        },
      })
    }
  )

  return null
}
