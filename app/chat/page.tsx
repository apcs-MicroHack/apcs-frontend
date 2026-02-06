"use client"

import { useState, useRef, useEffect, useCallback } from "react"
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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { chatService } from "@/services"
import { TypingIndicator } from "@/components/ui/typing-indicator"
import type { ChatSession } from "@/services/types"

// ── Local UI types ──────────────────────────────────────────
interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp: string
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
      <div className={cn("flex max-w-[75%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border bg-card text-foreground",
          )}
        >
          {message.text}
        </div>
        <span className="text-[10px] text-muted-foreground">{message.timestamp}</span>
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
      const msgs: ChatMessage[] = (res.messages ?? []).map((m: any, i: number) => ({
        id: m.id ?? `msg-${i}`,
        role: m.role === "user" ? "user" : "assistant",
        text: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
        timestamp: timeLabel(m.createdAt) || "",
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
      await chatService.sendMessage(sessionId, text)
      /* Reload messages to get the AI response */
      await loadMessages(sessionId)
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "assistant", text: "Sorry, something went wrong. Please try again.", timestamp: nowTime() },
      ])
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
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(185,60%,42%)]/10">
                <Anchor className="h-8 w-8 text-[hsl(185,60%,42%)]" />
              </div>
              <h3 className="mt-6 font-heading text-xl font-bold text-foreground">
                APCS AI Assistant
              </h3>
              <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
                Ask me about bookings, terminal availability, fleet status, capacity, or anything related to your port operations.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Show me my pending bookings",
                  "What terminals are available tomorrow?",
                  "Give me a fleet status summary",
                  "What can you help me with?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted/50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-6 py-6">
              <div className="flex flex-col gap-6">
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
        <div className="shrink-0 border-t border-border bg-background p-4">
          <div className="mx-auto max-w-3xl">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex items-center gap-3"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about bookings, availability, fleet status..."
                className="h-11 flex-1 bg-muted/50 text-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="h-11 w-11 shrink-0 p-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              APCS AI provides information based on your account data. Verify critical details with the operator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
