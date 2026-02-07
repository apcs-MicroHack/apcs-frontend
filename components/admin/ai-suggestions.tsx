"use client"

import { useState, useEffect, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
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
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { api } from "@/services"

interface SuggestionsResponse {
  suggestions: unknown
  generatedAt: string
  cached: boolean
}

/** Normalize suggestions to a markdown string regardless of what the API returns */
function normalizeSuggestions(raw: unknown): string {
  if (typeof raw === "string") return raw
  if (Array.isArray(raw)) {
    return raw
      .map((item, i) => {
        if (typeof item === "string") return item
        if (typeof item === "object" && item !== null) {
          const obj = item as Record<string, unknown>
          // Try common field names for title/description shaped objects
          const title = obj.title ?? obj.name ?? obj.label ?? ""
          const desc = obj.description ?? obj.message ?? obj.text ?? obj.content ?? ""
          const type = obj.type ?? obj.category ?? ""
          const priority = obj.priority ?? ""
          const metric = obj.metric as Record<string, unknown> | undefined

          let line = `### ${title || `Suggestion ${i + 1}`}`
          if (type) line += `  \n**Type:** ${type}`
          if (priority) line += ` · **Priority:** ${priority}`
          if (metric) {
            const metricLabel = metric.label ?? ""
            const metricValue = metric.value ?? ""
            const metricTrend = metric.trend ?? ""
            if (metricLabel || metricValue)
              line += ` · **${metricLabel}:** ${metricValue}${metricTrend ? ` (${metricTrend})` : ""}`
          }
          if (desc) line += `\n\n${desc}`
          return line
        }
        return String(item)
      })
      .join("\n\n---\n\n")
  }
  if (typeof raw === "object" && raw !== null) {
    return JSON.stringify(raw, null, 2)
  }
  return String(raw ?? "")
}

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

  const generatedLabel = data?.generatedAt
    ? `Generated ${new Date(data.generatedAt).toLocaleString()}`
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
                Smart suggestions based on your data
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
      </CardHeader>
      <CardContent>
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border p-4 animate-pulse"
              >
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
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

        {/* Content */}
        {!loading && !error && data?.suggestions && (
          <>
            <div className="rounded-lg border border-border bg-muted/20 p-5">
              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:rounded-lg [&_thead]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:px-3 [&_td]:py-2 [&_td]:border-t [&_td]:border-border [&_tr]:hover:bg-muted/30 [&_pre]:overflow-x-auto [&_code]:break-words [&_ul]:space-y-1 [&_ol]:space-y-1 [&_li]:text-sm [&_p]:text-sm [&_p]:leading-relaxed [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_strong]:text-foreground [&_blockquote]:border-l-primary/50 [&_blockquote]:text-muted-foreground">
                <div className="overflow-x-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {normalizeSuggestions(data.suggestions)}
                  </ReactMarkdown>
                </div>
              </div>
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

        {/* No data state */}
        {!loading && !error && !data?.suggestions && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              No suggestions available right now. Try refreshing.
            </p>
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
