"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useSocket, useSocketEvent } from "./socket-context"
import { notificationService } from "@/services"
import type { Notification } from "@/services/types"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NewNotificationPayload {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  bookingId?: string
}

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  // Actions
  refetch: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearRead: () => Promise<void>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Context
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const NotificationContext = createContext<NotificationContextValue | null>(null)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Provider
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize notification sound
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/notification.mp3")
      audioRef.current.volume = 0.5
    }
  }, [])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (user hasn't interacted with page yet)
      })
    }
  }, [])

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [notifResponse, count] = await Promise.all([
        notificationService.getNotifications({ limit: 50 }),
        notificationService.getUnreadCount(),
      ])

      setNotifications(notifResponse.notifications)
      setUnreadCount(count)
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err)
      setError(err.message || "Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Handle real-time new notification
  const handleNewNotification = useCallback(
    (payload: NewNotificationPayload) => {
      console.log("📬 New notification received:", payload)

      // Add to notifications list (at the beginning)
      const newNotification: Notification = {
        id: payload.id,
        type: payload.type as any,
        title: payload.title,
        message: payload.message,
        isRead: false,
        readAt: null,
        createdAt: payload.createdAt,
        userId: "", // Will be filled by server, not critical for display
        bookingId: payload.bookingId ?? null,
      }

      setNotifications((prev) => [newNotification, ...prev])
      setUnreadCount((prev) => prev + 1)

      // Play sound
      playNotificationSound()

      // Show browser notification if permission granted
      if (typeof window !== "undefined" && Notification.permission === "granted") {
        new Notification(payload.title, {
          body: payload.message,
          icon: "/favicon.ico",
          tag: payload.id,
        })
      }
    },
    [playNotificationSound]
  )

  // Handle notification read event (from other tabs/devices)
  const handleNotificationRead = useCallback((data: { id: string }) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === data.id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  // Handle all notifications read event
  const handleAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    )
    setUnreadCount(0)
  }, [])

  // Subscribe to socket events
  useSocketEvent("notification:new", handleNewNotification, [handleNewNotification])
  useSocketEvent("notification:read", handleNotificationRead, [handleNotificationRead])
  useSocketEvent("notification:all-read", handleAllRead, [handleAllRead])

  // Request browser notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [])

  // Actions
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      
      const notif = notifications.find((n) => n.id === id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      
      if (notif && !notif.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error("Failed to delete notification:", err)
    }
  }, [notifications])

  const clearRead = useCallback(async () => {
    try {
      await notificationService.clearReadNotifications()
      setNotifications((prev) => prev.filter((n) => !n.isRead))
    } catch (err) {
      console.error("Failed to clear read notifications:", err)
    }
  }, [])

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

/**
 * Hook to get just the unread count (for badges)
 */
export function useUnreadCount() {
  const { unreadCount } = useNotifications()
  return unreadCount
}
