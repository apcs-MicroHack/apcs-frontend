import api from "./axios"
import type { ChatSession } from "./types"

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

export async function sendMessage(
  sessionId: string,
  message: string,
): Promise<{ threadId: string }> {
  const { data } = await api.post(`/chat/sessions/${sessionId}/messages`, {
    message,
  })
  return data
}

export async function getMessages(
  sessionId: string,
): Promise<{ messages: unknown[]; threadId: string }> {
  const { data } = await api.get(`/chat/sessions/${sessionId}/messages`)
  return data
}
