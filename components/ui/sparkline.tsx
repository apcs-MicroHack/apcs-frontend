"use client"

import { cn } from "@/lib/utils"

interface SparklineProps {
  data: number[]
  color?: string
  className?: string
  height?: number
  showArea?: boolean
}

export function Sparkline({
  data,
  color = "hsl(var(--primary))",
  className,
  height = 32,
  showArea = true,
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const width = 100
  const padding = 2

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((value - min) / range) * (height - 2 * padding)
    return { x, y }
  })

  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full", className)}
      preserveAspectRatio="none"
      style={{ height }}
    >
      {showArea && (
        <path
          d={areaD}
          fill={color}
          fillOpacity={0.1}
        />
      )}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot at last point */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2}
        fill={color}
      />
    </svg>
  )
}
