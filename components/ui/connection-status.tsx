"use client"

import * as React from "react"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ConnectionStatusProps {
  className?: string
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = React.useState(true)
  const [wasOffline, setWasOffline] = React.useState(false)

  React.useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        // Show reconnected state briefly
        setTimeout(() => setWasOffline(false), 3000)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [wasOffline])

  if (isOnline && !wasOffline) {
    return null // Don't show indicator when everything is normal
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors",
              isOnline
                ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                : "bg-destructive/10 text-destructive animate-pulse",
              className
            )}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>Reconnected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isOnline
            ? "Connection restored. Data will sync automatically."
            : "You're offline. Changes will sync when connection is restored."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
