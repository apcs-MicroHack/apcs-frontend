"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Send,
  Plus,
  MessageSquare,
  Anchor,
  Trash2,
  Clock,
  Loader2,
  FileText,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { chatService } from "@/services"
import { TypingIndicator } from "@/components/ui/typing-indicator"
import type { ChatSession } from "@/services/types"

// ── Local UI types ──────────────────────────────────────────
interface UIPayload {
  ui_action?: "OPEN_BOOKING_FORM" | string
  prefill?: {
    date?: string
    time?: string
    terminal?: string
    cargoType?: string
    containerNumber?: string
    isHazardous?: boolean
    specialRequirements?: string
  }
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp: string
  uiPayload?: UIPayload
}

// ── Helpers ─────────────────────────────────────────────────
function timeLabel(iso?: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function nowTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

// ── Parse AI response blocks ────────────────────────────────
interface AIBlock {
  type: "message" | "table"
  text?: string
  headers?: string[]
  rows?: string[][]
}

function parseAIContent(content: string): AIBlock[] {
  try {
    const parsed = JSON.parse(content)
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed.blocks
    }
    // If it's a valid JSON but not in blocks format, return as message
    return [{ type: "message", text: content }]
  } catch {
    // Plain text - return as-is
    return [{ type: "message", text: content }]
  }
}

function AIMessageContent({ content, uiPayload }: { content: string; uiPayload?: UIPayload }) {
  const blocks = parseAIContent(content)

  // Build booking button if uiPayload has OPEN_BOOKING_FORM action
  const showBookingButton = uiPayload?.ui_action === "OPEN_BOOKING_FORM" && uiPayload.prefill
  const bookingUrl = showBookingButton ? (() => {
    const params = new URLSearchParams()
    const p = uiPayload.prefill!
    if (p.terminal) params.set("terminal", p.terminal)
    if (p.date) params.set("date", p.date)
    if (p.time) params.set("startTime", p.time)
    if (p.cargoType) params.set("cargoType", p.cargoType)
    if (p.containerNumber) params.set("containerNumber", p.containerNumber)
    if (p.isHazardous) params.set("isHazardous", "true")
    if (p.specialRequirements) params.set("specialRequirements", p.specialRequirements)
    return `/carrier/create-booking?${params.toString()}`
  })() : null

  return (
    <div className="flex flex-col gap-3 w-full">
      {blocks.map((block, idx) => {
        if (block.type === "table" && block.headers && block.rows) {
          return (
            <div key={idx} className="overflow-x-auto rounded-lg border border-border -mx-1">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-muted/50">
                  <tr>
                    {block.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} className="border-t border-border hover:bg-muted/30 transition-colors">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        // Default: message block with markdown rendering (GFM tables enabled)
        return (
          <div key={idx} className="prose-sm prose-slate dark:prose-invert max-w-none [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:rounded-lg [&_table]:overflow-hidden [&_thead]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:whitespace-nowrap [&_td]:px-3 [&_td]:py-2 [&_td]:whitespace-nowrap [&_td]:border-t [&_td]:border-border [&_tr]:hover:bg-muted/30 [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:break-words">
            <div className="overflow-x-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.text || ""}</ReactMarkdown>
            </div>
          </div>
        )
      })}
      {/* Booking prefill button from uiPayload */}
      {showBookingButton && bookingUrl && (
        <Link
          href={bookingUrl}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Open Booking Form
        </Link>
      )}
    </div>
  )
}

// ── Chat bubble ─────────────────────────────────────────────
function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-primary" : "bg-[hsl(185,60%,42%)]",
        )}
      >
        {isUser ? (
          <span className="text-xs font-semibold text-primary-foreground">U</span>
        ) : (
          <Anchor className="h-4 w-4 text-[hsl(0,0%,100%)]" />
        )}
      </div>
      <div className={cn(
        "flex flex-col gap-1 min-w-0",
        isUser ? "items-end max-w-[75%]" : "items-start max-w-[90%]",
      )}>
        <div
          className={cn(
            "rounded-2xl px-5 py-3 text-sm leading-relaxed min-w-0",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground whitespace-pre-wrap shadow-sm"
              : "rounded-tl-sm border border-border bg-card text-foreground w-full overflow-hidden shadow-sm",
          )}
        >
          {isUser ? message.text : <AIMessageContent content={message.text} uiPayload={message.uiPayload} />}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{message.timestamp}</span>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────
export default function ChatPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  /* Scroll on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* Load sessions on mount */
  useEffect(() => {
    chatService.getChatSessions().then((res) => setSessions(res.sessions)).catch(() => {})
  }, [])

  /* Load messages when switching sessions */
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await chatService.getMessages(sessionId)
      const msgs: ChatMessage[] = (res.messages ?? []).map((m, i) => ({
        id: m.id ?? `msg-${i}`,
        role: m.role === "USER" ? "user" : "assistant",
        text: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
        timestamp: timeLabel(m.createdAt) || "",
        uiPayload: m.uiPayload as UIPayload | undefined,
      }))
      setMessages(msgs)
    } catch {
      setMessages([])
    }
  }, [])

  const selectSession = (id: string) => {
    setActiveSessionId(id)
    loadMessages(id)
  }

  /* Send message */
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const text = inputValue.trim()
    setInputValue("")

    let sessionId = activeSessionId

    /* Create new session if needed */
    if (!sessionId) {
      try {
        const session = await chatService.createChatSession(text.slice(0, 60))
        setSessions((prev) => [session, ...prev])
        sessionId = session.id
        setActiveSessionId(session.id)
      } catch {
        return
      }
    }

    /* Optimistic user message */
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: nowTime(),
    }
    setMessages((prev) => [...prev, userMsg])

    /* Call API */
    setIsLoading(true)
    try {
      const response = await chatService.sendMessage(sessionId, text)
      
      /* Update user message with actual ID and add assistant response */
      setMessages((prev) => {
        // Replace optimistic user message with actual one
        const updated = prev.map((m) =>
          m.id === userMsg.id
            ? {
                id: response.userMessage.id,
                role: "user" as const,
                text: response.userMessage.content,
                timestamp: timeLabel(response.userMessage.createdAt) || nowTime(),
              }
            : m
        )
        // Add assistant response
        return [
          ...updated,
          {
            id: response.assistantMessage.id,
            role: "assistant" as const,
            text: response.assistantMessage.content,
            timestamp: timeLabel(response.assistantMessage.createdAt) || nowTime(),
            uiPayload: response.assistantMessage.uiPayload as UIPayload | undefined,
          },
        ]
      })
      
      // Update session title in sidebar if needed
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, updatedAt: new Date().toISOString(), title: s.title === "New Chat" ? text.slice(0, 50) : s.title }
            : s
        )
      )
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { assistantMessage?: { content?: string } } } }
      // Handle 502 errors which include a fallback assistant message
      if (axiosErr?.response?.status === 502 && axiosErr?.response?.data?.assistantMessage) {
        const fallback = axiosErr.response.data.assistantMessage
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant" as const,
            text: fallback.content ?? "AI service is temporarily unavailable.",
            timestamp: nowTime(),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { id: `e-${Date.now()}`, role: "assistant", text: "Sorry, something went wrong. Please try again.", timestamp: nowTime() },
        ])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setActiveSessionId(null)
    setMessages([])
    setInputValue("")
  }

  const handleDeleteSession = async (id: string) => {
    try {
      await chatService.deleteChatSession(id)
    } catch { /* ignore */ }
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId(null)
      setMessages([])
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "flex h-full flex-col border-r border-border bg-[hsl(215,70%,10%)] transition-all duration-300",
          sidebarOpen ? "w-[300px]" : "w-0 overflow-hidden",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(185,60%,42%)]">
              <Anchor className="h-5 w-5 text-[hsl(0,0%,100%)]" />
            </div>
            <div>
              <h1 className="font-heading text-sm font-bold text-[hsl(0,0%,100%)]">APCS AI</h1>
              <p className="text-[10px] text-[hsl(210,20%,60%)]">Assistant</p>
            </div>
          </div>
        </div>

        <div className="p-3">
          <Button
            onClick={handleNewChat}
            className="w-full gap-2 bg-[hsl(210,65%,45%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(210,65%,50%)]"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="flex flex-col gap-1 pb-3">
            {sessions.map((session) => (
              <div key={session.id} className="group relative">
                <button
                  onClick={() => selectSession(session.id)}
                  className={cn(
                    "flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors",
                    activeSessionId === session.id
                      ? "bg-[hsl(210,65%,45%)]/15 text-[hsl(185,60%,55%)]"
                      : "text-[hsl(210,20%,65%)] hover:bg-[hsl(215,55%,18%)] hover:text-[hsl(210,20%,90%)]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-sm font-medium">
                      {session.title ?? "New Chat"}
                    </span>
                  </div>
                  <span className="mt-0.5 truncate pl-5 text-[11px] text-[hsl(210,20%,50%)]">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[hsl(210,20%,40%)] opacity-0 transition-opacity hover:text-[hsl(var(--destructive))] group-hover:opacity-100"
                  aria-label="Delete chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => router.back()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[hsl(210,20%,65%)] transition-colors hover:bg-[hsl(215,55%,18%)] hover:text-[hsl(210,20%,90%)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portal
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                {activeSession?.title ?? "APCS AI Assistant"}
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" />
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden gap-1.5 text-xs lg:flex"
          >
            <Clock className="h-3.5 w-3.5" />
            History
          </Button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !activeSessionId ? (
            <div className="flex h-full flex-col items-center justify-center px-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(185,60%,42%)]/20 to-[hsl(210,65%,45%)]/20 shadow-lg">
                <Anchor className="h-10 w-10 text-[hsl(185,60%,42%)]" />
              </div>
              <h3 className="mt-6 font-heading text-2xl font-bold text-foreground">
                APCS AI Assistant
              </h3>
              <p className="mt-3 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
                Ask me about bookings, terminal availability, fleet status, capacity, or anything related to your port operations.
              </p>
              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-xl w-full">
                {[
                  { text: "Show me my pending bookings", icon: "📋" },
                  { text: "What terminals are available tomorrow?", icon: "🏗️" },
                  { text: "Give me a fleet status summary", icon: "🚚" },
                  { text: "What can you help me with?", icon: "💡" },
                ].map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => setInputValue(suggestion.text)}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left text-sm text-foreground transition-all hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm"
                  >
                    <span className="text-lg">{suggestion.icon}</span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
              <div className="flex flex-col gap-5">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(185,60%,42%)]">
                      <Anchor className="h-4 w-4 text-[hsl(0,0%,100%)]" />
                    </div>
                    <div className="flex items-center gap-2 rounded-xl rounded-tl-sm border border-border bg-card px-4 py-3">
                      <TypingIndicator user="APCS AI" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-sm p-4">
          <div className="mx-auto max-w-4xl">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="relative flex items-end gap-3 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all"
            >
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about bookings, availability, fleet status..."
                className="min-h-[44px] max-h-[160px] flex-1 resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                rows={1}
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="h-10 w-10 shrink-0 rounded-xl"
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Press Enter to send, Shift+Enter for new line. APCS AI provides information based on your account data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
