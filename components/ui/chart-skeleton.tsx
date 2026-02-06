import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

interface ChartSkeletonProps {
  type?: "bar" | "line" | "pie" | "area"
  className?: string
  height?: number
}

export function ChartSkeleton({
  type = "bar",
  className,
  height = 200,
}: ChartSkeletonProps) {
  if (type === "pie") {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <Skeleton className="h-40 w-40 rounded-full" />
      </div>
    )
  }

  if (type === "line" || type === "area") {
    return (
      <div className={cn("flex flex-col gap-2", className)} style={{ height }}>
        <div className="flex items-end justify-between gap-2 flex-1">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between h-full py-2">
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-6" />
          </div>
          {/* Chart area with wave pattern */}
          <div className="flex-1 relative">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 50"
              preserveAspectRatio="none"
            >
              <path
                d="M0,40 Q25,20 50,30 T100,25"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="2"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>
        {/* X-axis labels */}
        <div className="flex justify-between px-8">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    )
  }

  // Bar chart skeleton
  return (
    <div className={cn("flex flex-col gap-2", className)} style={{ height }}>
      <div className="flex items-end justify-between gap-2 flex-1 px-4">
        {[65, 40, 80, 55, 70, 45, 85].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 max-w-12 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between px-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-6" />
        ))}
      </div>
    </div>
  )
}
