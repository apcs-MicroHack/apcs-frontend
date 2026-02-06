"use client"

import React from "react"
import { Toaster } from "sonner"
import { SocketProvider, NotificationProvider } from "@/contexts"
import { NotificationToaster } from "@/components/notifications/notification-toaster"

interface RealtimeProviderProps {
  children: React.ReactNode
}

/**
 * Wraps children with Socket.IO and Notification providers
 * for real-time notifications and updates
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  return (
    <SocketProvider>
      <NotificationProvider>
        <NotificationToaster />
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            className: "border-border",
          }}
        />
        {children}
      </NotificationProvider>
    </SocketProvider>
  )
}
