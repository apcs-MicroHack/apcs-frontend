"use client"

import * as React from "react"
import { RefreshCw, Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AutoRefreshProps {
  onRefresh: () => void
  intervalOptions?: number[] // in seconds
  defaultInterval?: number
  className?: string
}

export function AutoRefresh({
  onRefresh,
  intervalOptions = [30, 60, 120, 300],
  defaultInterval = 60,
  className,
}: AutoRefreshProps) {
  const [interval, setInterval] = React.useState(defaultInterval)
  const [countdown, setCountdown] = React.useState(defaultInterval)
  const [isPaused, setIsPaused] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  React.useEffect(() => {
    if (isPaused) return

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefresh()
          return interval
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [interval, isPaused])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setIsRefreshing(false)
    setCountdown(interval)
  }

  const handleManualRefresh = () => {
    handleRefresh()
  }

  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
    }
    return `${seconds}s`
  }

  const formatInterval = (seconds: number) => {
    if (seconds >= 60) {
      return `${seconds / 60} min`
    }
    return `${seconds}s`
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPaused ? "Resume auto-refresh" : "Pause auto-refresh"}
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5",
                  isRefreshing && "animate-spin"
                )}
              />
              {isPaused ? (
                <span className="text-muted-foreground">Paused</span>
              ) : (
                <span className="tabular-nums">{formatTime(countdown)}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {intervalOptions.map((opt) => (
              <DropdownMenuItem
                key={opt}
                onClick={() => {
                  setInterval(opt)
                  setCountdown(opt)
                  setIsPaused(false)
                }}
                className={cn(interval === opt && "bg-accent")}
              >
                Refresh every {formatInterval(opt)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5",
                  isRefreshing && "animate-spin"
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh now</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
