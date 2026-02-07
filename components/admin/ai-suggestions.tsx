"use client"

import { useState, useEffect, useCallback } from "react"
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
  RefreshCw,
  ArrowRight,
  BarChart3,
  AlertCircle,
  Clock,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { api } from "@/services"

// ── Types matching the real API response ────────────────────
interface AISuggestion {
  priority: "high" | "medium" | "low"
  icon: string
  category: string
  terminal: string
  suggestion: string
}

interface SuggestionsResponse {
  suggestions: AISuggestion[]
  generatedAt: string
  cached: boolean
}

// ── Priority styling config ─────────────────────────────────
const priorityConfig: Record<
  string,
  { border: string; bg: string; badge: string; badgeText: string }
> = {
  high: {
    border: "border-l-red-500",
    bg: "hover:bg-red-500/5",
    badge: "bg-red-100 dark:bg-red-500/15",
    badgeText: "text-red-700 dark:text-red-400",
  },
  medium: {
    border: "border-l-amber-500",
    bg: "hover:bg-amber-500/5",
    badge: "bg-amber-100 dark:bg-amber-500/15",
    badgeText: "text-amber-700 dark:text-amber-400",
  },
  low: {
    border: "border-l-emerald-500",
    bg: "hover:bg-emerald-500/5",
    badge: "bg-emerald-100 dark:bg-emerald-500/15",
    badgeText: "text-emerald-700 dark:text-emerald-400",
  },
}

// ── Suggestion card ─────────────────────────────────────────
function SuggestionCard({ item }: { item: AISuggestion }) {
  const config = priorityConfig[item.priority] ?? priorityConfig.low

  return (
    <div
      className={cn(
        "group rounded-lg border border-border border-l-[3px] p-4 transition-all hover:shadow-sm",
        config.border,
        config.bg
      )}
    >
      {/* Top row: icon + category + priority badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none shrink-0" role="img">
            {item.icon}
          </span>
          <span className="text-xs font-semibold text-foreground truncate">
            {item.category}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            config.badge,
            config.badgeText
          )}
        >
          {item.priority}
        </span>
      </div>

      {/* Terminal */}
      <div className="flex items-center gap-1.5 mb-2">
        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground font-medium truncate">
          {item.terminal}
        </span>
      </div>

      {/* Suggestion text */}
      <p className="text-sm leading-relaxed text-foreground/90">
        {item.suggestion}
      </p>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────
export function AISuggestions() {
  const [data, setData] = useState<SuggestionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const res = await api.get<SuggestionsResponse>("/suggestions")
      setData(res.data)
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load AI suggestions"
      setError(msg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  const suggestions = data?.suggestions ?? []
  const highCount = suggestions.filter((s) => s.priority === "high").length
  const mediumCount = suggestions.filter((s) => s.priority === "medium").length
  const lowCount = suggestions.filter((s) => s.priority === "low").length

  const generatedLabel = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleString()
    : null

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
                Smart suggestions based on your capacity data
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data?.cached && (
              <span className="text-[10px] text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
                cached
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fetchSuggestions(true)}
              disabled={refreshing || loading}
              aria-label="Refresh suggestions"
            >
              <RefreshCw
                className={cn("h-4 w-4", refreshing && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        {/* Priority summary pills */}
        {!loading && !error && suggestions.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {highCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-500/15 px-2.5 py-0.5 text-[11px] font-medium text-red-700 dark:text-red-400">
                🔴 {highCount} high
              </span>
            )}
            {mediumCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                🟡 {mediumCount} medium
              </span>
            )}
            {lowCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                🟢 {lowCount} low
              </span>
            )}
            <span className="text-[10px] text-muted-foreground ml-auto">
              {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border border-l-[3px] border-l-muted p-4 animate-pulse"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded bg-muted" />
                    <div className="h-3.5 w-24 rounded bg-muted" />
                  </div>
                  <div className="h-4 w-14 rounded-full bg-muted" />
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="h-3 w-3 rounded bg-muted" />
                  <div className="h-3 w-32 rounded bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full rounded bg-muted" />
                  <div className="h-3.5 w-3/4 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive/60" />
            <div>
              <p className="text-sm font-medium text-destructive">{error}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                AI suggestions are temporarily unavailable.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 gap-1.5 text-xs"
              onClick={() => fetchSuggestions()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {/* Suggestions list */}
        {!loading && !error && suggestions.length > 0 && (
          <>
            <div className="flex flex-col gap-3">
              {suggestions.map((item, i) => (
                <SuggestionCard key={`${item.terminal}-${i}`} item={item} />
              ))}
            </div>

            {/* Timestamp */}
            {generatedLabel && (
              <div className="mt-3 flex items-center justify-end gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  {generatedLabel}
                </span>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && !error && suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              No suggestions available right now. Try refreshing.
            </p>
          </div>
        )}

        {/* Link to AI chat */}
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
