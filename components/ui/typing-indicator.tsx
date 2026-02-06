"use client"

import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
  user?: string
  className?: string
}

export function TypingIndicator({ user, className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      {user && (
        <span className="text-xs text-muted-foreground">
          {user} is typing...
        </span>
      )}
    </div>
  )
}
