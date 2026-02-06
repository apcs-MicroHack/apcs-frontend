"use client"

import { useState, useRef, useEffect } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ------- Data types -------
type MessageContentType = "text" | "table"

interface TableData {
  headers: string[]
  rows: string[][]
}

interface MessageContent {
  type: MessageContentType
  text?: string
  table?: TableData
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: MessageContent[]
  timestamp: string
}

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  messages: ChatMessage[]
}

// ------- Demo data -------
const demoChatSessions: ChatSession[] = [
  {
    id: "chat-1",
    title: "Booking status inquiry",
    lastMessage: "Here are your pending bookings...",
    timestamp: "Today, 09:15",
    messages: [
      {
        id: "m1",
        role: "user",
        content: [{ type: "text", text: "Show me all my pending bookings" }],
        timestamp: "09:14",
      },
      {
        id: "m2",
        role: "assistant",
        content: [
          { type: "text", text: "Here are your currently pending bookings:" },
          {
            type: "table",
            table: {
              headers: ["Booking ID", "Terminal", "Date", "Time Slot", "Status"],
              rows: [
                ["BK-2026-0891", "Terminal D", "Feb 6, 2026", "10:00 - 11:00", "Pending"],
                ["BK-2026-0919", "Terminal A", "Feb 7, 2026", "08:00 - 09:00", "Pending"],
                ["BK-2026-0920", "Terminal B", "Feb 7, 2026", "14:00 - 15:00", "Pending"],
                ["BK-2026-0921", "Terminal C", "Feb 8, 2026", "06:00 - 07:00", "Pending"],
              ],
            },
          },
          { type: "text", text: "You have 4 bookings currently awaiting operator approval. BK-2026-0891 has been in the queue for 16 hours. Would you like me to provide more details on any of these?" },
        ],
        timestamp: "09:15",
      },
    ],
  },
  {
    id: "chat-2",
    title: "Terminal availability check",
    lastMessage: "Terminal A has good availability tomorrow...",
    timestamp: "Yesterday, 14:30",
    messages: [
      {
        id: "m3",
        role: "user",
        content: [{ type: "text", text: "What terminals have availability tomorrow morning?" }],
        timestamp: "14:28",
      },
      {
        id: "m4",
        role: "assistant",
        content: [
          { type: "text", text: "Here is the availability for tomorrow morning (Feb 7, 2026) across all terminals:" },
          {
            type: "table",
            table: {
              headers: ["Terminal", "06:00-07:00", "07:00-08:00", "08:00-09:00", "09:00-10:00", "10:00-11:00"],
              rows: [
                ["Terminal A", "8 slots", "5 slots", "2 slots", "10 slots", "12 slots"],
                ["Terminal B", "6 slots", "3 slots", "1 slot", "7 slots", "9 slots"],
                ["Terminal C", "12 slots", "10 slots", "8 slots", "15 slots", "14 slots"],
                ["Terminal D", "3 slots", "1 slot", "0 slots", "4 slots", "6 slots"],
              ],
            },
          },
          { type: "text", text: "Terminal A and C have good availability in the morning. Terminal D is nearly full for the 07:00-09:00 period. I recommend booking Terminal C if you need a guaranteed slot." },
        ],
        timestamp: "14:30",
      },
    ],
  },
  {
    id: "chat-3",
    title: "Fleet status overview",
    lastMessage: "Your fleet has 7 active vehicles...",
    timestamp: "Feb 4, 16:00",
    messages: [
      {
        id: "m5",
        role: "user",
        content: [{ type: "text", text: "Give me a summary of my fleet status" }],
        timestamp: "15:58",
      },
      {
        id: "m6",
        role: "assistant",
        content: [
          { type: "text", text: "Here is a summary of your fleet status:" },
          {
            type: "table",
            table: {
              headers: ["Vehicle", "Model", "Status", "Driver", "Bookings (MTD)"],
              rows: [
                ["00216-142-AB", "Scania R450", "Active", "Karim Bouzid", "14"],
                ["00216-142-MN", "Volvo FH16", "Active", "Adel Khelifi", "11"],
                ["00216-142-WX", "MAN TGX", "Active", "Noureddine Ait", "8"],
                ["00216-142-FF", "DAF XF", "Maintenance", "Rachid Hamdi", "0"],
                ["00216-142-GG", "Mercedes Actros", "Active", "Said Bennour", "7"],
                ["00216-142-HH", "Renault T480", "Active", "Omar Belkacem", "5"],
                ["00216-142-JJ", "Iveco S-Way", "Active", "Farid Zaidi", "4"],
                ["00216-142-KK", "Scania S500", "Inactive", "-", "0"],
              ],
            },
          },
          { type: "text", text: "You have 6 active vehicles, 1 in maintenance (DAF XF, expected back Feb 8), and 1 inactive. Your most utilized vehicle this month is the Scania R450 with 14 bookings." },
        ],
        timestamp: "16:00",
      },
    ],
  },
]

// ------- Simulated responses -------
const botResponses: Record<string, MessageContent[]> = {
  default: [
    { type: "text", text: "I can help you with booking management, terminal availability, fleet status, capacity information, and general port operations. Feel free to ask me anything about your APCS account." },
  ],
  booking: [
    { type: "text", text: "Here is a summary of your recent bookings:" },
    {
      type: "table",
      table: {
        headers: ["ID", "Terminal", "Date", "Status"],
        rows: [
          ["BK-2026-0892", "Terminal A", "Feb 6", "Approved"],
          ["BK-2026-0891", "Terminal D", "Feb 6", "Pending"],
          ["BK-2026-0890", "Terminal B", "Feb 6", "Approved"],
        ],
      },
    },
    { type: "text", text: "You have 2 approved bookings and 1 pending for today. Would you like to create a new booking or see more details?" },
  ],
  capacity: [
    { type: "text", text: "Current terminal capacity overview:" },
    {
      type: "table",
      table: {
        headers: ["Terminal", "Used", "Available", "Utilization"],
        rows: [
          ["Terminal A", "17/20", "3", "85%"],
          ["Terminal B", "12/20", "8", "60%"],
          ["Terminal C", "8/20", "12", "40%"],
          ["Terminal D", "19/20", "1", "95%"],
        ],
      },
    },
    { type: "text", text: "Terminal D is nearly at capacity. I recommend Terminal B or C for your next booking if timing allows." },
  ],
  help: [
    { type: "text", text: "Here are the things I can help you with:\n\n- **Booking Management**: View, create, or check status of your bookings\n- **Terminal Availability**: Check real-time slot availability across terminals\n- **Fleet Status**: Overview of your vehicles, drivers, and maintenance schedules\n- **Capacity Info**: Current and forecasted terminal utilization\n- **Reports**: Quick summaries of your booking statistics\n- **General Questions**: Port operating hours, rules, and guidelines\n\nJust ask me in natural language and I will do my best to assist you." },
  ],
}

function getResponse(input: string): MessageContent[] {
  const lower = input.toLowerCase()
  if (lower.includes("booking") || lower.includes("reservation") || lower.includes("status")) {
    return botResponses.booking
  }
  if (lower.includes("capacity") || lower.includes("slot") || lower.includes("availability") || lower.includes("terminal")) {
    return botResponses.capacity
  }
  if (lower.includes("help") || lower.includes("what can") || lower.includes("how")) {
    return botResponses.help
  }
  return botResponses.default
}

// ------- Components -------
function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className={cn(
        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        isUser ? "bg-primary" : "bg-[hsl(185,60%,42%)]"
      )}>
        {isUser ? (
          <span className="text-xs font-semibold text-primary-foreground">MT</span>
        ) : (
          <Anchor className="h-4 w-4 text-[hsl(0,0%,100%)]" />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex max-w-[75%] flex-col gap-2", isUser ? "items-end" : "items-start")}>
        {message.content.map((block, idx) => {
          if (block.type === "text" && block.text) {
            return (
              <div
                key={idx}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-card text-foreground border border-border"
                )}
              >
                {block.text.split("\n").map((line, i) => {
                  // Simple bold handling
                  const parts = line.split(/(\*\*[^*]+\*\*)/)
                  return (
                    <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                      {parts.map((part, j) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                        ) : (
                          <span key={j}>{part}</span>
                        )
                      )}
                    </p>
                  )
                })}
              </div>
            )
          }
          if (block.type === "table" && block.table) {
            return (
              <div key={idx} className="w-full overflow-hidden rounded-lg border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {block.table.headers.map((header) => (
                        <TableHead key={header} className="px-3 py-2 text-[11px] uppercase tracking-wider">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {block.table.rows.map((row, rowIdx) => (
                      <TableRow key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx} className="px-3 py-2 text-xs text-foreground">
                            {cell === "Pending" ? (
                              <Badge className="border-0 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">{cell}</Badge>
                            ) : cell === "Approved" || cell === "Active" || cell === "Completed" ? (
                              <Badge className="border-0 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">{cell}</Badge>
                            ) : cell === "Maintenance" ? (
                              <Badge className="border-0 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">{cell}</Badge>
                            ) : cell === "Inactive" || cell === "Rejected" ? (
                              <Badge className="border-0 bg-muted text-muted-foreground">{cell}</Badge>
                            ) : (
                              cell
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          }
          return null
        })}
        <span className="text-[10px] text-muted-foreground">{message.timestamp}</span>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(demoChatSessions)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const messages = activeSession?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content: [{ type: "text", text: inputValue.trim() }],
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    }

    const currentInput = inputValue.trim()
    setInputValue("")

    if (!activeSessionId) {
      // Create new session
      const newSession: ChatSession = {
        id: `chat-${Date.now()}`,
        title: currentInput.slice(0, 40) + (currentInput.length > 40 ? "..." : ""),
        lastMessage: currentInput,
        timestamp: "Just now",
        messages: [userMsg],
      }
      setSessions((prev) => [newSession, ...prev])
      setActiveSessionId(newSession.id)

      // Simulate bot response
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const botResponse: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: "assistant",
        content: getResponse(currentInput),
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === newSession.id
            ? { ...s, messages: [...s.messages, botResponse], lastMessage: "Responded" }
            : s
        )
      )
      setIsLoading(false)
    } else {
      // Add to existing session
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, userMsg], lastMessage: currentInput }
            : s
        )
      )

      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const botResponse: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: "assistant",
        content: getResponse(currentInput),
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, botResponse], lastMessage: "Responded" }
            : s
        )
      )
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setActiveSessionId(null)
    setInputValue("")
  }

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId(null)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Chat History */}
      <div
        className={cn(
          "flex h-full flex-col border-r border-border bg-[hsl(215,70%,10%)] transition-all duration-300",
          sidebarOpen ? "w-[300px]" : "w-0 overflow-hidden"
        )}
      >
        {/* Sidebar Header */}
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

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={handleNewChat}
            className="w-full gap-2 bg-[hsl(210,65%,45%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(210,65%,50%)]"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Session List */}
        <ScrollArea className="flex-1 px-3">
          <div className="flex flex-col gap-1 pb-3">
            {sessions.map((session) => (
              <div key={session.id} className="group relative">
                <button
                  onClick={() => setActiveSessionId(session.id)}
                  className={cn(
                    "flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors",
                    activeSessionId === session.id
                      ? "bg-[hsl(210,65%,45%)]/15 text-[hsl(185,60%,55%)]"
                      : "text-[hsl(210,20%,65%)] hover:bg-[hsl(215,55%,18%)] hover:text-[hsl(210,20%,90%)]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-sm font-medium">{session.title}</span>
                  </div>
                  <span className="mt-0.5 truncate pl-5 text-[11px] text-[hsl(210,20%,50%)]">
                    {session.timestamp}
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

        {/* Back link */}
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/carrier"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[hsl(210,20%,65%)] transition-colors hover:bg-[hsl(215,55%,18%)] hover:text-[hsl(210,20%,90%)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portal
          </Link>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
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
                {activeSession ? activeSession.title : "APCS AI Assistant"}
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" />
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden gap-1.5 text-xs lg:flex"
            >
              <Clock className="h-3.5 w-3.5" />
              History
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
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
                    onClick={() => {
                      setInputValue(suggestion)
                    }}
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
                {messages.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(185,60%,42%)]">
                      <Anchor className="h-4 w-4 text-[hsl(0,0%,100%)]" />
                    </div>
                    <div className="flex items-center gap-2 rounded-xl rounded-tl-sm border border-border bg-card px-4 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t border-border bg-background p-4">
          <div className="mx-auto max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
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
