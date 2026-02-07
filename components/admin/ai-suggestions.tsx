"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Lightbulb,
  Clock,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AISuggestion {
  id: string
  type: "insight" | "warning" | "opportunity" | "action"
  title: string
  description: string
  href?: string
  actionLabel?: string
  priority: "high" | "medium" | "low"
  metric?: {
    label: string
    value: string
    trend?: "up" | "down" | "neutral"
  }
}

// Simulated AI suggestions — in production, replace with real API call
const MOCK_SUGGESTIONS: AISuggestion[] = [
  {
    id: "1",
    type: "warning",
    title: "Terminal A Nearing Capacity",
    description:
      "Terminal A is at 87% capacity for tomorrow's morning slots. Consider redistributing bookings to Terminal B which is at 42%.",
    href: "/admin/terminals",
    actionLabel: "View Terminals",
    priority: "high",
    metric: { label: "Capacity", value: "87%", trend: "up" },
  },
  {
    id: "2",
    type: "insight",
    title: "Booking Volume Trending Up",
    description:
      "Booking volume increased 23% compared to the same period last week. Peak hours are shifting to 10:00-12:00.",
    href: "/admin/reports",
    actionLabel: "View Report",
    priority: "medium",
    metric: { label: "Growth", value: "+23%", trend: "up" },
  },
  {
    id: "3",
    type: "opportunity",
    title: "Underutilized Evening Slots",
    description:
      "Evening slots (16:00-20:00) have only 31% utilization. Consider offering incentives to carriers for off-peak bookings.",
    href: "/admin/bookings",
    actionLabel: "View Bookings",
    priority: "medium",
    metric: { label: "Utilization", value: "31%", trend: "down" },
  },
  {
    id: "4",
    type: "action",
    title: "3 Carriers Pending Approval",
    description:
      "New carrier registrations are awaiting review. Average approval time is currently 2.4 days.",
    href: "/admin/carriers",
    actionLabel: "Review Carriers",
    priority: "high",
    metric: { label: "Pending", value: "3", trend: "neutral" },
  },
  {
    id: "5",
    type: "insight",
    title: "Top Carrier Performance",
    description:
      "MaritimeX Logistics has the highest on-time arrival rate at 96%. Consider them for priority slot access.",
    href: "/admin/carriers",
    actionLabel: "View Carriers",
    priority: "low",
    metric: { label: "On-time", value: "96%", trend: "up" },
  },
]

const typeConfig = {
  insight: {
    icon: Lightbulb,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    borderColor: "border-l-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    borderColor: "border-l-amber-500",
  },
  opportunity: {
    icon: TrendingUp,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    borderColor: "border-l-emerald-500",
  },
  action: {
    icon: Clock,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    borderColor: "border-l-purple-500",
  },
}

function SuggestionCard({ suggestion }: { suggestion: AISuggestion }) {
  const config = typeConfig[suggestion.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "group flex gap-3.5 rounded-lg border border-border border-l-[3px] bg-card p-4 transition-all hover:shadow-md hover:bg-muted/30",
        config.borderColor
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          config.iconBg
        )}
      >
        <Icon className={cn("h-4.5 w-4.5", config.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground leading-tight">
            {suggestion.title}
          </h4>
          {suggestion.metric && (
            <div className="flex items-center gap-1 shrink-0 rounded-md bg-muted/60 px-2 py-0.5">
              {suggestion.metric.trend === "up" && (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              )}
              {suggestion.metric.trend === "down" && (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs font-medium text-foreground">
                {suggestion.metric.value}
              </span>
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {suggestion.description}
        </p>
        {suggestion.href && (
          <Link
            href={suggestion.href}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {suggestion.actionLabel ?? "View"}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}

export function AISuggestions() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadSuggestions = async () => {
    // Simulate API call — replace with real endpoint later
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    // Randomly pick 3-4 suggestions to simulate dynamic AI responses
    const shuffled = [...MOCK_SUGGESTIONS].sort(() => Math.random() - 0.5)
    setSuggestions(shuffled.slice(0, 3 + Math.floor(Math.random() * 2)))
    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 600))
    const shuffled = [...MOCK_SUGGESTIONS].sort(() => Math.random() - 0.5)
    setSuggestions(shuffled.slice(0, 3 + Math.floor(Math.random() * 2)))
    setRefreshing(false)
  }

  useEffect(() => {
    loadSuggestions()
  }, [])

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(210,65%,45%)]/15 to-[hsl(185,60%,42%)]/15">
              <Sparkles className="h-4 w-4 text-[hsl(210,65%,45%)]" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                AI Insights
              </CardTitle>
              <CardDescription className="text-xs">
                Smart suggestions based on your data
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh suggestions"
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-border p-4 animate-pulse"
              >
                <div className="h-9 w-9 shrink-0 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Everything looks good! No suggestions right now.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {suggestions.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        )}

        {/* Link to AI chat for deeper analysis */}
        <div className="mt-4 rounded-lg border border-dashed border-border p-3 text-center">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Ask AI for deeper analysis
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
