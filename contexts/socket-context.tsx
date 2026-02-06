"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { io, Socket } from "socket.io-client"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ConnectionState = "connecting" | "connected" | "disconnected" | "error"

interface SocketContextValue {
  socket: Socket | null
  connectionState: ConnectionState
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  subscribeTerminal: (terminalId: string) => void
  unsubscribeTerminal: (terminalId: string) => void
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Context
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SocketContext = createContext<SocketContextValue | null>(null)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Provider
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const getSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
  try {
    const url = new URL(apiUrl)
    // Socket connects to the origin (protocol + host + port), no path
    return url.origin
  } catch {
    // Fallback if URL parsing fails
    return "http://localhost:8000"
  }
}

const SOCKET_URL = getSocketUrl()

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected")
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (socket?.connected) return

    setConnectionState("connecting")

    const newSocket = io(SOCKET_URL, {
      path: "/socket.io", // Explicitly use default socket.io path
      withCredentials: true, // Send cookies for authentication
      transports: ["websocket", "polling"],
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
    })

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id)
      setConnectionState("connected")
      reconnectAttempts.current = 0
    })

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason)
      setConnectionState("disconnected")
    })

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message)
      reconnectAttempts.current++
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setConnectionState("error")
      } else {
        setConnectionState("connecting")
      }
    })

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts")
      setConnectionState("connected")
    })

    newSocket.on("reconnect_failed", () => {
      console.error("Socket reconnection failed")
      setConnectionState("error")
    })

    setSocket(newSocket)
  }, [socket])

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setConnectionState("disconnected")
    }
  }, [socket])

  const subscribeTerminal = useCallback((terminalId: string) => {
    if (socket?.connected) {
      socket.emit("subscribe:terminal", terminalId)
    }
  }, [socket])

  const unsubscribeTerminal = useCallback((terminalId: string) => {
    if (socket?.connected) {
      socket.emit("unsubscribe:terminal", terminalId)
    }
  }, [socket])

  // Auto-connect on mount
  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const value: SocketContextValue = {
    socket,
    connectionState,
    isConnected: connectionState === "connected",
    connect,
    disconnect,
    subscribeTerminal,
    unsubscribeTerminal,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

/**
 * Subscribe to a specific socket event
 */
export function useSocketEvent<T = any>(
  event: string,
  handler: (data: T) => void,
  deps: React.DependencyList = []
) {
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (!socket || !isConnected) return

    socket.on(event, handler)

    return () => {
      socket.off(event, handler)
    }
  }, [socket, isConnected, event, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps
}
