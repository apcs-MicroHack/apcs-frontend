import api from "./axios"
import type { ChatSession, ChatMessage } from "./types"

// ── List sessions ────────────────────────────────────────────

export async function getChatSessions(params?: {
  limit?: number
  offset?: number
}): Promise<{ sessions: ChatSession[]; pagination: { total: number } }> {
  const { data } = await api.get("/chat/sessions", { params })
  return data
}

// ── Single session ───────────────────────────────────────────

export async function getChatSession(id: string): Promise<ChatSession> {
  const { data } = await api.get(`/chat/sessions/${id}`)
  return data.session
}

// ── Create session ───────────────────────────────────────────

export async function createChatSession(
  title?: string,
): Promise<ChatSession> {
  const { data } = await api.post("/chat/sessions", { title })
  return data.session
}

// ── Update session title ─────────────────────────────────────

export async function updateChatSession(
  id: string,
  title: string,
): Promise<ChatSession> {
  const { data } = await api.put(`/chat/sessions/${id}`, { title })
  return data.session
}

// ── Delete session ───────────────────────────────────────────

export async function deleteChatSession(id: string): Promise<void> {
  await api.delete(`/chat/sessions/${id}`)
}

// ── Messages ─────────────────────────────────────────────────

export interface SendMessageResponse {
  userMessage: ChatMessage
  assistantMessage: ChatMessage
  error?: string
}

export async function sendMessage(
  sessionId: string,
  message: string,
): Promise<SendMessageResponse> {
  const { data } = await api.post(`/chat/sessions/${sessionId}/messages`, {
    message,
  })
  return data
}

export async function getMessages(
  sessionId: string,
): Promise<{ messages: ChatMessage[]; pagination: { total: number; limit: number; offset: number } }> {
  const { data } = await api.get(`/chat/sessions/${sessionId}/messages`)
  return data
}
