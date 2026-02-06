import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface TrendIndicatorProps {
  value: number // Percentage change
  showLabel?: boolean
  className?: string
}

export function TrendIndicator({
  value,
  showLabel = true,
  className,
}: TrendIndicatorProps) {
  const isPositive = value > 0
  const isNegative = value < 0
  const isNeutral = value === 0

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        isPositive && "text-[hsl(var(--success))]",
        isNegative && "text-destructive",
        isNeutral && "text-muted-foreground",
        className
      )}
    >
      {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
      {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
      {isNeutral && <Minus className="h-3.5 w-3.5" />}
      {showLabel && (
        <span>
          {isPositive && "+"}
          {value.toFixed(1)}%
        </span>
      )}
    </div>
  )
}

interface TrendComparisonProps {
  current: number
  previous: number
  label?: string
  className?: string
}

export function TrendComparison({
  current,
  previous,
  label = "vs last week",
  className,
}: TrendComparisonProps) {
  const change = previous === 0 ? 0 : ((current - previous) / previous) * 100

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <TrendIndicator value={change} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
